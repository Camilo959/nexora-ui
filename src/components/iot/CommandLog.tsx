import { useEffect, useMemo, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * Technical event/command console for monitoring systems.
 *
 * This component is a pure viewer. It does not connect to WebSockets, MQTT,
 * REST or any device source — the consumer passes events in through
 * `entries` and owns the data flow.
 *
 * Auto-scroll (when enabled) only sticks to the bottom while the user is
 * near the end of the log; scrolling up to read older messages suspends it
 * until the user returns to the bottom. This is local UI behaviour and does
 * not imply any knowledge of where entries come from.
 */
export type CommandLogLevel = "info" | "success" | "warning" | "error"

export interface CommandLogEntry {
  /** Stable unique key for the entry. */
  id: string
  /** Displayed timestamp; Dates are formatted, strings shown as-is. */
  timestamp: string | Date
  /** Event/response text. */
  message: string
  /** Severity. Defaults to "info". */
  level?: CommandLogLevel
  /** Optional source column, e.g. "MOTOR_COMMAND". */
  source?: string
}

export interface CommandLogProps {
  /** Events to display, ordered oldest → newest. */
  entries: CommandLogEntry[]
  /**
   * Cap on how many entries are rendered. The component truncates from the
   * oldest; the full count is still shown in the header. Defaults to 100.
   */
  maxVisibleEntries?: number
  /** Stick to the bottom while the user is near the end. Defaults to true. */
  autoScroll?: boolean
  /** Header title. Defaults to "COMMAND LOG". */
  title?: string
  /** Extra classes appended to the console. */
  className?: string
}

const levelMeta: Record<CommandLogLevel, { tag: string; className: string }> = {
  info: { tag: "INFO", className: "text-background/60" },
  success: { tag: "OK", className: "text-emerald-400" },
  warning: { tag: "WARN", className: "text-amber-400" },
  error: { tag: "ERR", className: "text-red-400" },
}

const SCROLL_THRESHOLD_PX = 48

function formatTimestamp(timestamp: string | Date): string {
  if (typeof timestamp === "string") return timestamp
  return timestamp.toLocaleTimeString([], {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function CommandLog({
  entries,
  maxVisibleEntries = 100,
  autoScroll = true,
  title = "COMMAND LOG",
  className,
}: CommandLogProps) {
  const scrollRef = useRef<HTMLUListElement>(null)
  const stickToBottomRef = useRef(true)

  const handleScroll = () => {
    const element = scrollRef.current
    if (!element) return
    stickToBottomRef.current =
      element.scrollHeight - element.scrollTop - element.clientHeight <
      SCROLL_THRESHOLD_PX
  }

  useEffect(() => {
    const element = scrollRef.current
    if (element && autoScroll && stickToBottomRef.current) {
      element.scrollTop = element.scrollHeight
    }
  }, [entries, autoScroll])

  const visibleEntries = useMemo(() => {
    const start = Math.max(0, entries.length - maxVisibleEntries)
    return entries.slice(start).map((entry) => ({
      ...entry,
      displayTime: formatTimestamp(entry.timestamp),
    }))
  }, [entries, maxVisibleEntries])

  return (
    <div
      className={cn(
        "flex h-64 flex-col rounded-sm border border-border bg-foreground text-background",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-background/15 px-3 py-2">
        <span className="font-mono text-[11px] font-semibold tracking-[0.06em]">
          {title}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-background/50">
          {entries.length} EVENTS
        </span>
      </div>

      <ul
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-relevant="additions"
        className="flex-1 space-y-0.5 overflow-y-auto p-3 font-mono text-xs"
      >
        {visibleEntries.length === 0 ? (
          <li className="text-background/40">— NO EVENTS —</li>
        ) : (
          visibleEntries.map((entry) => {
            const meta = levelMeta[entry.level ?? "info"]
            return (
              <li key={entry.id} className="flex gap-2 leading-relaxed">
                <time className="shrink-0 tabular-nums text-background/40">
                  {entry.displayTime}
                </time>
                <span className={cn("w-9 shrink-0", meta.className)}>
                  {meta.tag}
                </span>
                {entry.source && (
                  <span className="shrink-0 text-background/50">
                    {entry.source}
                  </span>
                )}
                <span className="min-w-0 break-words">{entry.message}</span>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
