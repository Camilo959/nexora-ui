import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { StatusBadge } from "./StatusBadge"
import type { StatusBadgeProps } from "./StatusBadge"

/**
 * Presentational shell for a real-time chart.
 *
 * This component intentionally does NOT implement a chart. It is agnostic of
 * any charting library, data shape, transport (fetch/WebSocket/MQTT) and
 * device semantics. The consumer renders the actual chart as `children` and
 * owns all data concerns.
 *
 * The shell provides a technical header (title, unit, time range) and a
 * status indicator, so every real-time chart in the application shares the
 * same visual language.
 */
export type RealtimeChartStatus = "live" | "paused" | "offline"

export interface RealtimeChartCardProps {
  /** Chart title, e.g. "MOTOR RPM". Displayed uppercase. */
  title: string
  /** Unit of the plotted data, e.g. "RPM". Optional. */
  unit?: string
  /** Stream state. Maps to a StatusBadge. Defaults to "live". */
  status?: RealtimeChartStatus
  /** Optional temporal window label, e.g. "LAST 10 MIN". */
  timeRange?: string
  /** Chart content. Fully controlled by the consumer. */
  children: ReactNode
  /** Extra classes appended to the card. */
  className?: string
}

const statusBadgeMap: Record<RealtimeChartStatus, StatusBadgeProps> = {
  live: { status: "live", label: "live" },
  paused: { status: "standby", label: "paused" },
  offline: { status: "offline", label: "offline" },
}

export function RealtimeChartCard({
  title,
  unit,
  status = "live",
  timeRange,
  children,
  className,
}: RealtimeChartCardProps) {
  return (
    <Card
      className={cn("gap-0 rounded-sm border border-border p-0 ring-0", className)}
    >
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate font-mono text-xs font-semibold tracking-[0.06em] uppercase">
            {title}
          </span>
          {unit && (
            <span className="font-mono text-[11px] uppercase text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {timeRange && (
            <span className="font-mono text-[11px] uppercase text-muted-foreground">
              {timeRange}
            </span>
          )}
          <StatusBadge {...statusBadgeMap[status]} />
        </div>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  )
}
