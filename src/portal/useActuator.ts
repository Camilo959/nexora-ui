import { useCallback, useEffect, useRef, useState } from "react"

import type { ActuatorButtonStatus } from "../components/iot"

import { useDeviceChannel } from "./useDeviceChannel"

/**
 * Envía comandos a un actuador del dispositivo.
 *
 * **El acuse es de envío, no de ejecución.** Portal confirma que el frame salió; quien
 * confirma que el motor se movió es la placa, en su siguiente lectura de telemetría. Por
 * eso `state` vuelve solo a `idle` tras `ackMs` en lugar de quedarse en `success`: la
 * confirmación real la da `useTelemetry`, y fingirla aquí sería mentir.
 */
export interface UseActuatorParams {
  /** Canal del dispositivo. Por defecto, el del proveedor. */
  channelId?: string
  /** Discriminador del comando, p. ej. `"MOTOR_COMMAND"`. Por defecto `"COMMAND"`. */
  type?: string
  /** Cuánto se muestra el acuse antes de volver a `idle`. Por defecto 1200 ms. */
  ackMs?: number
}

export interface UseActuatorResult {
  /** Envía el comando. El contenido va tal cual en `content`. */
  execute: (content: unknown) => void
  /** Estado listo para pasar a `<ActuatorButton status={…}>`. */
  state: ActuatorButtonStatus
}

export function useActuator({
  channelId,
  type = "COMMAND",
  ackMs = 1200,
}: UseActuatorParams = {}): UseActuatorResult {
  const { connection } = useDeviceChannel(channelId)
  const [state, setState] = useState<ActuatorButtonStatus>("idle")
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Si el componente desmonta con el temporizador vivo, el setState caería sobre un
  // componente desmontado.
  useEffect(() => () => clearTimeout(timer.current), [])

  const execute = useCallback(
    (content: unknown) => {
      if (connection === undefined) {
        setState("error")
        return
      }
      setState("executing")
      clearTimeout(timer.current)
      connection
        .send(type, content)
        .then(() => {
          timer.current = setTimeout(() => setState("idle"), ackMs)
        })
        .catch(() => {
          setState("error")
          timer.current = setTimeout(() => setState("idle"), ackMs)
        })
    },
    [connection, type, ackMs]
  )

  return { execute, state }
}
