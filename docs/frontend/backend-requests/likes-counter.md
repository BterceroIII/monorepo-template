# Backend request — Posts con contador de likes (estilo Instagram)

- **Slug:** `likes-counter`
- **Estado:** Completada
- **Fecha:** 2026-09-27
- **Handoff:** [LIKES_HANDOFF.md](../LIKES_HANDOFF.md)
- **Documentación backend:** [POSTS_MODULE.md](../../backend/POSTS_MODULE.md)
- **Solicitante:** frontend
- **Módulo backend propuesto:** `posts` (con relación de likes)

## Contexto

El frontend implementa una tarjeta de publicación estilo Instagram con un contador de likes
persistido en el backend. No existe modelo ni endpoint de posts/likes todavía; el frontend
ya consume el contrato descrito abajo.

## Alcance solicitado

1. Persistir publicaciones (`Post`) y los likes por usuario (`PostLike`).
2. Exponer listado de publicaciones con `likeCount` y `likedByCurrentUser`.
3. Permitir dar y quitar like de forma idempotente.
4. Sembrar al menos una publicación de demo para que el listado no quede vacío.

## Modelo Prisma propuesto

```prisma
model Post {
  id        String     @id @default(uuid()) @db.Uuid
  caption   String?    @db.VarChar(2200)
  imageUrl  String?    @map("image_url") @db.VarChar(2048)
  authorId  String?    @map("author_id") @db.Uuid
  author    User?      @relation(fields: [authorId], references: [id], onDelete: SetNull)
  likes     PostLike[]
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  @@index([createdAt])
  @@map("posts")
}

model PostLike {
  id        String   @id @default(uuid()) @db.Uuid
  postId    String   @map("post_id") @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([postId, userId])
  @@index([userId])
  @@map("post_likes")
}
```

> Añadir la relación inversa correspondiente en `User` (`posts Post[]`, `postLikes PostLike[]`).

## Contrato de endpoints

Base path: `/api/v1`. Todos requieren sesión (`JwtAuthGuard`, cookie `auth_token`).

### `GET /api/v1/posts`

- **Respuesta 200:** `PostResponseDto[]`
- **Errores:** `401` si no hay sesión válida.
- **Orden:** `createdAt` descendente.

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "caption": "Atardecer en la montaña",
    "imageUrl": "https://example.com/photo.jpg",
    "author": { "id": "uuid", "name": "Ana Pérez" },
    "likeCount": 42,
    "likedByCurrentUser": true,
    "createdAt": "2026-09-27T12:00:00.000Z"
  }
]
```

### `POST /api/v1/posts/:postId/likes`

- **Descripción:** registra el like del usuario actual. Idempotente: repetir la llamada no duplica.
- **Respuesta 200:** `PostLikeStateDto`.
- **Errores:** `401` sin sesión, `404` si el post no existe.

### `DELETE /api/v1/posts/:postId/likes`

- **Descripción:** elimina el like del usuario actual. Idempotente.
- **Respuesta 200:** `PostLikeStateDto`.
- **Errores:** `401` sin sesión, `404` si el post no existe.

`PostLikeStateDto`:

```json
{
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "likeCount": 43,
  "likedByCurrentUser": true
}
```

## DTOs requeridos (Swagger)

- `PostAuthorDto` (`id`, `name`).
- `PostResponseDto` (`id`, `caption`, `imageUrl`, `author`, `likeCount`, `likedByCurrentUser`, `createdAt`).
- `PostLikeStateDto` (`postId`, `likeCount`, `likedByCurrentUser`).

Aplicar las reglas de `docs/backend/API_DOCUMENTATION_GUIDE.md`: `@ApiTags('Posts')`,
`@ApiOperation`, `@ApiResponse` de éxito y de errores reales, y orden de handlers
(`@Get`, `@Post`, `@Delete`).

## Recomendaciones de implementación

- Seguir `docs/backend/MODULE_STRUCTURE.md` y el Repository Pattern: `PostRepository`
  y `PostLikeRepository` (un repository por modelo Prisma).
- Calcular `likeCount` con `_count` y `likedByCurrentUser` con un `findUnique` sobre
  `@@unique([postId, userId])`; no traer todas las filas de likes.
- `likeCount` nunca debe ser negativo.
- Sembrar una publicación en `apps/backend/prisma/seed.ts` para la demo.

## Criterios de verificación

- `pnpm --filter backend build` y `pnpm --filter backend test --runInBand` sin errores.
- Swagger muestra los 3 endpoints documentados en el tag `Posts`.
- Con sesión: `GET /posts` devuelve al menos la publicación semilla.
- `POST` incrementa en 1 y `DELETE` decrementa en 1; repetir cualquiera no altera el conteo.
- Sin cookie de sesión, los 3 endpoints responden `401`.

## Impacto en frontend

El frontend ya consume:

- `GET /posts` → `src/services/likes/likes.service.ts`
- `POST /posts/:postId/likes` y `DELETE /posts/:postId/likes` → mismo archivo.

Hasta que el backend esté implementado, la página `/likes` muestra el estado de error con
reintento. Al completarse, actualizar esta solicitud a `Completada` en `INDEX.md` y documentar
el handoff en `docs/frontend/LIKES_HANDOFF.md` si el contrato cambia.
