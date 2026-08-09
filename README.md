# nexora-ui

UI component library for IoT / industrial monitoring UIs, built on a
"Technical Functionalism" design language.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- shadcn/ui primitives
- lucide-react icons
- `tw-animate-css` for animations

## Design language

Defined as CSS design tokens in `src/index.css`:

- **Semantic colors** — surfaces, brand, supporting, borders and data-viz
  chart scales are exposed as `--color-*` theme values (see `@theme inline`).
- **Brand** — dark green primary (`#006948`) on neutral surfaces.
- **Typography** — Inter Variable (sans) and JetBrains Mono Variable (mono,
  used for data, IDs, timestamps and technical labels).
- **Restrained rounding** — `--radius: 0.25rem`.

## Architecture

All components follow the same contract:

- **Presentation-only** — components never talk to hardware, devices,
  WebSockets, MQTT or REST. Data and connectivity flow in via props.
- **Controlled** — state lives in the consumer. Components report
  *intent* through callbacks (`onExecute`, `onCheckedChange`, `onApply`, …)
  and the consumer drives the resulting state back in.
- **Accessible** — keyboard support on interactive rows, `role="log"` on the
  console, `aria-busy` on in-flight actions, and `motion-reduce` guards on
  all animations.

## Components

### `src/components/iot/StatusBadge.tsx`
Operational state indicator. Presents the state passed in via `status`
(`"live" | "standby" | "alert" | "offline"`) — never infers it. The `live`
pulse animation is disabled under `prefers-reduced-motion`; state is always
conveyed by text as well as color. `label` overrides the visible text while
keeping the accessible name correctly cased.

### `src/components/iot/DeviceTable.tsx`
Inventory of IoT devices as a technical table (ID / NAME / STATUS /
LAST METRIC / LAST SEEN, plus an optional per-row ACTIONS column).
Presentation-only; `onSelect` makes rows focusable and Enter/Space
activable, and action buttons are labelled `"<ACTION>, <Device>"`.
`loading` shows a single loading row; an `emptyLabel` covers the empty
state.

### `src/components/iot/CommandLog.tsx`
Technical event/command console. Pure viewer — entries come in through the
`entries` prop (id, timestamp, message, level, optional source) and the
consumer owns the data flow. Auto-scroll only sticks to the bottom while
the user is near the end. Rendered with `role="log"`.

### `src/components/iot/ActuatorButton.tsx`
One-shot actuator command (START MOTOR, REBOOT NODE, EMERGENCY STOP, …).
Represents *intent* only: the consumer drives `status`
(`"idle" | "executing" | "success" | "error"`) and reacts to `onExecute`.
`executing` disables the button; `success`/`error` stay clickable for retry.
`variant="destructive"` for actions like EMERGENCY STOP.

### `src/components/iot/RelaySwitch.tsx`
Binary hardware control (pump, relay, valve). Strictly controlled:
`checked` always comes from the consumer and every interaction is reported
via `onCheckedChange`. `loading` marks an in-flight command (blocks the
switch and shows a pending indicator). Shows an ON/OFF readout.

### `src/components/iot/SetpointSlider.tsx`
Numeric setpoint editor (motor RPM, temperature limit, PWM, …). Separates
*selection* (slider → `onValueChange`) from *application* (APPLY SETPOINT
→ `onApply`). Out-of-range/non-finite values are clamped for rendering and
application; a degenerate range (`min === max`, NaN bounds) disables the
slider and blocks application. The APPLY button is disabled while no change
is pending (`appliedValue` matches the current value).

## `nexora-ui/portal` — the optional data layer

The component set above stays presentation-only, forever. `src/portal/` is a **second,
optional entry point** that connects those components to a real device over
[Portal](https://useportal.co):

```
nexora-ui          → presentation. No network. No device knowledge.
nexora-ui/portal   → transport + hooks + three connected wrappers.
```

```tsx
import { PortalDeviceProvider, ConnectedTelemetryCard } from "nexora-ui/portal"

<PortalDeviceProvider
  getToken={async () => (await (await fetch("/token")).json()).token}
  defaultChannelId="device:sim-esp32-01"
>
  <ConnectedTelemetryCard label="Temperature" metric="temperature" unit="°C" precision={1} />
</PortalDeviceProvider>
```

| Export | What it does |
|---|---|
| `PortalDeviceProvider` | Owns the channel registry — one socket per `channelId`, shared |
| `useTelemetry` | `{ latest, history, status, deviceId }` from the device's readings |
| `useActuator` | `{ execute, state }` — sends a command, acknowledges the *send* |
| `useDeviceLog` | Connection events shaped for `CommandLog` |
| `useDeviceChannel` | The primitive underneath. Escape hatch for your own vocabulary |
| `ConnectedTelemetryCard` / `ConnectedRealtimeChart` / `ConnectedActuatorButton` | hook + component, no logic of their own |

### The vocabulary

This is the actual asset. Any board that speaks it works with these hooks —
`portal-hardware/portal_device.py` is the reference implementation for Python boards
(ESP32, Raspberry Pi, Jetson).

| Concept | Channel | Transport | `type` | `content` |
|---|---|---|---|---|
| Telemetry | `device:{id}` | ephemeral | `"telemetry"` | flat object of readings |
| Command | `device:{id}` | ephemeral | `"{ACTUATOR}_COMMAND"` | `{ action: string }` |
| Event | `device:{id}` | persistent (HTTP) | `"alert"`, `"state_change"` | free |

- **Telemetry is always ephemeral.** One reading every 2 s, persisted, fills the channel
  history with noise and burns quota. Ephemeral frames carry no `seq`, no persistence and
  no history — exactly what a sensor needs.
- **One channel per device.** Two devices on one channel interleave readings.
- `content` is flat and serializable, ≤2 KB (Portal's limit).

### No API key in the bundle

`PortalDeviceProvider` deliberately takes **no** `apiKey`. Portal's WebSocket upgrade
authenticates on the token alone — the `key` query parameter is optional (verified against
the live API) — so your secret `sk_` key stays on your server and there is nothing to hide
in the bundle. `getToken` is the only authentication point; point it at an endpoint of
yours that mints the token.

### Why it doesn't use `@portalsdk/react`

The official SDK (`react@0.1.4` / `core@0.1.5`) **discards inbound ephemeral messages** —
the very channel telemetry travels on. From its own compiled source:

> SPEC: incoming ephemeral messages (no seq) are not modeled — the contract does not place
> them in the ordered window or bind them to a channel event, so they are dropped here
> rather than guessed at.

That contradicts its own `useChannel` JSDoc, which promises `onMessage` fires for messages
"persistent or ephemeral". Verified against the live API: the frames reach the browser
intact and `onMessage` never fires; send a *persistent* message on the same channel and it
fires immediately. The outbound direction works fine.

So `src/portal/channel.ts` implements Portal's wire protocol v1 directly — the browser twin
of `portal_device.py`. When the SDK learns to receive ephemerals, that one file is the only
thing to replace: the hooks are the seam.

## Scripts

```bash
npm run dev      # start the Vite dev server
npm run build    # type-check (tsc -b) + production build
npm run lint     # ESLint
npm run preview  # preview the production build
```

## Status

The nine IoT components are stable and presentation-only. `nexora-ui/portal` adds the
device layer; `GaugeCard`, `RelaySwitch`, `SetpointSlider` and `DeviceTable` have no
connected wrapper yet — no real use case has asked for one.

`src/portal/` is documented in Spanish, matching the Nexora project it was extracted from;
the component set stays in English. Worth unifying if this repo is ever published.
