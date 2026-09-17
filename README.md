# Monorepo Template

A ready-to-use monorepo template for starting B2B projects (backend + frontend) without repeating setup.

## Stack

- **Monorepo**: pnpm workspace (`pnpm@10.32.1`)
- **Backend**: NestJS 11, Prisma 7, PostgreSQL, Passport JWT, Swagger
- **Frontend**: React 19, Vite 8, TanStack Router, TanStack Query, Tailwind CSS 4, shadcn/ui
- **Auth**: JWT in an HttpOnly cookie + roles (`ADMIN`, `USER`)

## Structure

```
monorepo-template/
├── apps/
│   ├── backend/            # REST API (NestJS + Prisma) — authentication module
│   └── frontend/           # SPA (Vite + React + TanStack Router)
├── package.json
└── pnpm-workspace.yaml
```

## Development

```bash
pnpm install                              # install dependencies

# Backend
cp apps/backend/.env.example apps/backend/.env   # set JWT_SECRET
cd apps/backend && docker compose up -d          # Postgres on :15432
pnpm --filter backend prisma:migrate dev --name init
pnpm --filter backend prisma:seed                # creates admin@example.com / admin123
pnpm --filter backend start:dev                  # http://localhost:4000

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
pnpm --filter frontend dev                       # http://localhost:5173
```

## Authentication (backend)

Endpoints under `/api/v1/auth`:

| Method | Route | Description |
|---|---|---|
| POST | `/auth/create-account` | Register a user |
| POST | `/auth/confirm-account` | Confirm account with token |
| POST | `/auth/login` | Log in (sets an HttpOnly cookie) |
| POST | `/auth/logout` | Log out |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/validate-token` | Validate reset token |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/user` | Current user (protected) |
| PATCH | `/auth/user` | Update profile (protected) |

> `EmailsService` is a stub that prints the token to the backend logs. For production, replace it with Resend/nodemailer/SES.

## Recommended frontend structure

```
apps/frontend/src/
├── main.tsx                    # entry point: router + providers
├── index.css                   # Tailwind 4 + theme variables (shadcn)
│
├── routes/                     # file-based routing (TanStack Router)
│   ├── __root.tsx              # root layout
│   ├── index.tsx               # "/"
│   ├── login.tsx               # "/login"
│   └── _protected/             # routes that require a session (layout + pages)
│       ├── _protected.tsx      # auth guard + shell (sidebar/topbar)
│       └── dashboard.tsx
│
├── features/                   # business logic per domain (backbone)
│   └── <feature>/
│       ├── components/         # presentational and orchestration UI
│       ├── hooks/              # state, mutations, side effects (react-hook-form, useQuery)
│       ├── lib/                # pure helpers, column builders, formatters, constants
│       └── pages/              # thin pages (orchestrate components + hooks)
│
├── services/                   # API types + fetch + React Query hooks
│   ├── api.ts                  # axios instance + error helpers
│   └── <feature>/
│       └── <feature>.service.ts
│
├── schema/                     # Zod schemas (shared validation)
│   ├── auth.ts
│   └── index.ts                # re-exports
│
├── components/                 # components shared across features
│   ├── ui/                     # shadcn/ui (generated via `npx shadcn add`)
│   ├── layout/                 # sidebar, topbar, shell
│   └── shared/                 # reusable components
│
├── hooks/                      # global hooks (theme, media queries, etc.)
├── lib/                        # pure utilities (cn, format, etc.)
├── providers/                  # app contexts/providers (QueryClient, auth)
└── assets/                     # images, fonts, icons
```

### Golden rules

1. **Keep `routes/` thin**: a route only imports a page from `features/` and renders it. No logic.
2. **`features/<domain>/`** groups everything for a domain: `components/`, `hooks/`, `lib/`, `pages/`.
3. **`services/`** is the only layer that talks to the backend (axios + React Query). Components never `fetch` directly.
4. **`schema/`** centralizes Zod schemas; forms use `zodResolver` + `react-hook-form`.
5. **shadcn/ui** lives in `components/ui/`; add components with `npx shadcn@latest add <component>`.
6. One hook per concern (`use-<entity>-table.ts`, `use-<entity>-form.ts`); if a component accumulates state + query + mutation, move it to `hooks/`.

### Add shadcn/ui

```bash
npx shadcn@latest add button card input label sonner
```

### Add a new feature

```bash
# 1. Validation schema
touch src/schema/<feature>.ts

# 2. Service (types + React Query hooks)
mkdir -p src/services/<feature>

# 3. Feature (components/hooks/lib/pages)
mkdir -p src/features/<feature>/{components,hooks,lib,pages}

# 4. Route
touch src/routes/_protected/<feature>.tsx
```

## Testing

```bash
pnpm --filter backend test            # unit (Jest)
pnpm --filter backend test:e2e
pnpm --filter frontend build          # tsc + vite build
pnpm --filter frontend lint
```
