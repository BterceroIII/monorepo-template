# Posts module (publicaciones y likes)

Documentación del módulo backend `posts`, que persiste publicaciones y los likes por
usuario, y expone el contrato consumido por la feature `likes` del frontend.

## Alcance

- Persistir publicaciones (`Post`) y likes por usuario (`PostLike`).
- Listar publicaciones con `likeCount` y `likedByCurrentUser` del usuario autenticado.
- Dar y quitar like de forma idempotente.
- Sembrar una publicación de demo para que el listado no quede vacío.

## Modelo de datos

Añadido en `apps/backend/prisma/schema.prisma`:

| Modelo | Tabla | Campos clave | Relaciones |
|---|---|---|---|
| `Post` | `posts` | `id`, `caption`, `imageUrl`, `authorId`, `createdAt`, `updatedAt` | `author` → `User` (`onDelete: SetNull`), `likes` → `PostLike[]` |
| `PostLike` | `post_likes` | `id`, `postId`, `userId`, `createdAt` | `post` → `Post` (`onDelete: Cascade`), `user` → `User` (`onDelete: Cascade`) |

- `Post` tiene índice por `createdAt` para ordenar el listado.
- `PostLike` tiene `@@unique([postId, userId])`, que garantiza idempotencia y evita
  duplicados; además tiene índice por `userId`.
- `User` incorpora las relaciones inversas `posts` y `postLikes`.

### Migración

Migración inicial del proyecto, creada y aplicada con Prisma CLI:

```bash
pnpm --filter backend prisma:migrate --name add_posts_and_post_likes
```

Carpeta: `apps/backend/prisma/migrations/20260928043012_add_posts_and_post_likes/`.

## Endpoints

Base path: `/api/v1`. Todos requieren sesión (`JwtAuthGuard`, cookie `auth_token` o
`Authorization: Bearer`).

### `GET /api/v1/posts`

- **Respuesta 200:** `PostResponseDto[]`, ordenado por `createdAt` descendente.
- **Errores:** `401` sin sesión válida.
- Sin paginación: el contrato consumido por el frontend es un arreglo plano.

### `POST /api/v1/posts/:postId/likes`

- Registra el like del usuario actual. Idempotente (usa `upsert` sobre la clave única).
- **Respuesta 200:** `PostLikeStateDto`.
- **Errores:** `400` si `postId` no es un UUID válido, `401` sin sesión, `404` si el post no existe.

### `DELETE /api/v1/posts/:postId/likes`

- Elimina el like del usuario actual. Idempotente (`deleteMany` sobre `postId`+`userId`).
- **Respuesta 200:** `PostLikeStateDto`.
- **Errores:** `400` si `postId` no es un UUID válido, `401` sin sesión, `404` si el post no existe.

### DTOs

- `PostAuthorDto`: `id`, `name` (nullable).
- `PostResponseDto`: `id`, `caption` (nullable), `imageUrl` (nullable), `author`
  (`PostAuthorDto | null`), `likeCount`, `likedByCurrentUser`, `createdAt`.
- `PostLikeStateDto`: `postId`, `likeCount`, `likedByCurrentUser`.

Los tres endpoints están documentados en Swagger con el tag `Posts`.

## Estructura del módulo

```
apps/backend/src/posts/
├── posts.module.ts
├── posts.controller.ts
├── posts.service.ts
├── dto/
│   ├── post-author.dto.ts
│   ├── post-response.dto.ts
│   └── post-like-state.dto.ts
├── repositories/
│   ├── post.repository.ts
│   └── post-like.repository.ts
└── test/
    ├── posts.controller.spec.ts
    └── posts.service.spec.ts
```

- Un repository por modelo Prisma: `PostRepository` y `PostLikeRepository`.
- `PostsService` no inyecta `PrismaService`; coordina ambos repositories.
- `likeCount` se resuelve con `_count.likes` y `likedByCurrentUser` con una única
  consulta `findLikedPostIds` (filtra por `userId` y `postId in [...]`), evitando N+1.
- `PostRepository.findByIdOrThrow` lanza `404` cuando el post no existe.

## Seed

`apps/backend/prisma/seed.ts` crea/actualiza (upsert por id fijo) la publicación demo
`Atardecer en la montaña`, asociada al usuario admin. Es idempotente.

```bash
pnpm --filter backend prisma:seed
```

## Verificación

```bash
pnpm --filter backend build
pnpm --filter backend test --runInBand
pnpm --filter backend exec eslint "src/posts/**/*.ts"
```

Verificado manualmente el 2026-09-27:

- Sin sesión: `GET/POST/DELETE` responden `401`.
- Con sesión: `GET /posts` devuelve la publicación semilla.
- `POST` incrementa en 1, repetir no altera; `DELETE` decrementa, repetir no altera.
- `404` para post inexistente y `400` para `postId` malformado.
