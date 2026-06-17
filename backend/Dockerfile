FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY src ./src
COPY data ./data
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN npx prisma generate && chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 4000

CMD ["./docker-entrypoint.sh"]
