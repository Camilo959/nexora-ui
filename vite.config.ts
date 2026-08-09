import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // El public/ es del playground (favicon, iconos); no tiene por qué viajar en el paquete.
    copyPublicDir: false,
    // Tres entradas: los componentes, la capa de datos y el CSS. `portal` va aparte para
    // que quien solo quiera los componentes no arrastre el transporte.
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/components/iot/index.ts"),
        portal: path.resolve(__dirname, "src/portal/index.ts"),
        styles: path.resolve(__dirname, "src/styles.ts"),
      },
      formats: ["es"],
      cssFileName: "styles",
    },
    rollupOptions: {
      // Todo lo que no sea código propio se deja fuera: React lo pone el consumidor (dos
      // copias de React rompen los hooks), y empaquetar lucide-react entero para los
      // cinco iconos que se usan sería absurdo.
      //
      // `@/` es alias interno, no un paquete. Sin esta excepción se marcaba como externo
      // y el dist publicado quedaba importando "@/components/iot", que en casa del
      // consumidor no existe. Solo se ve instalando el paquete de verdad.
      external: (id) =>
        !id.startsWith(".") && !id.startsWith("@/") && !path.isAbsolute(id),
    },
  },
})
