import { AlertTriangle, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Presents a one-shot actuator command (START MOTOR, REBOOT NODE, ...).
 *
 * This component only represents the *intent* to run an action. It never
 * sends commands, performs network requests or manages its own execution
 * flow — the consumer drives `status` and reacts to `onExecute`.
 *
 * There are no internal timers: transitioning between states (e.g.
 * `executing` → `success`) is always the consumer's responsibility.
 */
export type ActuatorButtonStatus = "idle" | "executing" | "success" | "error"

export interface ActuatorButtonProps {
  /** Action label shown in the `idle` state. */
  label: string
  /**
   * Current execution state, owned by the consumer.
   * `executing` disables the button; `success`/`error` keep it clickable
   * so the action can be retried.
   */
  status?: ActuatorButtonStatus
  /**
   * Visual emphasis of the action itself. Use `destructive` for actions
   * such as EMERGENCY STOP.
   */
  variant?: "default" | "destructive"
  /** Fired when the user requests the action. Not the execution itself. */
  onExecute?: () => void
  /** Extra disable flag on top of the `executing` state. */
  disabled?: boolean
  /** Extra classes appended to the button. */
  className?: string
}

const statusLabel: Record<Exclude<ActuatorButtonStatus, "idle">, string> = {
  executing: "EXECUTING",
  success: "EXECUTED",
  error: "FAILED",
}

export function ActuatorButton({
  label,
  status = "idle",
  variant = "default",
  onExecute,
  disabled,
  className,
}: ActuatorButtonProps) {
  const isExecuting = status === "executing"

  return (
    <Button
      variant={variant}
      disabled={disabled || isExecuting}
      aria-busy={isExecuting || undefined}
      aria-live="polite"
      onClick={() => onExecute?.()}
      className={cn(
        "disabled:opacity-100",
        isExecuting && "bg-muted text-muted-foreground hover:bg-muted",
        status === "success" && "bg-emerald-600 text-white hover:bg-emerald-600",
        status === "error" && "bg-red-600 text-white hover:bg-red-600",
        className
      )}
    >
      {isExecuting && (
        <Loader2
          aria-hidden="true"
          className="size-4 animate-spin motion-reduce:animate-none"
        />
      )}
      {status === "success" && <Check aria-hidden="true" className="size-4" />}
      {status === "error" && (
        <AlertTriangle aria-hidden="true" className="size-4" />
      )}
      {status === "idle" ? label : statusLabel[status]}
    </Button>
  )
}
