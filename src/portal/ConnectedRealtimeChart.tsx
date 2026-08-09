import type { ReactNode } from "react"

import { RealtimeChartCard } from "@/components/iot"
import type { RealtimeChartCardProps } from "@/components/iot"

import { useTelemetry } from "./useTelemetry"

/**
 * `RealtimeChartCard` alimentada por el canal: extrae una serie numérica del historial.
 *
 * Sigue sin dibujar nada. El gráfico lo pone el consumidor como render-prop y recibe los
 * valores ya listos; así la librería no se ata a ninguna librería de charting.
 */
export interface ConnectedRealtimeChartProps
  extends Omit<RealtimeChartCardProps, "children" | "status"> {
  /** Canal del dispositivo. Por defecto, el del proveedor. */
  channelId?: string
  /** Clave numérica dentro del `content` de la telemetría. */
  metric: string
  /** Puntos de la serie. Por defecto 60 (≈2 min a una lectura cada 2 s). */
  historySize?: number
  /** Recibe la serie y devuelve el gráfico. */
  children: (values: number[]) => ReactNode
}

export function ConnectedRealtimeChart({
  channelId,
  metric,
  historySize,
  children,
  ...props
}: ConnectedRealtimeChartProps) {
  const { history, status, stale } = useTelemetry({
    ...(channelId !== undefined ? { channelId } : {}),
    ...(historySize !== undefined ? { historySize } : {}),
  })

  const values = history
    .map((reading) => reading[metric])
    .filter((value): value is number => typeof value === "number")

  return (
    // `paused` y no `offline`: hay conexión, es el dispositivo el que dejó de emitir.
    <RealtimeChartCard {...props} status={status !== "live" ? "offline" : stale ? "paused" : "live"}>
      {children(values)}
    </RealtimeChartCard>
  )
}
