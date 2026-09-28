---
description: Delega una tarea a otro agente de herdr (handoff peer-to-peer)
---

Enviá este handoff a otro agente de herdr (discovery vía herdr-mesh, entrega vía CLI).

Argumentos: $ARGUMENTS

## Protocolo (barato en tokens)

1. Separá el destino (primer token) del resto (la tarea/instrucción).
2. Confirmá que el destino está vivo y obtené su `pane_id` con `herdr agent list` (campo `pane_id`). Si no aparece o no está `idle`, reportá y no envíes nada.
3. Asegurá que la tarea apunte a un archivo durable en `docs/` (contrato o handoff). Si el archivo no existe, creálo con el detalle del contrato antes de enviar.
4. Enviá un mensaje CORTO y autosuficiente con el CLI, no con la tool MCP (rota en herdr 0.8.0; ver `docs/AGENT_COORDINATION.md` → Problemas conocidos):

   ```bash
   herdr agent prompt <pane_id> '[HANDOFF] Leé <ruta-del-archivo> y ejecutá la tarea descrita. Contexto: <1-2 frases>.'
   ```

   No adjuntes transcripts ni la salida de otros agentes.
5. No leas la salida completa del peer salvo que se te pida explícitamente.
6. Reportá el destino, el nombre del agente y el resultado de la entrega. Verificá con `herdr agent get <pane_id>` que el estado pasó de `idle` a `working`.

## Formato sugerido del mensaje al destino

`[HANDOFF] Leé <ruta-del-archivo> y ejecutá la tarea descrita. Contexto: <1-2 frases>.`
