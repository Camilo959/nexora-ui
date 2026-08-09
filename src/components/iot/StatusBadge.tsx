import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Displays the operational state of an IoT device or connection.
 *
 * The component is presentation-only: it never infers, fetches or manages
 * connectivity/device state. The consumer owns that logic and supplies the
 * current state through the `status` prop.
 *
 * The state is always conveyed by text as well as color, and the "live"
 * pulse animation is disabled under `prefers-reduced-motion`, so the badge
 * remains fully informative without any animation.
 */
export type StatusBadgeStatus = "live" | "standby" | "alert" | "offline"

export interface StatusBadgeProps {
  /** Operational state to display. */
  status: StatusBadgeStatus
  /**
   * Optional text override rendered inside the badge.
   * The visible text is uppercased via CSS while the accessible name keeps
   * the original casing, avoiding letter-by-letter screen reader output.
   */
  label?: string
  /** Extra classes appended to the badge. */
  className?: string
}

const dotClass: Record<StatusBadgeStatus, string> = {
  live: "bg-emerald-500",
  standby: "bg-amber-400",
  alert: "bg-orange-500",
  offline: "bg-gray-400",
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge
      role="status"
      data-status={status}
      variant="outline"
      className={cn(
        "gap-1.5 overflow-visible rounded-sm font-mono text-[11px] font-medium tracking-[0.06em] uppercase text-muted-foreground",
        className
      )}
    >
      <span aria-hidden="true" className="relative inline-flex size-2 shrink-0">
        {status === "live" && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden",
              dotClass[status]
            )}
          />
        )}
        <span className={cn("relative inline-flex size-2 rounded-full", dotClass[status])} />
      </span>
      {label ?? status}
    </Badge>
  )
}
