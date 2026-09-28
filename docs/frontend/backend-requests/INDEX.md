# Frontend → Backend requests

Solicitudes de cambios de backend que el frontend necesita para completar una feature.
Cada solicitud vive en su propio archivo y describe el contrato exacto (endpoint, payload,
respuesta, errores y criterios de verificación).

| Solicitud | Estado | Descripción | Fecha |
|---|---|---|---|
| [likes-counter.md](./likes-counter.md) | Completada | Posts con contador de likes tipo Instagram (listar, dar y quitar like). Handoff: [LIKES_HANDOFF.md](../LIKES_HANDOFF.md) | 2026-09-27 |

## Estados

- `Pendiente`: solicitada, sin implementar en backend.
- `En progreso`: el agente backend la está implementando.
- `Completada`: implementada; el handoff de backend se documenta en `docs/frontend/<TOPIC>_HANDOFF.md`.
