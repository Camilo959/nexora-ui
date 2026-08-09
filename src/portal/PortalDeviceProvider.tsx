import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"

import { DeviceChannel } from "./channel"
import { PortalDeviceContext } from "./context"

/**
 * Raíz de la capa de datos. Posee el registro de canales: una conexión por `channelId`,
 * compartida por todos los hooks que la pidan.
 *
 * No recibe ninguna API key, a propósito. El upgrade del WebSocket de Portal se autentica
 * solo con el token (el parámetro `key` es opcional, verificado contra la API real), así
 * que la clave secreta puede quedarse en tu servidor y no hay nada que ocultar en el
 * bundle. `getToken` es el único punto de autenticación.
 */
export interface PortalDeviceProviderProps {
  /**
   * Devuelve un JWT de Portal. Se reinvoca en cada conexión y reconexión, que es lo que
   * permite sobrevivir a la caducidad del token (los anónimos duran 1 h).
   *
   * **Nunca acuñes el token en el navegador**: eso exige la API key `sk_`, que es secreta.
   * Pídeselo a tu servidor, que es quien la guarda.
   */
  getToken: () => Promise<string>
  /**
   * Canal por defecto. Acepta una función porque a menudo lo decide el mismo servidor que
   * acuña el token; se resuelve una vez y los hooks quedan inertes hasta entonces.
   */
  defaultChannelId?: string | (() => string | Promise<string>)
  /** Override del host de realtime. Para apuntar a un servidor local o a un mock. */
  realtimeUrl?: string
  children: ReactNode
}

export function PortalDeviceProvider({
  getToken,
  defaultChannelId,
  realtimeUrl,
  children,
}: PortalDeviceProviderProps) {
  // El canal captura `getToken` al construirse; el ref evita quedarse con la primera
  // versión cuando el consumidor pasa una función anónima en cada render. El valor inicial
  // ya es el correcto, así que actualizarlo en un efecto no llega tarde a la conexión.
  const tokenRef = useRef(getToken)
  useEffect(() => {
    tokenRef.current = getToken
  })

  const registry = useRef(new Map<string, DeviceChannel>())

  const channel = useCallback(
    (channelId: string) => {
      let existing = registry.current.get(channelId)
      if (existing === undefined) {
        existing = new DeviceChannel(channelId, {
          getToken: () => tokenRef.current(),
          ...(realtimeUrl !== undefined ? { realtimeUrl } : {}),
        })
        registry.current.set(channelId, existing)
      }
      return existing
    },
    [realtimeUrl]
  )

  const isStatic = typeof defaultChannelId === "string"
  const [fetched, setFetched] = useState<string>()

  useEffect(() => {
    if (isStatic || defaultChannelId === undefined) return
    let cancelled = false
    void Promise.resolve(defaultChannelId()).then((id) => {
      if (!cancelled) setFetched(id)
    })
    return () => {
      cancelled = true
    }
    // Deliberadamente sin `defaultChannelId` en las dependencias: una función anónima
    // cambia de identidad en cada render y relanzaría la resolución sin parar. El canal
    // por defecto se resuelve una sola vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStatic])

  const resolved = isStatic ? defaultChannelId : fetched

  const value = useMemo(
    () => ({ channel, defaultChannelId: resolved }),
    [channel, resolved]
  )

  return <PortalDeviceContext value={value}>{children}</PortalDeviceContext>
}
