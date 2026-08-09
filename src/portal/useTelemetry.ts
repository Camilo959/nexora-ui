import { useEffect, useMemo, useState } from "react"

import type { DeviceStatus } from "./channel"
import { useDeviceChannel } from "./useDeviceChannel"

/**
 * Lecturas de sensores de un dispositivo.
 *
 * La telemetría viaja **siempre efímera**: sin `seq`, sin persistencia, sin historial. Una
 * lectura cada 2 s persistida llenaría el historial del canal de ruido y consumiría cuota.
 * El historial que devuelve este hook es local y se pierde al recargar, que es exactamente
 * lo que un gráfico en vivo necesita.
 */
export interface UseTelemetryParams {
  /** Canal del dispositivo. Por defecto, el del proveedor. */
  channelId?: string
  /** Lecturas retenidas. Por defecto 60 (≈2 min a una cada 2 s). Tope duro: 200. */
  historySize?: number
  /** Discriminador de los mensajes de telemetría. Por defecto `"telemetry"`. */
  messageType?: string
  /**
   * Silencio tras el cual la última lectura se considera vieja. Por defecto 10 s.
   * Ponlo a `0` para desactivar la comprobación.
   */
  staleMs?: number
}

export interface UseTelemetryResult<T> {
  /** Última lectura, o `null` si aún no ha llegado ninguna. */
  latest: T | null
  /** Lecturas en orden, la más reciente al final. */
  history: T[]
  /**
   * Estado del **transporte**: si hay socket con Portal. No dice nada del dispositivo —
   * para eso está `stale`. Un canal puede estar `live` con la placa desenchufada.
   */
  status: DeviceStatus
  /**
   * `true` cuando la última lectura lleva más de `staleMs` sin renovarse. Es la única
   * señal de que el dispositivo dejó de emitir: Portal no avisa de que una placa se fue,
   * y sin esto un dashboard enseña datos congelados diciendo que están en vivo.
   *
   * Antes de la primera lectura el silencio se cuenta desde que el canal quedó listo, así
   * que un dispositivo que nunca aparece también sale como viejo.
   */
  stale: boolean
  /** Identidad de Portal del dispositivo que emite. Útil para depurar. */
  deviceId: string | undefined
}

export function useTelemetry<T = Record<string, unknown>>({
  channelId,
  historySize = 60,
  messageType = "telemetry",
  staleMs = 10_000,
}: UseTelemetryParams = {}): UseTelemetryResult<T> {
  const { snapshot } = useDeviceChannel(channelId)
  const { messages, me, status, readyAt } = snapshot

  const readings = useMemo(
    // El servidor reenvía los efímeros a todos los participantes, incluido quien los
    // envió. Sin este filtro, un dashboard que además emitiera contaría su propio eco.
    () => messages.filter((m) => m.type === messageType && m.senderId !== me),
    [messages, me, messageType]
  )
  // Sin lecturas todavía, el silencio se cuenta desde que hubo conexión.
  const since = readings[readings.length - 1]?.at ?? readyAt ?? undefined

  // El silencio no genera renders: sin este temporizador, la pantalla se quedaría
  // enseñando la última lectura como si acabara de llegar.
  const [checkedAt, setCheckedAt] = useState(0)
  useEffect(() => {
    if (since === undefined || staleMs <= 0) return
    const timer = setTimeout(() => setCheckedAt(Date.now()), since + staleMs - Date.now())
    return () => clearTimeout(timer)
  }, [since, staleMs])

  const stale = since !== undefined && staleMs > 0 && checkedAt - since >= staleMs

  return useMemo(() => {
    const history = readings.slice(-historySize).map((m) => m.content as T)
    const last = readings[readings.length - 1]

    return {
      latest: last ? (last.content as T) : null,
      history,
      status,
      stale,
      deviceId: last?.senderId,
    }
  }, [readings, status, stale, historySize])
}
