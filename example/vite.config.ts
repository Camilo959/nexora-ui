import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // El token lo acuña `demo_server.py`, que es quien guarda la API key `sk_`. Nunca
    // llega al navegador: ver el apartado de autenticación en docs/PROTOCOLO.md.
    proxy: {
      "/token": "http://localhost:8080",
    },
  },
})
