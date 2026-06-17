FROM node:20-slim

WORKDIR /app

ARG BACKEND_URL=https://orion-diplom-api.onrender.com
ENV BACKEND_URL=$BACKEND_URL
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run render-build && test -f .next/standalone/server.js

ENV NODE_OPTIONS=--max-old-space-size=400

EXPOSE 3000

CMD ["npm", "run", "render-start"]
