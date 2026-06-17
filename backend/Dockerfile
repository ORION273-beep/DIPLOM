FROM node:20-slim AS frontend-builder

WORKDIR /frontend

ARG BACKEND_URL=http://127.0.0.1:4001
ENV BACKEND_URL=$BACKEND_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=4096

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run render-build && test -f .next/standalone/server.js

FROM node:20-slim

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/prisma ./prisma
COPY backend/src ./src
COPY backend/data ./data
COPY backend/docker-entrypoint.sh ./docker-entrypoint.sh

RUN npx prisma generate && chmod +x docker-entrypoint.sh

COPY --from=frontend-builder /frontend/.next/standalone /app/web

ENV NODE_ENV=production
ENV BACKEND_PORT=4001
ENV BACKEND_HOST=127.0.0.1
ENV BACKEND_URL=http://127.0.0.1:4001
ENV HOSTNAME=0.0.0.0

EXPOSE 4000

CMD ["./docker-entrypoint.sh"]
