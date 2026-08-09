import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { StatusBadge } from "./StatusBadge"
import type { StatusBadgeStatus } from "./StatusBadge"

/**
 * Renders an inventory of IoT devices as a technical table.
 *
 * Presentation-only: it never queries devices, networks or hardware. The
 * consumer supplies the device list through `devices`, decides how each
 * status is computed, and handles all interactions via `onSelect`/`onAction`.
 *
 * Keyboard support: when `onSelect` is provided, every row is focusable and
 * activates on Enter/Space. Per-row action buttons are native buttons whose
 * accessible name includes the device (`"RUN, Motor A"`).
 */
export interface DeviceTableMetric {
  /** Last reported reading, e.g. `45.2`. */
  value: string | number
  /** Measurement unit, e.g. `"°C"`. */
  unit?: string
}

export interface DeviceTableDevice {
  /** Stable unique key used for React keys. */
  id: string
  /** Visible device name or identifier. */
  name: string
  /** Operational state, mapped to a `StatusBadge`. */
  status: StatusBadgeStatus
  /** Latest metric reading, rendered in mono. Optional. */
  lastMetric?: DeviceTableMetric | null
  /** Last time the device was seen; `Date`s are formatted locally. Optional. */
  lastSeen?: string | Date | null
}

export interface DeviceTableAction {
  /** Stable unique key within the table's action set. */
  key: string
  /** Visible label; also part of the button's accessible name. */
  label: string
  /** Optional leading icon. */
  icon?: ReactNode
}

export interface DeviceTableProps {
  /** Devices to display. */
  devices: DeviceTableDevice[]
  /**
   * Shared action set rendered on every row. When provided, an ACTIONS
   * column is added and each button fires `onAction` with its row.
   */
  actions?: DeviceTableAction[]
  /**
   * When true, the body is replaced by a single loading row and the device
   * list is ignored. The consumer owns when to set this.
   */
  loading?: boolean
  /** Message for the empty state. Defaults to "NO DEVICES". */
  emptyLabel?: string
  /** Fired when a row is selected (click, or Enter/Space while focused). */
  onSelect?: (device: DeviceTableDevice) => void
  /** Fired when a per-row action button is pressed. */
  onAction?: (device: DeviceTableDevice, action: DeviceTableAction) => void
  /** Extra classes appended to the card frame. */
  className?: string
}

const HEAD_CLASS =
  "font-mono text-[11px] font-semibold tracking-[0.06em] uppercase text-muted-foreground"

const MONO_CELL_CLASS = "font-mono text-xs tabular-nums"

function formatLastSeen(value: string | Date): string {
  if (typeof value === "string") return value
  return value.toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
}

export function DeviceTable({
  devices,
  actions,
  loading,
  emptyLabel = "NO DEVICES",
  onSelect,
  onAction,
  className,
}: DeviceTableProps) {
  const visibleActions = actions && actions.length > 0 ? actions : undefined
  const columnCount = 5 + (visibleActions ? 1 : 0)

  return (
    <Card
      className={cn(
        "gap-0 rounded-sm border border-border p-0 ring-0",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={HEAD_CLASS}>ID</TableHead>
            <TableHead className={HEAD_CLASS}>NAME</TableHead>
            <TableHead className={HEAD_CLASS}>STATUS</TableHead>
            <TableHead className={cn(HEAD_CLASS, "text-right")}>
              LAST METRIC
            </TableHead>
            <TableHead className={HEAD_CLASS}>LAST SEEN</TableHead>
            {visibleActions && (
              <TableHead className={cn(HEAD_CLASS, "text-right")}>
                ACTIONS
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow aria-busy="true" className="hover:bg-transparent">
              <TableCell
                colSpan={columnCount}
                className="h-16 text-center font-mono text-xs text-muted-foreground"
              >
                <span role="status" className="inline-flex items-center gap-2">
                  <Loader2
                    aria-hidden="true"
                    className="size-4 animate-spin motion-reduce:animate-none"
                  />
                  LOADING DEVICES…
                </span>
              </TableCell>
            </TableRow>
          ) : devices.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columnCount}
                className="h-16 text-center font-mono text-xs text-muted-foreground"
              >
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            devices.map((device) => (
              <TableRow
                key={device.id}
                tabIndex={onSelect ? 0 : undefined}
                onClick={onSelect ? () => onSelect(device) : undefined}
                onKeyDown={(event) => {
                  if (!onSelect) return
                  if (event.target !== event.currentTarget) return
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onSelect(device)
                  }
                }}
                className={cn(
                  onSelect && "cursor-pointer focus-visible:bg-muted/50"
                )}
              >
                <TableCell className={cn(MONO_CELL_CLASS, "text-muted-foreground")}>
                  {device.id}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {device.name}
                </TableCell>
                <TableCell>
                  <StatusBadge status={device.status} />
                </TableCell>
                <TableCell className={cn(MONO_CELL_CLASS, "text-right")}>
                  {device.lastMetric ? (
                    <>
                      {device.lastMetric.value}
                      {device.lastMetric.unit && (
                        <span className="ml-1 text-muted-foreground">
                          {device.lastMetric.unit}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className={cn(MONO_CELL_CLASS, "text-muted-foreground")}>
                  {device.lastSeen ? formatLastSeen(device.lastSeen) : "—"}
                </TableCell>
                {visibleActions && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {visibleActions.map((action) => (
                        <Button
                          key={action.key}
                          size="xs"
                          variant="outline"
                          title={action.label}
                          aria-label={`${action.label}, ${device.name}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            onAction?.(device, action)
                          }}
                        >
                          {action.icon}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
