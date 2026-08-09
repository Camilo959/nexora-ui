import { ArrowDown, ArrowUp, Minus } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Displays a single IoT metric.
 *
 * The component only renders the value supplied through props. The consumer
 * decides whether a reading is healthy and passes the resulting
 * `status`/`trend`; this component never evaluates the value against
 * thresholds.
 *
 * Numeric values are rendered with `font-mono` + `tabular-nums` so the text
 * stays visually stable while the reading changes.
 */
export type TelemetryStatus = "normal" | "warning" | "critical"

export type TelemetryTrend = "up" | "down" | "stable"

export interface TelemetryCardProps {
  /** Metric name, e.g. "TEMPERATURE". Displayed uppercase. */
  label: string
  /** Current reading. */
  value: string | number
  /** Measurement unit, e.g. "°C". Optional. */
  unit?: string
  /** Operational health, provided by the consumer, not inferred. */
  status?: TelemetryStatus
  /** Optional direction indicator. Icons are intentionally neutral in color. */
  trend?: TelemetryTrend
  /** Extra classes appended to the card. */
  className?: string
}

const trendIcon: Record<TelemetryTrend, typeof ArrowUp> = {
  up: ArrowUp,
  down: ArrowDown,
  stable: Minus,
}

const statusAccentClass: Record<Exclude<TelemetryStatus, "normal">, string> = {
  warning: "bg-amber-500",
  critical: "bg-red-600",
}

const statusText: Record<Exclude<TelemetryStatus, "normal">, string> = {
  warning: "Warning",
  critical: "Critical",
}

export function TelemetryCard({
  label,
  value,
  unit,
  status = "normal",
  trend,
  className,
}: TelemetryCardProps) {
  const TrendIcon = trend ? trendIcon[trend] : null
  const showStatus = status !== "normal"

  return (
    <Card
      data-status={status}
      className={cn("relative rounded-sm border border-border p-4 ring-0", className)}
    >
      {showStatus && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 left-0 w-0.5",
            statusAccentClass[status]
          )}
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted-foreground">
          {label}
        </span>
        {trend && TrendIcon && (
          <span
            role="img"
            aria-label={`Trend ${trend}`}
            className="text-muted-foreground"
          >
            <TrendIcon aria-hidden="true" className="size-3.5" strokeWidth={2} />
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-mono text-5xl font-semibold leading-none tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-2xl leading-none text-muted-foreground">
            {unit}
          </span>
        )}
      </div>

      {showStatus && <span className="sr-only">{statusText[status]}</span>}
    </Card>
  )
}
