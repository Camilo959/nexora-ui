/**
 * Conexión a un canal de dispositivo de Portal. Sin React: solo el wire protocol v1.
 *
 * Es el gemelo en navegador de `portal_device.py`: mismo protocolo, mismo vocabulario,
 * distinto runtime. Los hooks de este módulo son la única capa que sabe de React.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ NO USA `@portalsdk/react`
 *
 * El SDK oficial (v0.1.4 / core 0.1.5) **descarta los mensajes efímeros entrantes**, que
 * es justamente la vía por la que viaja la telemetría. Está en su propio código:
 *
 *   > SPEC: incoming ephemeral messages (no seq) are not modeled — the contract does not
 *   > place them in the ordered window or bind them to a channel event, so they are
 *   > dropped here rather than guessed at.        (@portalsdk/core/dist/index.js)
 *
 * Contradice el JSDoc de su propio `useChannel`, que promete que `onMessage` dispara
 * "persistent or ephemeral". Verificado contra la API real: los frames llegan al
 * navegador correctamente y `onMessage` no dispara; con un mensaje persistente sí.
 *
 * El sentido de salida del SDK sí funciona. Cuando el SDK aprenda a recibir efímeros,
 * este archivo es el único que hay que sustituir: los hooks son la costura.
 * ---------------------------------------------------------------------------
 */

/** Estado de la conexión, ya reducido a lo que una UI necesita distinguir. */
export type DeviceStatus = "connecting" | "live" | "offline"

/** Un mensaje del canal, con el sobre ya normalizado. */
export interface DeviceMessage<C = unknown> {
  /** Discriminador de userland: "telemetry", "MOTOR_COMMAND", "alert", … */
  type: string
  /** Payload. Plano y serializable; Portal lo limita a 2 KB. */
  content: C
  /** Identidad del emisor. Compárala con `me` para descartar el propio eco. */
  senderId: string
  /** `false` para los que Portal persiste (llegan por `batch`/`direct`). */
  ephemeral: boolean
  at: number
}

/** Evento de conexión, con la forma que espera `CommandLog`. */
export interface DeviceLogEntry {
  id: string
  timestamp: Date
  message: string
  level: "info" | "success" | "warning" | "error"
  source?: string
}

export interface DeviceChannelSnapshot {
  status: DeviceStatus
  /** Identidad propia una vez conectado. `null` mientras no haya `ready`. */
  me: string | null
  /**
   * Cuándo quedó lista la conexión. Es el punto desde el que se mide el silencio de un
   * dispositivo que nunca ha emitido nada.
   */
  readyAt: number | null
  messages: readonly DeviceMessage[]
  log: readonly DeviceLogEntry[]
}

export interface DeviceChannelOptions {
  /** Devuelve un JWT de Portal. Se reinvoca en cada conexión y reconexión. */
  getToken: () => Promise<string>
  /** Override del host de realtime. Para apuntar a un mock. */
  realtimeUrl?: string
}

const REALTIME_URL = "wss://realtime.useportal.co"
const PROTOCOL_VERSION = 1
const RECONNECT_MS = 3000
/** Mensajes retenidos. Un `historySize` mayor que esto se queda en esto. */
const BUFFER = 200
const LOG_SIZE = 200
/**
 * Gracia antes de cerrar el socket cuando ya nadie lo usa. En desarrollo, el StrictMode
 * de React monta, desmonta y remonta: sin esta gracia se reconectaría en cada arranque.
 */
const TEARDOWN_MS = 1000

/** Frames que emite el servidor. Solo los campos que se leen aquí. */
type Frame =
  | { t: "ready"; me: { id: string } }
  | { t: "ephemeral"; userId: string; type: string; content: unknown }
  | { t: "batch"; msgs: { type: string; content: unknown; sender: { id: string } }[] }
  | { t: "direct"; msg: { type: string; content: unknown; sender: { id: string } } }
  | { t: "error"; code: string; reason?: string }
  | { t: string }

/**
 * Un canal, un socket. Los hooks comparten instancia por `channelId` a través del
 * proveedor, así que N tarjetas y M botones no abren N+M conexiones.
 *
 * Implementa el contrato de `useSyncExternalStore`: `subscribe` + `getSnapshot`.
 */
export class DeviceChannel {
  readonly channelId: string
  #getToken: () => Promise<string>
  #realtimeUrl: string

