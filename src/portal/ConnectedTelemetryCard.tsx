import { TelemetryCard } from "../components/iot"
import type { TelemetryCardProps } from "../components/iot"

import { useTelemetry } from "./useTelemetry"

/**
 * `TelemetryCard` alimentada por el canal: lee una clave de la última lectura.
 *
 * Sigue sin evaluar nada. `status` y `trend` los decide el consumidor, igual que en el
 * componente presentacional: qué temperatura es preocupante depende del despliegue, no
 * del transporte.
 */
export interface ConnectedTelemetryCardProps extends Omit<TelemetryCardProps, "value"> {
  /** Canal del dispositivo. Por defecto, el del proveedor. */
  channelId?: string
  /** Clave dentro del `content` de la telemetría, p. ej. `"temperature"`. */
  metric: string
  /** Decimales. Si se omite, el valor se muestra tal cual llega. */
  precision?: number
  /** Qué mostrar antes de la primera lectura. Por defecto `"—"`. */
  placeholder?: string
}

export function ConnectedTelemetryCard({
  channelId,
  metric,
  precision,
  placeholder = "—",
  ...props
}: ConnectedTelemetryCardProps) {
  const { latest } = useTelemetry({ ...(channelId !== undefined ? { channelId } : {}) })
  const reading = latest?.[metric]

  const value =
    reading === undefined || reading === null
      ? placeholder
      : typeof reading === "number" && precision !== undefined
        ? reading.toFixed(precision)
        : String(reading)

  return <TelemetryCard {...props} value={value} />
}
