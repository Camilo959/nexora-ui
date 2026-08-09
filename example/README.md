# Estación meteorológica

La app de ejemplo de `nexora-iot-ui`. Un ESP32 con un DHT11 que emite temperatura y
humedad cada dos segundos, y un motor paso a paso que el panel arranca y detiene.

Consume el paquete **desde npm**, como lo haría cualquiera. No importa nada del código
fuente de la librería, así que si funciona aquí funciona en tu proyecto.

## Arrancar

Hacen falta tres cosas: este frontend, un servidor que acuñe tokens y un dispositivo que
hable. Las dos últimas están en el repo de la aplicación,
[Camilo959/Nexora](https://github.com/Camilo959/Nexora), en `portal-hardware/`.

```bash
# terminal 1 — acuña tokens de Portal y guarda la API key
cd Nexora/portal-hardware && python demo_server.py

# terminal 2 — un ESP32 simulado, si no tienes la placa a mano
python sim_esp32.py

# terminal 3 — este ejemplo
npm install && npm run dev
```

En http://localhost:5173. Vite proxea `/token` al servidor del puerto 8080.

Con una placa de verdad, cambia el terminal 2 por tu dispositivo hablando el vocabulario
de [`docs/PROTOCOLO.md`](../docs/PROTOCOLO.md) — `portal_device.py` es la implementación
de referencia.

## Qué mirar en el código

Son tres archivos. [`src/main.tsx`](src/main.tsx) monta el proveedor y le dice de dónde
sacar el token. [`src/App.tsx`](src/App.tsx) es la pantalla.
[`src/components/Sparkline.tsx`](src/components/Sparkline.tsx) es el gráfico, que lo pone
la app y no la librería.

Lo que merece la pena leer en `App.tsx`:

- **Los botones leen el hardware, no el clic.** `running` sale de la telemetría de la
  placa. Pulsar «arrancar» no mueve nada en pantalla: lo mueve la lectura siguiente,
  cuando el motor confirma que gira.
- **`offline` es `status !== "live" || stale`.** Que el canal esté abierto no significa
  que la placa esté viva. Sin dispositivo, los botones se deshabilitan.
- **El badge distingue cuatro estados**, no dos: conectando, sin conexión, sin datos y en
  vivo. «Sin datos» es el caso que casi nadie modela y el que más engaña.
- **La librería no sabe qué es una temperatura preocupante.** Que 30 °C sea `warning` lo
  decide esta pantalla, que es donde vive el criterio.

## El CSS

```css
@import "nexora-iot-ui/styles.css";   /* tokens + utilidades de los componentes */
@import "tailwindcss";                 /* para las clases de esta pantalla */
```

Los tokens de diseño viajan en el CSS del paquete; no hay que redeclararlos. El bloque
`@theme inline` de [`src/index.css`](src/index.css) solo le pone nombre de Tailwind a los
que usa esta app, para poder escribir `bg-background` en el JSX propio.

Las fuentes no van en el paquete —inlinearlas metía 400 kB de base64— así que se importan
aquí.
