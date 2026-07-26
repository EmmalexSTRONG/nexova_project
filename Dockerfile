# Build from the repo root: docker build -f Dockerfile -t nexora-web .
# Primary production deploys go through Vercel (see docs/deployment.md) — this
# image exists for self-hosting and for local parity with production.

FROM node:20-alpine AS base
RUN npm install -g pnpm@9.15.0

# ---- deps + build ----
FROM base AS builder
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter backend db:generate

# NEXT_PUBLIC_* variables are inlined into the client bundle at build time —
# unlike server-only env vars, they can't be supplied at container start.
# Pass them with `docker build --build-arg NEXT_PUBLIC_APP_URL=... .`
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY \
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY

RUN pnpm build

# ---- runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nexora -u 1001

# `output: "standalone"` traces from the app's own directory — since the
# Next.js app lives at the repo/workspace root, the server entrypoint lands
# at ./server.js. Static assets and the public folder are excluded from
# standalone tracing and must be copied in separately.
COPY --from=builder --chown=nexora:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nexora:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nexora:nodejs /app/public ./public

USER nexora
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
