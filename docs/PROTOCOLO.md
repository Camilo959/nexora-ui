# El vocabulario

`nexora-iot-ui/portal` no es un cliente genérico de Portal: espera que el dispositivo hable
un contrato concreto. **Ese contrato es el activo de esta librería** — los hooks son
cuatrocientas líneas que cualquiera reescribe; lo que hace que una placa nueva funcione
sin tocar el frontend es esto.

Cualquier dispositivo que lo hable funciona con estos componentes, sea un ESP32, una
Raspberry o un servicio que reenvía datos de otro sitio.

## Las tres formas de mensaje

| Concepto | Canal | Transporte | `type` | `content` |
|---|---|---|---|---|
| Telemetría | `device:{id}` | efímero | `"telemetry"` | objeto plano de lecturas |
| Comando | `device:{id}` | efímero | `"{ACTUADOR}_COMMAND"` | `{ action: string, … }` |
| Evento | `device:{id}` | persistente (HTTP) | `"alert"`, `"state_change"` | libre |

```jsonc
// placa -> navegador, cada 2 s
{ "type": "telemetry",
  "content": { "deviceId": "esp32-01", "temperature": 24.7, "humidity": 56,
               "motor_status": "STOPPED", "motor_position": 0 } }

// navegador -> placa
{ "type": "MOTOR_COMMAND",
  "content": { "action": "START_MOTOR", "rpm": 120, "direction": "CW" } }
```

## Las cuatro reglas

**La telemetría es siempre efímera.** Una lectura cada dos segundos, persistida, llena el
historial del canal de ruido y consume cuota. El frame `ephemeral` no lleva `seq`, no se
guarda y no aparece en el historial: exactamente lo que necesita un sensor cuya lectura
de hace una hora no le importa a nadie. Reserva el publish persistente para lo que sí
vale releer — una alarma, un cambio de estado.

**Un canal por dispositivo.** Dos dispositivos en el mismo canal entrelazan lecturas y
`useTelemetry` no tiene forma de separarlas: verías una sola serie saltando entre dos
placas.

**El estado lo dicta el hardware, no la interfaz.** Un comando no cambia lo que se pinta.
`ConnectedActuatorButton` confirma el *envío*; que el motor gire se sabe porque la
siguiente telemetría lo dice. Es más lento de escribir y es la diferencia entre un panel
y una animación.

**`content` es plano y serializable**, máximo 2 KB — es el límite de Portal.

## El otro extremo

`portal_device.py` (en el repo de la aplicación) es la implementación de referencia para
placas en Python. El bucle mínimo:

```python
import asyncio
from portal_device import PortalDevice

dev = PortalDevice(api_key="sk_...", channel="device:mi-placa")

@dev.on_command
def handle(tipo, content):
    if tipo == "MOTOR_COMMAND":
        motor.start() if content["action"] == "START_MOTOR" else motor.stop()

asyncio.run(dev.run(read_sensors=lambda: {"temperature": leer_dht11()}, interval=2.0))
```

El cambio de estado no se responde: vuelve solo en la siguiente lectura de telemetría.

## Autenticación

`PortalDeviceProvider` **no acepta `apiKey`**, a propósito. El upgrade del WebSocket de
Portal se autentica solo con el token — el parámetro `key` es opcional, verificado contra
la API real —, así que tu key secreta `sk_` se queda en tu servidor y en el bundle no hay
nada que esconder.

`getToken` es el único punto de autenticación. Apúntalo a un endpoint tuyo que acuñe el
token:

```
POST https://api.useportal.co/v1/tokens/anonymous     cabecera x-portal-key: sk_…
```

Los tokens anónimos duran una hora; `DeviceChannel` los vuelve a pedir al reconectar.

## Hallazgos del protocolo real

Portal no documenta su wire protocol. Esto salió de los tipos de
`@portalsdk/wire-protocol@0.3.0` **y de probar contra la API**. Los tres primeros
contradicen o completan lo que dice el SDK.

| Hallazgo | Consecuencia |
|---|---|
| **El SDK oficial descarta los efímeros entrantes** (`core@0.1.5`), pese a que su `useChannel` promete disparar `onMessage` con "persistent or ephemeral" | Con el SDK no llega la telemetría. Por eso `src/portal/channel.ts` implementa el protocolo directamente |
| El servidor **reenvía los efímeros** a los demás como `{t, userId, type, content}` | No está en los tipos del SDK, que solo declaran `ephemeral` de cliente a servidor. Es la vía por la que llegan los comandos |
| El parámetro `key` del upgrade es **opcional** | El navegador se conecta solo con el token; la secret key se queda en el servidor |
| **Portal rechaza el frame `{"t":"ping"}`** con `not_permitted`, aunque el SDK lo declara válido | El keepalive va a nivel de protocolo WebSocket, no de aplicación. `channel.ts` no manda ping propio |
| Los canales se **autocrean** al conectarse | No hace falta declararlos por adelantado |
| `anonId` lo asigna el servidor, con formato `anon_…` | No puedes inventarlo: acuñas sin `anonId` y lees el `sub` del JWT |
| Cloudflare rechaza el User-Agent por defecto de `urllib` con error 1010 | Solo afecta al lado servidor/placa: sin cabecera `user-agent` ninguna petición HTTP llega |

```
WS   wss://realtime.useportal.co/v1/channels/{id}?v=1&token=…&leaf=…&meta=…
HTTP https://api.useportal.co/v1/channels/{id}/messages   POST · Bearer sk_ + senderId
     https://api.useportal.co/v1/tokens/anonymous         POST · x-portal-key
```

Ignorados a propósito: `presence`, `activity`, `retract`, `watermark` y el socket de
inbox. Un sensor no tiene bandeja de entrada.

## Si el SDK se arregla

`src/portal/channel.ts` es la única pieza que toca el cable. Los hooks son la costura: el
día que `@portalsdk` reciba efímeros, se reemplaza ese archivo y nada más — ni los
componentes, ni los wrappers, ni tu aplicación se enteran.
