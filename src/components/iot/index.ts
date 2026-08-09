/**
 * Public entry point for the IoT component set.
 *
 * Only presentation-level components live here. Nothing in this module
 * performs network, device or data communication; the consumer owns all
 * of that logic and feeds it in through props.
 */
export { StatusBadge } from "./StatusBadge"
export type { StatusBadgeProps, StatusBadgeStatus } from "./StatusBadge"

export { TelemetryCard } from "./TelemetryCard"
export type { TelemetryCardProps, TelemetryStatus, TelemetryTrend } from "./TelemetryCard"

export { GaugeCard } from "./GaugeCard"
export type { GaugeCardProps, GaugeStatus } from "./GaugeCard"

export { RealtimeChartCard } from "./RealtimeChartCard"
export type { RealtimeChartCardProps, RealtimeChartStatus } from "./RealtimeChartCard"

export { ActuatorButton } from "./ActuatorButton"
export type { ActuatorButtonProps, ActuatorButtonStatus } from "./ActuatorButton"

export { RelaySwitch } from "./RelaySwitch"
export type { RelaySwitchProps } from "./RelaySwitch"

export { SetpointSlider } from "./SetpointSlider"
export type { SetpointSliderProps } from "./SetpointSlider"

export { CommandLog } from "./CommandLog"
export type {
  CommandLogEntry,
  CommandLogLevel,
  CommandLogProps,
} from "./CommandLog"

export { DeviceTable } from "./DeviceTable"
export type {
  DeviceTableAction,
  DeviceTableDevice,
  DeviceTableMetric,
  DeviceTableProps,
} from "./DeviceTable"
