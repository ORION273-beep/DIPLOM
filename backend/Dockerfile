FROM node:20-slim

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/prisma ./prisma
COPY backend/src ./src
COPY backend/data ./data
COPY backend/docker-entrypoint.sh ./docker-entrypoint.sh

RUN npx prisma generate && chmod +x docker-entrypoint.sh

COPY .render/web /app/web

ENV NODE_ENV=production
ENV BACKEND_PORT=4001
ENV BACKEND_HOST=127.0.0.1
ENV BACKEND_URL=http://127.0.0.1:4001
ENV HOSTNAME=0.0.0.0

EXPOSE 4000

CMD ["./docker-entrypoint.sh"]
