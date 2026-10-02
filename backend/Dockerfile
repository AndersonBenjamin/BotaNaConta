FROM node:22-bookworm-slim

# O Prisma precisa do OpenSSL para conectar ao Postgres.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
# Inclui o CLI do Prisma (devDependency), usado para aplicar as migrations ao iniciar.
RUN npm ci && npx prisma generate && npm cache clean --force

COPY src ./src

ENV NODE_ENV=production \
  NPM_CONFIG_UPDATE_NOTIFIER=false
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Aplica migrations pendentes e inicia a API. O exec faz o Node receber o SIGTERM do Docker.
CMD ["sh", "-c", "npx prisma migrate deploy && exec node src/server.js"]
