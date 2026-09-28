# Handoff — Posts con contador de likes

- **Solicitud origen:** [backend-requests/likes-counter.md](./backend-requests/likes-counter.md)
- **Estado:** Completada
- **Fecha:** 2026-09-27
- **Módulo backend:** `posts`
- **Documentación backend:** `docs/backend/POSTS_MODULE.md`

## Resumen

El backend implementa los tres endpoints que el frontend ya consumía. **El contrato no
cambió**: los shapes de request/response, los campos y los códigos de error esperados son
los documentados en la solicitud. No hay trabajo obligatorio de frontend; la página
`/likes` debería funcionar sin cambios.

## Endpoints

Base path: `/api/v1`. Todos requieren sesión (`JwtAuthGuard`, cookie `auth_token`).

| Endpoint | Uso frontend |
|---|---|
| `GET /api/v1/posts` | `src/services/likes/likes.service.ts` → `fetchPosts` |
| `POST /api/v1/posts/:postId/likes` | `likePost` |
| `DELETE /api/v1/posts/:postId/likes` | `unlikePost` |

## Contrato de respuesta

Sin cambios respecto a lo solicitado. `Post`:

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "caption": "Atardecer en la montaña",
  "imageUrl": null,
  "author": { "id": "uuid", "name": "Admin" },
  "likeCount": 0,
  "likedByCurrentUser": false,
  "createdAt": "2026-09-27T12:00:00.000Z"
}
```

`PostLikeState` (`POST`/`DELETE`):

```json
{ "postId": "uuid", "likeCount": 1, "likedByCurrentUser": true }
```

- **Campos añadidos:** ninguno.
- **Campos eliminados:** ninguno.
- `author` puede ser `null` (si el autor fue eliminado); `caption` e `imageUrl` pueden ser
  `null`.
- `GET /posts` no está paginado: devuelve un arreglo plano ordenado por `createdAt`
  descendente.

## Errores esperados

| Status | Cuándo |
|---|---|
| `401` | Sin sesión válida (los 3 endpoints). |
| `404` | El `postId` no existe (`POST`/`DELETE`). |
| `400` | `postId` con formato distinto a UUID (nuevo, solo si la UI enviara un id inválido). |

El `400` es defensivo y no altera el flujo normal; el id que devuelve `GET /posts` siempre
es un UUID válido.

## Comportamiento de UI requerido

- Ninguno obligatorio: no hay cambios de contrato.
- El estado de error con reintento de `/likes` ya no debería dispararse por `404`/`500`
  del backend.
- Se recomienda (opcional) mostrar la publicación demo sembrada (`Atardecer en la montaña`)
  para validar el flujo en desarrollo.

## Verificación frontend

```bash
pnpm --filter frontend lint
pnpm --filter frontend build
pnpm --filter frontend run doctor:ci
```

Prueba funcional sugerida: iniciar sesión, abrir `/likes`, alternar el like y comprobar
que el contador persiste tras recargar (la mutación invalida `["posts"]`).
