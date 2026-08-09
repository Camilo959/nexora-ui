# Media

Capturas y vídeo de la librería funcionando. **Todo está grabado contra Portal de verdad,
con un ESP32 simulado publicando de verdad**: los números que se ven llegaron por el canal
mientras se grababa. Lo único sintético es la voz del vídeo narrado.

Nada de esto viaja en el paquete npm. `files` incluye `docs/*.md`, no `docs/` entero — son
15 MB, y quien instala una librería de 70 kB no debería bajárselos.

## Imágenes

| | |
|---|---|
| `ejemplo.png` | La app de [`example/`](../../example), en vivo. Es el ejemplo de la librería |
| `dashboard.png` | El frontend de la aplicación, con el motor girando |
| `comparativa.png` | Astro y React sobre el mismo canal, en el mismo instante |

## Vídeo

| | |
|---|---|
| `demo-narrada-inworld.mp4` | **2:15 · con locución.** El que se presenta |
| `astro-full.mp4` | 1:48 · las tres escenas seguidas, sin audio |
| `comparativa.mp4` | 1:48 · las dos aplicaciones lado a lado |
| `astro-0{1,2,3}-*.mp4` | telemetría · comando · desconexión, sueltas |
| `react-*.mp4` | lo mismo desde el dashboard de React |

1920×1080, 30 fps. Solo `demo-narrada-*` lleva audio.

## Volver a generarlo

Los dos scripts viven fuera del repo, en `demo-video/`, porque necesitan el simulador y
la `PORTAL_KEY` del repo de la aplicación. Escriben aquí directamente.

```bash
cd demo-video
python record_demo.py              # graba los clips
python narracion.py --voz inworld  # les pone la locución
```

`guion.md`, junto a esos scripts, tiene la locución con sus tiempos y las tres trampas que
muerden al grabar en directo.
