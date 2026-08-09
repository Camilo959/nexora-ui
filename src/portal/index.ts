/**
 * Capa de datos IoT sobre Portal. Entrada opcional: `nexora-ui/portal`.
 *
 * Los componentes de `nexora-ui` siguen siendo presentacionales y no dependen de esto.
 * Lo que hay aquí es lo contrario: transporte sin pintar nada, más tres wrappers que
 * cosen ambas mitades.
 *
 * EL VOCABULARIO
 *
 *   Telemetría   canal `device:{id}` · efímera · type "telemetry"       · content: lecturas
 *   Comando      canal `device:{id}` · efímera · type "{ACTUADOR}_COMMAND" · content: { action }
 *   Evento       canal `device:{id}` · persistente (HTTP)               · content: libre
 *
 * Un canal por dispositivo: dos dispositivos en el mismo canal mezclan lecturas. La
 * telemetría es siempre efímera; persistir una lectura cada 2 s llena el historial del
 * canal de ruido. `content` es plano y serializable, ≤2 KB (límite de Portal).
 *
 * `portal-hardware/portal_device.py` es la implementación de referencia del lado de la
 * placa. Cualquier dispositivo que hable este vocabulario funciona con estos hooks.
 */
export { PortalDeviceProvider } from "./PortalDeviceProvider"
export type { PortalDeviceProviderProps } from "./PortalDeviceProvider"

export { PortalDeviceContext } from "./context"
export type { PortalDeviceContextValue } from "./context"

export { useTelemetry } from "./useTelemetry"
export type { UseTelemetryParams, UseTelemetryResult } from "./useTelemetry"

export { useActuator } from "./useActuator"
export type { UseActuatorParams, UseActuatorResult } from "./useActuator"

export { useDeviceLog } from "./useDeviceLog"

export { useDeviceChannel } from "./useDeviceChannel"
export type { UseDeviceChannelResult } from "./useDeviceChannel"

export { ConnectedTelemetryCard } from "./ConnectedTelemetryCard"
export type { ConnectedTelemetryCardProps } from "./ConnectedTelemetryCard"

export { ConnectedRealtimeChart } from "./ConnectedRealtimeChart"
export type { ConnectedRealtimeChartProps } from "./ConnectedRealtimeChart"

export { ConnectedActuatorButton } from "./ConnectedActuatorButton"
export type { ConnectedActuatorButtonProps } from "./ConnectedActuatorButton"

export { DeviceChannel } from "./channel"
export type {
  DeviceChannelOptions,
  DeviceChannelSnapshot,
  DeviceLogEntry,
  DeviceMessage,
  DeviceStatus,
} from "./channel"
