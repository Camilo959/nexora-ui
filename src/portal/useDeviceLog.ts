import type { CommandLogEntry } from "../components/iot"

import { useDeviceChannel } from "./useDeviceChannel"

/**
 * Eventos de la conexión y comandos enviados, con la forma que espera `CommandLog`.
 *
 * Es un registro de transporte, no de dispositivo: conexiones, cierres, refusals de Portal
 * y los comandos que salen de este cliente. Lo que hace la placa con ellos se ve en la
 * telemetría.
 */
export function useDeviceLog(channelId?: string): CommandLogEntry[] {
  const { snapshot } = useDeviceChannel(channelId)
  return snapshot.log as CommandLogEntry[]
}
