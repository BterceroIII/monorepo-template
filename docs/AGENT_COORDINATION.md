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
  "herdrmesh_herdr_agent_list": true
}
```

Solo se expone una tool (para no gastar contexto):

- `herdrmesh_herdr_agent_list` — listar agentes vivos y su estado (`idle`/`working`/`blocked`/`done`).

> ⚠️ `herdrmesh_herdr_relay` y `herdrmesh_herdr_handoff` están **deshabilitadas** porque están rotas contra herdr 0.8.0 (llaman a `agent send`, que no existe). Para enviar usá el CLI `herdr agent prompt <pane_id> '<mensaje>'`; ver [Problemas conocidos](#problemas-conocidos).

Si necesitás leer la respuesta explícitamente, habilitá `herdrmesh_herdr_agent_read` en `tools`.

## Flujo de un handoff

1. El agente origen detecta que necesita trabajo de otro dominio (backend/frontend/infra).
2. Escribe el contrato o handoff en un archivo durable:
   - Frontend → backend: `docs/frontend/backend-requests/<slug>.md` + registro en `docs/frontend/backend-requests/INDEX.md`.
   - Backend → frontend: `docs/frontend/<TOPIC>_HANDOFF.md`.
3. Ejecutás `/handoff <destino> <tarea>` en la sesión del agente origen.
4. El agente origen resuelve el `pane_id` del destino con `herdr agent list` y manda el mensaje corto con el CLI:

   ```bash
   herdr agent prompt <pane_id> '[HANDOFF] Leé <ruta> y ejecutá la tarea descrita. Contexto: <1-2 frases>.'
   ```

   No uses la tool MCP `herdrmesh_herdr_relay`: está rota en herdr 0.8.0 (ver [Problemas conocidos](#problemas-conocidos)).
5. El agente destino (que debe estar vivo e `idle`) recibe el mensaje, lee el archivo y ejecuta.

## Guía de tokens

- El mensaje vivo es un **puntero**, no un transcript. No adjuntes la salida completa del otro agente.
- No uses `herdrmesh_herdr_agent_read` salvo que se pida explícitamente; lee panes crudos (con UI/reasoning) infla el contexto.
- El contexto pesado vive en los archivos `docs/`, que cada agente lee bajo demanda.

## Límites

- herdr-mesh **no garantiza** entrega, ni lleva estado de tarea, ni reintenta.
- Una acción destructiva/privilegiada enviada por otro agente **siempre requiere aprobación humana**.
- Si el destino no está vivo o está `blocked`, el mensaje no se procesa hasta que se desbloquee.

## Problemas conocidos

### herdrmesh roto contra herdr 0.8.0

- **Fecha:** 2026-09-27 (reverificado 2026-09-28)
- **Entorno:** `herdr 0.8.0` (protocol 19, server `running`); `herdr-mesh 0.1.0`
  (`npx -y runchr-works/herdr-mesh`, sin pinear, `opencode.json`).
- **Síntoma:** `herdrmesh_herdr_agent_list` funciona, pero `herdrmesh_herdr_relay` y
  `herdrmesh_herdr_handoff` no entregan. Con `terminal_id` como target (p. ej. `term_65c7fec49c663d`)
  falla con `Error: could not resolve pane_id for target "<terminal_id>"`; con `pane_id` como target
  la entrega falla con `failed: herdr agent commands:` seguido del dump de ayuda de `herdr agent`.
- **Causas raíz** (3, verificadas en `herdr-mesh/dist/tools/composite.js` y contra el CLI):
  1. **`agent send` no existe** (`composite.js:59,96`). herdrmesh llama
     `herdr agent send <target> <text>`, pero herdr 0.8.0 solo tiene `herdr agent prompt <target> <text>`
     (escribe + Enter) y `herdr agent send-keys <target> <key...>`. El comando sale con exit `2` e imprime
     el help de `herdr agent`, que es el texto que devuelve el tool.
  2. **`terminal_id` no se resuelve** (`composite.js:28-41`). `resolvePaneId` solo acepta `pane_id`:
     `herdr agent get term_...` da `agent_not_found` y `herdr pane get term_...` da `pane_not_found`,
     aunque la doc de la tool mencione terminal ids.
  3. **`agent wait --status` es inválido** (`composite.js:100`, usado por `herdr_handoff`). El flag real
     es `--until`: `herdr agent wait <target> --status idle` → `unknown option: --status`. Aun arreglando
     (1) y (2), el handoff seguiría fallando.
- **Workaround (vía primaria):** resolver el `pane_id` con `herdr agent list` y enviar con el CLI directo:

  ```bash
  herdr agent prompt w6:p3 '[HANDOFF] Leé docs/... y ejecutá la tarea descrita.'
  ```

  Verificar la entrega con `herdr agent get w6:p3`: el estado debe pasar de `idle` a `working` y el
  `terminal_title` debe reflejar la tarea.

- **Fix propuesto:** actualizar herdrmesh para llamar `herdr agent prompt <target> <text>`, resolver
  `terminal_id` → `pane_id`, y usar `agent wait --until`. Sigue **sin corregir** en `main` upstream a
  2026-09-28 (verificado); reportar en https://github.com/runchr-works/herdr-mesh/issues.
