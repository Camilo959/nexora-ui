import { useContext, useEffect, useSyncExternalStore } from "react"

import type { DeviceChannel, DeviceChannelSnapshot } from "./channel"
import { PortalDeviceContext } from "./context"

/**
 * Primitiva sobre la que se construyen `useTelemetry` y `useActuator`: resuelve el canal,
 * lleva su refcount y refleja su estado.
 *
 * Es también la vía de escape para lo que los hooks de alto nivel no cubran — un
 * vocabulario propio, un tipo de mensaje nuevo. Preferible a tocar `DeviceChannel`.
 */
export interface UseDeviceChannelResult {
  snapshot: DeviceChannelSnapshot
  /** `undefined` mientras no haya canal (inerte, sin conexión abierta). */
  connection: DeviceChannel | undefined
  channelId: string | undefined
}

/** Sin canal, el hook queda inerte: no abre conexión y nunca notifica. */
const inertSubscribe = () => () => {}
const inertSnapshot: DeviceChannelSnapshot = {
  status: "connecting",
  me: null,
  readyAt: null,
  messages: [],
  log: [],
}
const getInert = () => inertSnapshot

export function useDeviceChannel(channelId?: string): UseDeviceChannelResult {
  const context = useContext(PortalDeviceContext)
  if (context === null) {
    throw new Error("useDeviceChannel debe usarse dentro de <PortalDeviceProvider>")
  }

  const id = channelId ?? context.defaultChannelId
  const connection = id === undefined ? undefined : context.channel(id)

  useEffect(() => {
    if (connection === undefined) return
    connection.acquire()
    return () => connection.release()
  }, [connection])

  const snapshot = useSyncExternalStore(
    connection?.subscribe ?? inertSubscribe,
    connection?.getSnapshot ?? getInert
  )

  return { snapshot, connection, channelId: id }
}
