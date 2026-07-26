# Build from the repo root: docker build -f backend/Dockerfile -t nexora-api .
# This is a pnpm workspace (frontend + backend), so the build needs the full
# monorepo context to resolve the lockfile and hoisted dependencies.

FROM node:20-alpine AS base
RUN npm install -g pnpm@9.15.0

# ---- deps + build ----
FROM base AS builder
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile

# Prisma Client is generated code, not checked in — must run before the
# TypeScript build since the API imports backend/prisma's generated types.
RUN pnpm --filter backend db:generate
RUN pnpm --filter backend build

# `pnpm deploy` packages backend's own files plus a flattened, production-only
# copy of its resolved dependency tree — the officially recommended way to
# isolate one app from a pnpm monorepo for a Docker image.
RUN pnpm --filter backend deploy --prod /app/out

# ---- runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nexora -u 1001
COPY --from=builder --chown=nexora:nodejs /app/out .

USER nexora
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/server.js"]
