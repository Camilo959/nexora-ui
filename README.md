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

## Scripts

```bash
npm run dev      # start the Vite dev server
npm run build    # type-check (tsc -b) + production build
npm run lint     # ESLint
npm run preview  # preview the production build
```

## Status

In progress. Only the six IoT components above exist; no device or
connectivity layer has been added yet.
