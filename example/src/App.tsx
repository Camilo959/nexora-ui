/**
 * Dashboard del ESP32 simulado sobre Portal.
 *
 * No hay transporte aquí: lo pone `nexora-iot-ui/portal`. Esta pantalla solo decide qué
 * significan las lecturas — qué temperatura preocupa, cuándo el motor llegó al final de
 * carrera, qué botón se deshabilita — que es justo lo que ni la librería de componentes
 * ni la capa de datos deben saber.
 */
import { Sparkline } from "./components/Sparkline"
import { CommandLog, StatusBadge, TelemetryCard } from "nexora-iot-ui"
import type { TelemetryTrend } from "nexora-iot-ui"
import {
  ConnectedActuatorButton,
  ConnectedRealtimeChart,
  ConnectedTelemetryCard,
  useDeviceChannel,
  useDeviceLog,
  useTelemetry,
} from "nexora-iot-ui/portal"

const FULL_RUN_STEPS = 6144 // 3 revoluciones de un 28BYJ-48

interface Reading {
  deviceId?: string
  temperature?: number
  humidity?: number
  motor_status?: "RUNNING" | "STOPPED"
  motor_position?: number
}

/** Compara las dos últimas lecturas. Sin umbral, el ruido del DHT11 haría parpadear la flecha. */
function trendOf(values: (number | undefined)[], threshold: number): TelemetryTrend | undefined {
  const series = values.filter((v): v is number => v != null)
  if (series.length < 2) return undefined
  const delta = series[series.length - 1] - series[series.length - 2]
  if (Math.abs(delta) < threshold) return "stable"
  return delta > 0 ? "up" : "down"
}

export default function App() {
  const { channelId } = useDeviceChannel()
  const { latest, history, status, stale } = useTelemetry<Reading>()
  const log = useDeviceLog()

  const running = latest?.motor_status === "RUNNING"
  const position = latest?.motor_position ?? 0
  // Sin dispositivo no hay a quién mandar comandos, aunque el canal siga abierto.
  const offline = status !== "live" || stale

  // Que el canal esté conectado y que la placa esté emitiendo son dos cosas distintas, y
  // confundirlas es enseñar datos congelados con el sello de "en vivo".
  const badge =
    status === "connecting"
      ? ({ status: "standby", label: "conectando" } as const)
      : status !== "live"
        ? ({ status: "offline", label: "sin conexión" } as const)
        : stale
        ? ({ status: "alert", label: "sin datos" } as const)
        : ({ status: "live", label: "en vivo" } as const)

  return (
    <main className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-muted-foreground">
              NEXORA / ESP32 SIMULADO
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Estación de monitoreo</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">{channelId ?? "—"}</span>
            <StatusBadge {...badge} />
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TelemetryCard
            label="Temperatura"
            value={latest?.temperature?.toFixed(1) ?? "—"}
            unit="°C"
            trend={trendOf(history.map((r) => r.temperature), 0.2)}
            status={latest?.temperature != null && latest.temperature > 30 ? "warning" : "normal"}
          />
          <TelemetryCard
            label="Humedad"
            value={latest?.humidity ?? "—"}
            unit="%"
            trend={trendOf(history.map((r) => r.humidity), 1)}
          />
          <ConnectedTelemetryCard
            label="Posición motor"
            metric="motor_position"
            unit={`/ ${FULL_RUN_STEPS}`}
            status={position >= FULL_RUN_STEPS ? "warning" : "normal"}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ConnectedRealtimeChart title="Temperatura" unit="°C" metric="temperature" timeRange="ÚLTIMOS 2 MIN">
            {(values) => <Sparkline values={values} unit="°C" precision={1} />}
          </ConnectedRealtimeChart>
          <ConnectedRealtimeChart title="Humedad" unit="%" metric="humidity" timeRange="ÚLTIMOS 2 MIN">
            {(values) => <Sparkline values={values} unit="%" precision={0} />}
          </ConnectedRealtimeChart>
        </section>

        <section className="flex flex-wrap items-center gap-3 rounded-sm border p-4">
          <div className="mr-auto">
            <p className="font-mono text-xs tracking-[0.06em] uppercase text-muted-foreground">
              Motor paso a paso
            </p>
            <p className="mt-1 font-mono text-lg tabular-nums">{running ? "GIRANDO" : "DETENIDO"}</p>
          </div>
          <ConnectedActuatorButton
            label="Arrancar motor"
            commandType="MOTOR_COMMAND"
            action={{ action: "START_MOTOR" }}
            disabled={offline || running}
          />
          <ConnectedActuatorButton
            label="Detener motor"
            variant="destructive"
            commandType="MOTOR_COMMAND"
            action={{ action: "STOP_MOTOR" }}
            disabled={offline || !running}
          />
        </section>

        <CommandLog entries={log} title="REGISTRO DE COMANDOS" />
      </div>
    </main>
  )
}
