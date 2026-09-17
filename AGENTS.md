# AGENTS.md

## Before any task
CRITICAL: Read `docs/CONTEXT_APP` at the start of every conversation before taking any action.
This file contains the project requirements, specifications, Figma prototypes, and evaluation criteria.

## Documentation Rule
- When changing database schema, Prisma models, migrations, catalogs, business logic, roles/permissions, integrations, or creating complete modules, update the related Markdown documentation in the same task.
- Use `docs/backend/DATABASE_MIGRATION_PROPOSAL.md` for database, migration, catalog, payment, sales order, and financial logic changes.
- Use `docs/CONTEXT_APP.md` for MVP scope, product phases, business context, and process changes.
- Use the closest existing document under `docs/` for auth, notifications, Odoo, architecture, or module-specific behavior.
- If no existing document fits, create a focused Markdown file under `docs/` instead of leaving the decision only in code.

## Frontend/Backend Handoff Protocol
- The frontend agent role is defined in `.cursor/rules/frontend-agent-role.mdc`: it only edits `apps/frontend/**` and `docs/frontend/**`, and never implements changes under `apps/backend/**`.
- When a frontend task needs a backend change, the frontend agent documents it under `docs/frontend/backend-requests/` instead of writing backend code; check that folder for pending requests before starting backend work.
- When a backend change ships that the frontend must consume, document it as `docs/frontend/<TOPIC>_HANDOFF.md` (see `docs/frontend/PROJECTS_SERVICE_RESPONSIBILITY_HANDOFF.md` for the expected structure) and update the matching request status in `docs/frontend/backend-requests/INDEX.md`.

## Repo Shape
- pnpm workspace, package manager pinned as `pnpm@10.32.1` in root `package.json`.
- Workspace packages are `apps/*` and `packages/**/*`; `packages/` is currently empty.
- Frontend is `apps/frontend`: React 19 + Vite 8 entrypoint `src/main.tsx`, app component `src/App.tsx`.
- Backend is `apps/backend`: NestJS 11 entrypoint `src/main.ts`, root module `src/app.module.ts`, listens on `process.env.PORT ?? 3000`.
- Project OpenCode config is `opencode.json`; it enables the remote Prisma MCP server at `https://mcp.prisma.io/mcp` and may require Prisma Console auth on first use.

## Backend Data Access Rule
- When a feature module uses more than one Prisma model, create one repository per model so its ownership and queries remain explicit.
- Keep application services grouped by the same aggregate or operation inside the feature module; do not consolidate unrelated model operations in a single service class.
- A repository may include relations required to shape its own model response, but it must not own CRUD or search operations for another Prisma model.

## Backend Module Structure
- Follow `docs/backend/MODULE_STRUCTURE.md` for every backend module.
- Keep the module's primary `.module`, `.service`, and `.controller` in the module root.
- Put DTOs in `dto/` (singular), repositories in `repositories/`, and unit specs in `test/`.
- Put secondary services in `services/` and secondary controllers in `controllers/`; never leave them in the module root.
- Do not use `application/` for services; that folder name is not allowed.
- Order controller handlers by HTTP method: `@Get`/`@Sse`, then `@Post`, `@Put`, `@Patch`, and `@Delete` last, with static routes before dynamic ones.

## Commands
- Install from repo root with `pnpm install`.
- Root `pnpm dev`, `pnpm build`, and `pnpm start` run matching scripts across workspace packages in parallel.
- Root `pnpm test` is a placeholder that exits 1; run package tests with filters instead.
- Frontend: `pnpm --filter frontend dev`, `pnpm --filter frontend build`, `pnpm --filter frontend lint`.
- Frontend React quality gate: `pnpm --filter frontend run doctor:ci`; any React Doctor warning or error blocks completion and CI deployment.
- Backend: `pnpm --filter backend start:dev` for watch mode, `pnpm --filter backend build`, `pnpm --filter backend test`, `pnpm --filter backend test:e2e`.
- Backend Prisma: `pnpm --filter backend prisma:generate`, `pnpm --filter backend prisma:migrate --name <name>`, `pnpm --filter backend prisma:studio`.
- Pass Jest flags without an extra separator: use `pnpm --filter backend test --runInBand`, not `pnpm --filter backend test -- --runInBand`.
- Run a focused backend spec with `pnpm --filter backend test -- app.controller.spec.ts` or `pnpm --filter backend exec jest path/to/spec.ts`.

## Verification Notes
- Frontend has no test script; `build` runs `tsc -b && vite build`.
- Backend unit Jest config lives inside `apps/backend/package.json` with `rootDir: "src"`; e2e tests use `apps/backend/test/jest-e2e.json`.
- Prisma schema lives at `apps/backend/prisma/schema.prisma`; generated client goes to ignored `apps/backend/src/generated/prisma` and `build` regenerates it first.
- Backend `lint` runs ESLint with `--fix`, so it may modify files; frontend `lint` is check-only.
- Backend ESLint is type-aware via `projectService: true` and includes Prettier as an ESLint rule.

## Generated Outputs
- Frontend build output is `apps/frontend/dist/`.
- Backend build output is `apps/backend/dist/`.
