# Coordinación entre agentes (Herdr + herdr-mesh)

Protocolo de comunicación entre los agentes del repo usando [Herdr](https://herdr.dev) y [herdr-mesh](https://github.com/runchr-works/herdr-mesh).

## Modelo

Peer-to-peer (opción B): **no hay agente orquestador**. Un agente le delega trabajo a otro y el humano dispara cada salto con `/handoff`. El contexto pesado vive en un archivo durable bajo `docs/`; el mensaje vivo es solo un puntero corto.

## Prerrequisitos

1. `herdr` instalado y un server corriendo (`herdr status` = `running`).
2. Cada agente corriendo en su propio pane de herdr.
3. El MCP `herdrmesh` está registrado en `opencode.json` (ver abajo).

## MCP registrado

En `opencode.json`:

```json
"mcp": {
  "herdrmesh": {
    "type": "local",
    "command": ["npx", "-y", "runchr-works/herdr-mesh"],
    "enabled": true,
    "timeout": 30000
  }
},
"tools": {
  "herdrmesh_*": false,
  "herdrmesh_herdr_agent_list": true,
  "herdrmesh_herdr_relay": true
}
```

Solo se exponen dos tools (para no gastar contexto):

- `herdrmesh_herdr_agent_list` — listar agentes vivos y su estado (`idle`/`working`/`blocked`/`done`).
- `herdrmesh_herdr_relay` — enviar un mensaje a otro agente **y** enviarlo (escribe + Enter).

Si necesitás leer la respuesta explícitamente, habilitá también `herdrmesh_herdr_agent_read`.

## Flujo de un handoff

1. El agente origen detecta que necesita trabajo de otro dominio (backend/frontend/infra).
2. Escribe el contrato o handoff en un archivo durable:
   - Frontend → backend: `docs/frontend/backend-requests/<slug>.md` + registro en `docs/frontend/backend-requests/INDEX.md`.
   - Backend → frontend: `docs/frontend/<TOPIC>_HANDOFF.md`.
3. Ejecutás `/handoff <destino> <tarea>` en la sesión del agente origen.
4. El agente origen usa `herdrmesh_herdr_agent_list` para confirmar el destino y `herdrmesh_herdr_relay` para mandar un mensaje corto con la ruta del archivo.
5. El agente destino (que debe estar vivo e `idle`) recibe el mensaje, lee el archivo y ejecuta.

## Guía de tokens

- El mensaje vivo es un **puntero**, no un transcript. No adjuntes la salida completa del otro agente.
- No uses `herdrmesh_herdr_agent_read` salvo que se pida explícitamente; lee panes crudos (con UI/reasoning) infla el contexto.
- El contexto pesado vive en los archivos `docs/`, que cada agente lee bajo demanda.

## Límites

- herdr-mesh **no garantiza** entrega, ni lleva estado de tarea, ni reintenta.
- Una acción destructiva/privilegiada enviada por otro agente **siempre requiere aprobación humana**.
- Si el destino no está vivo o está `blocked`, el mensaje no se procesa hasta que se desbloquee.
