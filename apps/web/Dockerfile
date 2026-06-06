FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm install --no-audit --no-fund

FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY apps/web ./

ARG NEXT_PUBLIC_API_URL=/api/v1
ARG API_INTERNAL_URL=http://api:8080

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV API_INTERNAL_URL=${API_INTERNAL_URL}

RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_API_URL=/api/v1
ENV API_INTERNAL_URL=http://api:8080

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
