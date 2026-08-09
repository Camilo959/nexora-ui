import { useId } from "react"
import { Loader2 } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/**
 * Binary hardware control (pump, relay, valve, ...).
 *
 * Strictly controlled: `checked` always comes from the consumer and every
 * interaction is reported back through `onCheckedChange`. The component
 * never talks to hardware — the parent/SDK is responsible for the round
 * trip and for feeding the resulting state back into `checked`.
 *
 * `loading` marks an in-flight command: it disables the switch and shows a
 * pending indicator while the consumer awaits hardware confirmation.
 */
export interface RelaySwitchProps {
  /** Device/control name, e.g. "PUMP". Displayed uppercase. */
  label: string
  /** Current on/off state, owned by the consumer. */
  checked: boolean
  /** Fired when the user requests a state change. */
  onCheckedChange?: (checked: boolean) => void
  /** Extra disable flag. */
  disabled?: boolean
  /** A command is in flight: blocks interaction and shows a pending icon. */
  loading?: boolean
  /** Extra classes appended to the row. */
  className?: string
}

export function RelaySwitch({
  label,
  checked,
  onCheckedChange,
  disabled,
  loading,
  className,
}: RelaySwitchProps) {
  const labelId = useId()
  const isDisabled = disabled || loading

  return (
    <Card
      data-state={checked ? "on" : "off"}
      className={cn(
        "flex-row items-center justify-between gap-3 rounded-sm border border-border p-4 ring-0",
        className
      )}
    >
      <span
        id={labelId}
        className="truncate text-[11px] font-bold tracking-[0.06em] uppercase text-muted-foreground"
      >
        {label}
      </span>

      <div className="flex shrink-0 items-center gap-2">
        {loading && (
          <Loader2
            aria-hidden="true"
            className="size-3.5 animate-spin text-amber-500 motion-reduce:animate-none"
          />
        )}
        <span
          className={cn(
            "font-mono text-xs font-medium tabular-nums",
            checked ? "text-primary" : "text-muted-foreground"
          )}
        >
          {checked ? "ON" : "OFF"}
        </span>
        <Switch
          aria-labelledby={labelId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={isDisabled}
        />
      </div>
    </Card>
  )
}
