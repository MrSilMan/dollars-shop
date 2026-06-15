FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile

FROM base AS builder
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/app/generated ./app/generated

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh && chown nextjs:nodejs ./entrypoint.sh && \
    mkdir -p ./logs && chown nextjs:nodejs ./logs

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["./entrypoint.sh"]
