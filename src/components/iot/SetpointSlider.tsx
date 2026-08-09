import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

/**
 * Edits a numeric setpoint (motor RPM, temperature limit, PWM, ...).
 *
 * Controlled component that separates *selection* from *application*:
 * moving the slider reports a new selection via `onValueChange`, and the
 * APPLY SETPOINT button reports the value to commit via `onApply`. The
 * component never writes to hardware — the consumer owns that step.
 *
 * Presentation safety: out-of-range or non-finite values are clamped to the
 * range for rendering (and for the value passed to `onApply`). If the range
 * is degenerate (`min === max`, NaN bounds), the slider renders disabled
 * against a fallback 0–100 range and application is blocked.
 */
export interface SetpointSliderProps {
  /** Setpoint name, e.g. "MOTOR SPEED". Displayed uppercase. */
  label: string
  /** Currently selected value, owned by the consumer. */
  value: number
  /** Lower bound of the range. */
  min: number
  /** Upper bound of the range. */
  max: number
  /** Snap increment. Invalid values fall back to `1`. */
  step?: number
  /** Measurement unit, e.g. "RPM". */
  unit?: string
  /**
   * Value currently applied to the hardware, when known. When provided and
   * equal to `value`, the APPLY button is disabled (nothing pending).
   */
  appliedValue?: number
  /** Extra disable flag. */
  disabled?: boolean
  /** Fired while dragging/stepping: reports the new selection. */
  onValueChange?: (value: number) => void
  /** Fired when the user presses APPLY SETPOINT. */
  onApply?: (value: number) => void
  /** Extra classes appended to the card. */
  className?: string
}

function safeStep(step: number | undefined): number {
  return typeof step === "number" && Number.isFinite(step) && step > 0
    ? step
    : 1
}

function clampToRange(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function SetpointSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  appliedValue,
  disabled,
  onValueChange,
  onApply,
  className,
}: SetpointSliderProps) {
  const hasFiniteBounds = Number.isFinite(min) && Number.isFinite(max)
  const orderedMin = hasFiniteBounds ? Math.min(min, max) : 0
  const orderedMax = hasFiniteBounds ? Math.max(min, max) : 100
  const hasUsableRange = orderedMin !== orderedMax
  const effectiveMin = hasUsableRange ? orderedMin : 0
  const effectiveMax = hasUsableRange ? orderedMax : 100

  const displayValue = clampToRange(value, effectiveMin, effectiveMax)
  const displayApplied =
    appliedValue === undefined
      ? undefined
      : clampToRange(appliedValue, effectiveMin, effectiveMax)

  const hasPendingChange =
    appliedValue === undefined || displayValue !== displayApplied
  const isDisabled = disabled || !hasUsableRange
  const canApply = !isDisabled && hasPendingChange

  return (
    <Card
      className={cn("rounded-sm border border-border p-4 ring-0", className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-2xl font-semibold leading-none tabular-nums">
          {displayValue}
          {unit && (
            <span className="ml-1.5 font-mono text-sm text-muted-foreground">
              {unit}
            </span>
          )}
        </span>
      </div>

      <div className={cn(isDisabled && "opacity-50")}>
        <Slider
          value={displayValue}
          min={effectiveMin}
          max={effectiveMax}
          step={safeStep(step)}
          disabled={isDisabled}
          getAriaLabel={() => label}
          getAriaValueText={(_formatted, sliderValue) =>
            `${sliderValue} ${unit ?? ""}`.trim()
          }
          onValueChange={onValueChange}
        />
        <div className="mt-1 flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
          <span>{effectiveMin}</span>
          <span>{effectiveMax}</span>
        </div>
      </div>

      {displayApplied !== undefined && (
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          CURRENT: {displayApplied} {unit}
        </p>
      )}

      <Button
        className="w-full"
        disabled={!canApply}
        onClick={() => onApply?.(displayValue)}
      >
        APPLY SETPOINT
      </Button>
    </Card>
  )
}
