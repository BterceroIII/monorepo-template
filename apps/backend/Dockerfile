FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

RUN corepack enable
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json

RUN pnpm install --frozen-lockfile

COPY apps/backend ./apps/backend

RUN pnpm --filter backend prisma:generate
RUN pnpm --filter backend test --runInBand
RUN pnpm --filter backend build
RUN pnpm --filter backend --prod deploy --legacy /deploy
RUN rm -rf /deploy/node_modules/.pnpm/prisma@*

FROM build AS migrations

WORKDIR /app/apps/backend

CMD ["pnpm", "prisma:migrate:deploy"]

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=4000

RUN apk add --no-cache ca-certificates openssl
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack

WORKDIR /app

COPY --from=build --chown=node:node /deploy/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/backend/dist ./dist
COPY --from=build --chown=node:node /app/apps/backend/prisma ./prisma
COPY --from=build --chown=node:node /app/apps/backend/prisma.config.ts ./prisma.config.ts

USER node

EXPOSE 4000

CMD ["node", "dist/src/main.js"]
