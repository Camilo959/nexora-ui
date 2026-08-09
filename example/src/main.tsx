import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PortalDeviceProvider } from 'nexora-iot-ui/portal'

/**
 * demo_server.py acuña el token y decide el canal, porque es quien guarda la API key
 * `sk_`. Son dos peticiones al arrancar y la del canal desperdicia su token: en un
 * localhost para una persona no compensa cachear nada.
 *
 * ponytail: si algún día molesta, `getToken` puede cachear la respuesta y el proveedor
 * leer `channel` de ahí.
 */
async function session() {
  const res = await fetch('/token')
  const body = await res.json()
  if (!body.token) throw new Error(body.error ?? 'el servidor no devolvió token')
  return body as { token: string; channel: string }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortalDeviceProvider
      getToken={async () => (await session()).token}
      defaultChannelId={async () => (await session()).channel}
    >
      <App />
    </PortalDeviceProvider>
  </StrictMode>,
)
