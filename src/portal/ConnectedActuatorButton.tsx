import { ActuatorButton } from "../components/iot"
import type { ActuatorButtonProps } from "../components/iot"

import { useActuator } from "./useActuator"

/**
 * `ActuatorButton` conectado: al pulsarlo envía un comando por el canal.
 *
 * El botón acusa el envío, no la ejecución. Que el actuador se haya movido de verdad se
 * ve en la telemetría — normalmente en la misma pantalla, a un par de segundos.
 */
export interface ConnectedActuatorButtonProps
  extends Omit<ActuatorButtonProps, "status" | "onExecute"> {
  /** Canal del dispositivo. Por defecto, el del proveedor. */
  channelId?: string
  /** Discriminador del comando, p. ej. `"MOTOR_COMMAND"`. */
  commandType: string
  /** Contenido del comando. Por convención, `{ action }`. */
  action: unknown
  /** Cuánto se muestra el acuse antes de volver a `idle`. Por defecto 1200 ms. */
  ackMs?: number
}

export function ConnectedActuatorButton({
  channelId,
  commandType,
  action,
  ackMs,
  ...props
}: ConnectedActuatorButtonProps) {
  const { execute, state } = useActuator({
    ...(channelId !== undefined ? { channelId } : {}),
    type: commandType,
    ...(ackMs !== undefined ? { ackMs } : {}),
  })

  return <ActuatorButton {...props} status={state} onExecute={() => execute(action)} />
}
