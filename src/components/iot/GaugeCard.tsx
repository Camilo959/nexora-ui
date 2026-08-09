import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Displays a metric within a numeric range as a simple technical instrument.
 *
 * The bar is a plain progress-style element (no charting library) and never
 * represents percentages exclusively: `min`/`max` can be any units, e.g.
 * temperature in °C or pressure in bar.
 *
 * The progress fill is computed from `value`, `min` and `max`, clamped to
 * `0%`–`100%`, and degrades gracefully to `0%` on invalid input. When
 * `min === max`, the bar renders full if `value >= min`, otherwise empty.
 */
export type GaugeStatus = "normal" | "warning" | "critical"

export interface GaugeCardProps {
  /** Metric name, e.g. "TEMPERATURE". Displayed uppercase. */
  label: string
  /** Current reading within the range. */
  value: number
  /** Lower bound of the instrument range. */
  min: number
  /** Upper bound of the instrument range. */
  max: number
  /** Measurement unit, e.g. "°C". Optional. */
  unit?: string
  /** Operational health, provided by the consumer, not inferred. */
  status?: GaugeStatus
  /** Extra classes appended to the card. */
  className?: string
}

function clampPercentage(value: number, min: number, max: number): number {
  const range = max - min
  if (range === 0) {
    return value >= min ? 100 : 0
  }
  const percentage = ((value - min) / range) * 100
  return Number.isFinite(percentage)
    ? Math.min(100, Math.max(0, percentage))
    : 0
}

const barClass: Record<GaugeStatus, string> = {
  normal: "bg-primary",
  warning: "bg-amber-500",
  critical: "bg-red-600",
}

const statusAccentClass: Record<Exclude<GaugeStatus, "normal">, string> = {
  warning: "bg-amber-500",
  critical: "bg-red-600",
}

const statusText: Record<Exclude<GaugeStatus, "normal">, string> = {
  warning: "Warning",
  critical: "Critical",
}

export function GaugeCard({
  label,
  value,
  min,
  max,
  unit,
  status = "normal",
  className,
}: GaugeCardProps) {
  const percentage = clampPercentage(value, min, max)
  const showStatus = status !== "normal"
  const hasFiniteValue = Number.isFinite(value)
  const hasFiniteMin = Number.isFinite(min)
  const hasFiniteMax = Number.isFinite(max)

  return (
    <Card
      data-status={status}
      className={cn("relative gap-3 rounded-sm border border-border p-4 ring-0", className)}
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

      <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted-foreground">
        {label}
      </span>

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

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={hasFiniteMin ? min : undefined}
        aria-valuemax={hasFiniteMax ? max : undefined}
        aria-valuenow={hasFiniteValue ? value : undefined}
      >
        <div className="h-1.5 w-full bg-muted">
          <div
            className={cn("h-full", barClass[status])}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between font-mono text-[11px] tracking-[0.06em] tabular-nums text-muted-foreground">
        <span>MIN {min}</span>
        <span>MAX {max}</span>
      </div>

      {showStatus && <span className="sr-only">{statusText[status]}</span>}
    </Card>
  )
}
