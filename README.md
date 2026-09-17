# Monorepo Template

Plantilla monorepo lista para arrancar proyectos B2B (backend + frontend) sin repetir configuración.

## Stack

- **Monorepo**: pnpm workspace (`pnpm@10.32.1`)
- **Backend**: NestJS 11, Prisma 7, PostgreSQL, Passport JWT, Swagger
- **Frontend**: React 19, Vite 8, TanStack Router, TanStack Query, Tailwind CSS 4, shadcn/ui
- **Auth**: JWT en cookie HttpOnly + roles (`ADMIN`, `USER`)

## Estructura

```
monorepo-template/
├── apps/
│   ├── backend/            # API REST (NestJS + Prisma) — módulo de autenticación
│   └── frontend/           # SPA (Vite + React + TanStack Router)
├── package.json
└── pnpm-workspace.yaml
```

## Desarrollo

```bash
pnpm install                              # instalar dependencias

# Backend
cp apps/backend/.env.example apps/backend/.env   # ajusta JWT_SECRET
cd apps/backend && docker compose up -d          # Postgres en :15432
pnpm --filter backend prisma:migrate dev --name init
pnpm --filter backend prisma:seed                # crea admin@example.com / admin123
pnpm --filter backend start:dev                  # http://localhost:4000

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
pnpm --filter frontend dev                       # http://localhost:5173
```

## Autenticación (backend)

Endpoints bajo `/api/v1/auth`:

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/create-account` | Registrar usuario |
| POST | `/auth/confirm-account` | Confirmar cuenta con token |
| POST | `/auth/login` | Iniciar sesión (setea cookie HttpOnly) |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/forgot-password` | Solicitar reset de contraseña |
| POST | `/auth/validate-token` | Validar token de reset |
| POST | `/auth/reset-password` | Restablecer contraseña |
| GET | `/auth/user` | Usuario actual (protegido) |
| PATCH | `/auth/user` | Actualizar perfil (protegido) |

> `EmailsService` es un stub que imprime el token en los logs del backend. Para producción, reemplázalo por Resend/nodemailer/SES.

## Estructura recomendada del frontend

```
apps/frontend/src/
├── main.tsx                    # entrada: router + providers
├── index.css                   # Tailwind 4 + variables de tema (shadcn)
│
├── routes/                     # file-based routing (TanStack Router)
│   ├── __root.tsx              # layout raíz
│   ├── index.tsx               # "/"
│   ├── login.tsx               # "/login"
│   └── _protected/             # rutas que requieren sesión (layout + páginas)
│       ├── _protected.tsx      # guard de auth + shell (sidebar/topbar)
│       └── dashboard.tsx
│
├── features/                   # lógica de negocio por dominio (columna vertebral)
│   └── <feature>/
│       ├── components/         # UI presentacional y orquestación
│       ├── hooks/              # estado, mutaciones, side effects (react-hook-form, useQuery)
│       ├── lib/                # helpers puros, columnas, formatters, constantes
│       └── pages/              # páginas delgadas (orquestan components + hooks)
│
├── services/                   # API types + fetch + hooks de React Query
│   ├── api.ts                  # instancia axios + helpers de error
│   └── <feature>/
│       └── <feature>.service.ts
│
├── schema/                     # esquemas Zod (validación compartida)
│   ├── auth.ts
│   └── index.ts                # re-export
│
├── components/                 # componentes compartidos entre features
│   ├── ui/                     # shadcn/ui (generados con `npx shadcn add`)
│   ├── layout/                 # sidebar, topbar, shell
│   └── shared/                 # componentes reutilizables
│
├── hooks/                      # hooks globales (tema, media queries, etc.)
├── lib/                        # utilidades puras (cn, format, etc.)
├── providers/                  # contextos/providers de la app (QueryClient, auth)
└── assets/                     # imágenes, fuentes, íconos
```

### Reglas de oro

1. **`routes/` delgadas**: una ruta solo importa una página de `features/` y la renderiza. Nada de lógica.
2. **`features/<dominio>/`** agrupa todo lo de un dominio: `components/`, `hooks/`, `lib/`, `pages/`.
3. **`services/`** es la única capa que habla con el backend (axios + React Query). Los componentes nunca hacen `fetch` directo.
4. **`schema/`** centraliza los esquemas Zod; formularios usan `zodResolver` + `react-hook-form`.
5. **shadcn/ui** vive en `components/ui/`; se agrega con `npx shadcn@latest add <componente>`.
6. Un hook por preocupación (`use-<entidad>-table.ts`, `use-<entidad>-form.ts`); si un componente acumula estado + query + mutación, muévelo a `hooks/`.

### Agregar shadcn/ui

```bash
npx shadcn@latest add button card input label sonner
```

### Agregar un feature nuevo

```bash
# 1. Esquema de validación
touch src/schema/<feature>.ts

# 2. Servicio (types + hooks de React Query)
mkdir -p src/services/<feature>

# 3. Feature (components/hooks/lib/pages)
mkdir -p src/features/<feature>/{components,hooks,lib,pages}

# 4. Ruta
touch src/routes/_protected/<feature>.tsx
```

## Testing

```bash
pnpm --filter backend test            # unit (Jest)
pnpm --filter backend test:e2e
pnpm --filter frontend build          # tsc + vite build
pnpm --filter frontend lint
```