  #socket: WebSocket | null = null
  #refs = 0
  #retry: ReturnType<typeof setTimeout> | undefined
  #teardown: ReturnType<typeof setTimeout> | undefined
  #seq = 0
  #listeners = new Set<() => void>()
  #snapshot: DeviceChannelSnapshot = {
    status: "connecting",
    me: null,
    readyAt: null,
    messages: [],
    log: [],
  }

  constructor(channelId: string, { getToken, realtimeUrl = REALTIME_URL }: DeviceChannelOptions) {
    this.channelId = channelId
    this.#getToken = getToken
    this.#realtimeUrl = realtimeUrl
  }

  /** El primer interesado abre la conexión. */
  acquire() {
    clearTimeout(this.#teardown)
    this.#teardown = undefined
    this.#refs += 1
    if (this.#refs === 1 && this.#socket === null) void this.#connect()
  }

  /** Al soltarlo el último interesado, se cierra tras `TEARDOWN_MS`. */
  release() {
    this.#refs = Math.max(0, this.#refs - 1)
    if (this.#refs > 0) return
    this.#teardown = setTimeout(() => this.#close(), TEARDOWN_MS)
  }

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener)
    return () => {
      this.#listeners.delete(listener)
    }
  }

  getSnapshot = () => this.#snapshot

  /**
   * Envía un comando por la vía efímera. Resuelve cuando el frame sale por el socket:
   * el protocolo no acusa los efímeros, así que **esto no confirma la ejecución**.
   * Quien la confirma es el dispositivo, en su siguiente telemetría.
   */
  send(type: string, content: unknown): Promise<void> {
    if (this.#socket?.readyState !== WebSocket.OPEN) {
      this.#push("sin conexión: comando descartado", "warning", type)
      return Promise.reject(new Error("canal sin conexión"))
    }
    this.#seq += 1
    this.#socket.send(JSON.stringify({ t: "ephemeral", cl: String(this.#seq), type, content }))
    this.#push(JSON.stringify(content), "info", type)
    return Promise.resolve()
  }

  #emit() {
    for (const listener of this.#listeners) listener()
  }

  #update(patch: Partial<DeviceChannelSnapshot>) {
    this.#snapshot = { ...this.#snapshot, ...patch }
    this.#emit()
  }

  #push(message: string, level: DeviceLogEntry["level"], source?: string) {
    this.#seq += 1
    const entry: DeviceLogEntry = {
      id: `e${this.#seq}`,
      timestamp: new Date(),
      message,
      level,
      ...(source !== undefined ? { source } : {}),
    }
    this.#update({ log: [...this.#snapshot.log, entry].slice(-LOG_SIZE) })
  }

  #receive(msg: DeviceMessage) {
    this.#snapshot = {
      ...this.#snapshot,
      messages: [...this.#snapshot.messages, msg].slice(-BUFFER),
    }
    this.#emit()
  }

  async #connect() {
    if (this.#refs === 0) return
    this.#update({ status: "connecting" })

    let token: string
    try {
      token = await this.#getToken()
    } catch (error) {
      this.#update({ status: "offline" })
      this.#push(`no se pudo obtener el token: ${(error as Error).message}`, "error")
      this.#scheduleRetry()
      return
    }
    if (this.#refs === 0) return // soltado mientras se resolvía el token

    // La key `sk_` no viaja: el upgrade acepta solo el token (`key` es opcional).
    const url =
      `${this.#realtimeUrl}/v1/channels/${encodeURIComponent(this.channelId)}` +
      `?v=${PROTOCOL_VERSION}&token=${encodeURIComponent(token)}`

    const socket = new WebSocket(url)
    this.#socket = socket

    socket.onmessage = (event) => {
      let frame: Frame
      try {
        frame = JSON.parse(event.data as string)
      } catch {
        return
      }
      this.#onFrame(frame)
    }

    // Sin keepalive de aplicación: Portal rechaza `{"t":"ping"}` con `not_permitted`
    // pese a declararlo en su wire protocol. El del propio WebSocket basta.
    socket.onclose = () => {
      if (this.#socket !== socket) return // cierre de un socket ya reemplazado
      this.#socket = null
      if (this.#refs === 0) return
      this.#update({ status: "offline", me: null, readyAt: null })
      this.#push("conexión cerrada; reintentando", "warning")
      this.#scheduleRetry()
    }
    socket.onerror = () => this.#push("error de WebSocket", "error")
  }

  #onFrame(frame: Frame) {
    switch (frame.t) {
      case "ready": {
        const me = (frame as Extract<Frame, { t: "ready" }>).me.id
        this.#update({ status: "live", me, readyAt: Date.now() })
        this.#push(`conectado como ${me}`, "success")
        return
      }
      case "ephemeral": {
        const f = frame as Extract<Frame, { t: "ephemeral" }>
        this.#receive({
          type: f.type,
          content: f.content,
          senderId: f.userId,
          ephemeral: true,
          at: Date.now(),
        })
        return
      }
      case "batch": {
        for (const m of (frame as Extract<Frame, { t: "batch" }>).msgs) {
          this.#receive({
            type: m.type,
            content: m.content,
            senderId: m.sender.id,
            ephemeral: false,
            at: Date.now(),
          })
        }
        return
      }
      case "direct": {
        const m = (frame as Extract<Frame, { t: "direct" }>).msg
        this.#receive({
          type: m.type,
          content: m.content,
          senderId: m.sender.id,
          ephemeral: false,
          at: Date.now(),
        })
        return
      }
      case "error": {
        const f = frame as Extract<Frame, { t: "error" }>
        this.#push(`${f.code} ${f.reason ?? ""}`.trim(), "error", "PORTAL")
        return
      }
      // presence, activity, retract, watermark: el resto del protocolo no aplica a un
      // dispositivo. Se ignoran a propósito.
    }
  }

  #scheduleRetry() {
    clearTimeout(this.#retry)
    this.#retry = setTimeout(() => void this.#connect(), RECONNECT_MS)
  }

  #close() {
    clearTimeout(this.#retry)
    this.#retry = undefined
    const socket = this.#socket
    this.#socket = null
    socket?.close()
    this.#update({ status: "offline", me: null, readyAt: null })
  }
}
