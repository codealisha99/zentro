FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/signaling/package.json apps/signaling/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
COPY packages/types packages/types
COPY apps/signaling apps/signaling
RUN pnpm --filter @webrtc-conf/types --filter @webrtc-conf/signaling build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/signaling/package.json apps/signaling/
COPY packages/types/package.json packages/types/
RUN corepack enable && pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/signaling/dist ./apps/signaling/dist

EXPOSE 8080
CMD ["node", "apps/signaling/dist/server.js"]
