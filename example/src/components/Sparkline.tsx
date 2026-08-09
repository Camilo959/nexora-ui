/**
 * Sparkline de una sola serie para meter dentro de un RealtimeChartCard.
 *
 * Una serie por gráfico y un solo eje: temperatura y humedad no comparten escala, así
 * que nunca van superpuestas. El valor actual lo rotula la TelemetryCard de al lado;
 * aquí la línea solo aporta la tendencia, y el hover da la lectura exacta.
 */
import { useState } from "react"

const W = 600
const H = 120
const PAD_Y = 8
const PAD_X = 6 // deja sitio al marcador del último punto

export interface SparklineProps {
  values: number[]
  unit?: string
  /** Decimales al mostrar la lectura bajo el cursor. */
  precision?: number
}

export function Sparkline({ values, unit = "", precision = 1 }: SparklineProps) {
  const [hover, setHover] = useState<number | null>(null)

  if (values.length < 2) {
    return (
      <div className="flex h-30 items-center justify-center font-mono text-xs uppercase text-muted-foreground">
        esperando lecturas
      </div>
    )
  }

  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const span = hi - lo || 1
  const x = (i: number) => PAD_X + (i / (values.length - 1)) * (W - PAD_X * 2)
  const y = (v: number) => H - PAD_Y - ((v - lo) / span) * (H - PAD_Y * 2)
  const points = values.map((v, i) => [x(i), y(v)] as const)
  const path = points.map(([a, b]) => `L${a},${b}`).join(" ")
  const [lastX, lastY] = points[points.length - 1]
  const cursor = hover === null ? null : values[hover]

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-30 w-full"
        role="img"
        aria-label={`Serie temporal, ${values.length} lecturas, mínimo ${lo}, máximo ${hi}`}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const ratio = (event.clientX - rect.left) / rect.width
          const index = Math.round(ratio * (values.length - 1))
          setHover(Math.min(values.length - 1, Math.max(0, index)))
        }}
        onPointerLeave={() => setHover(null)}
      >
        <path d={`M${PAD_X},${H} ${path} L${W - PAD_X},${H} Z`} fill="var(--chart-1)" opacity={0.1} />
        <polyline
          points={points.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={0}
            y2={H}
            stroke="var(--border)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        )}
        <circle
          cx={hover === null ? lastX : x(hover)}
          cy={hover === null ? lastY : y(values[hover])}
          r={4}
          fill="var(--chart-1)"
          stroke="var(--card)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="flex justify-between px-1 pt-1 font-mono text-[11px] text-muted-foreground tabular-nums">
        <span>
          MIN {lo.toFixed(precision)}
          {unit} · MAX {hi.toFixed(precision)}
          {unit}
        </span>
        <span>
          {cursor === null ? `${values.length} PTS` : `${cursor.toFixed(precision)}${unit}`}
        </span>
      </div>
    </div>
  )
}
