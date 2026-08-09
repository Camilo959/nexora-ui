/**
 * Revisa el `dist/` antes de que salga por la puerta.
 *
 *     node scripts/check-dist.mjs
 *
 * Existe porque los dos únicos fallos que ha tenido este paquete no se veían mirando
 * el `dist`: se veían instalándolo. El alias `@/` se publicó sin resolver y los tipos
 * llegaron a no existir. Ninguna de las dos cosas rompe el build.
 *
 * El alias es especialmente traicionero: si el consumidor tiene configurado el mismo
 * `@/` —y cualquier proyecto de shadcn lo tiene—, resuelve por accidente y el fallo
 * solo aparece en casa de otro.
 */

import { readFileSync } from "node:fs"
import { glob } from "node:fs/promises"

const fallos = []
const archivos = []
for await (const archivo of glob("dist/**/*.{js,d.ts}")) archivos.push(archivo)

// 1. Nada de alias internos: en casa del consumidor `@/` no existe.
for (const archivo of archivos) {
  const texto = readFileSync(archivo, "utf8")
  for (const [, especificador] of texto.matchAll(/from\s*"([^"]+)"/g)) {
    if (especificador.startsWith("@/")) {
      fallos.push(`${archivo} importa "${especificador}" — alias interno sin resolver`)
    }
  }
}

// 2. Las tres entradas del package.json tienen que existir de verdad.
const paquete = JSON.parse(readFileSync("package.json", "utf8"))
for (const [entrada, destino] of Object.entries(paquete.exports)) {
  for (const ruta of Object.values(typeof destino === "string" ? { d: destino } : destino)) {
    try {
      readFileSync(ruta)
    } catch {
      fallos.push(`exports["${entrada}"] apunta a ${ruta}, que no se generó`)
    }
  }
}

if (fallos.length) {
  console.error("dist/ no es publicable:")
  for (const fallo of fallos) console.error(`  - ${fallo}`)
  process.exit(1)
}
console.log(`dist/ ok — ${archivos.length} archivos, sin alias sin resolver`)
