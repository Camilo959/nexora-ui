import { createContext } from "react"

import type { DeviceChannel } from "./channel"

/**
 * Registro de canales que publica `PortalDeviceProvider`. Vive aparte del componente para
 * no romper el fast refresh, que exige que un archivo exporte solo componentes.
 */
export interface PortalDeviceContextValue {
  /** Devuelve la conexión de ese canal, creándola la primera vez. */
  channel: (channelId: string) => DeviceChannel
  /** Canal que usan los hooks que no reciben uno. `undefined` mientras se resuelve. */
  defaultChannelId: string | undefined
}

export const PortalDeviceContext = createContext<PortalDeviceContextValue | null>(null)
