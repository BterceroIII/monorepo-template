---
description: Delega una tarea a otro agente de herdr (handoff peer-to-peer)
---

Usá herdr-mesh para enviar este handoff a otro agente.

Argumentos: $ARGUMENTS

## Protocolo (barato en tokens)

1. Separá el destino (primer token) del resto (la tarea/instrucción).
2. Confirmá que el destino está vivo con `herdrmesh_herdr_agent_list`. Si no aparece, reportá el error y no envíes nada.
3. Asegurá que la tarea apunte a un archivo durable en `docs/` (contrato o handoff). Si el archivo no existe, creálo con el detalle del contrato antes de enviar.
4. Enviá con `herdrmesh_herdr_relay` un mensaje CORTO y autosuficiente: qué hacer + ruta del archivo. No adjuntes transcripts ni la salida de otros agentes.
5. No leas la salida completa del peer salvo que se te pida explícitamente.
6. Reportá el destino, el nombre del agente y el resultado de la entrega.

## Formato sugerido del mensaje al destino

`[HANDOFF] Leé <ruta-del-archivo> y ejecutá la tarea descrita. Contexto: <1-2 frases>.`
