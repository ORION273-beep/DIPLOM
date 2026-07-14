# OneSec

Дипломный проект — интернет-магазин игрового доната (клон kupikod.com).  
Монорепозиторий: **React + Vite (SPA)** + **Express + Mongoose + MongoDB**.

Браузер обращается к `/api/*` на том же origin; Vite проксирует на backend в dev, nginx — в production.

## Требования

- Node.js 20+
- npm
- MongoDB (опционально локально; иначе backend использует in-memory MongoDB в non-production)

## Быстрый старт

```bash
npm install
npm install --prefix backend
npm install --prefix frontend

# backend/.env: MONGODB_URI=mongodb://127.0.0.1:27017/onesec
# JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

# Сид (при подключении к Mongo)
npm run db:seed --prefix backend

# Backend + Vite SPA
npm run dev:vite
```

- Frontend (Vite): [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:4000](http://localhost:4000)
- Swagger UI: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

Swagger в production (`NODE_ENV=production`) недоступен.

## Демо-аккаунты

| Email | Пароль | Роль |
|-------|--------|------|
| `fgf@mail.ru` | `demo123456` | Пользователь |
| `ffffgdgf@mail.ru` | `admin123456` | Администратор |

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run frontend:dev` | Vite SPA |
| `npm run backend:dev` | Express API |
| `npm run dev:vite` | Backend + Vite concurrently |
| `npm run frontend:build` | Production build SPA |
| `npm run test` | Backend API tests |

## Docker

```bash
cp .env.example .env
docker compose up -d --build
```

См. [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Документация

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — схема слоёв и потоки
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — деплой на VPS

## Безопасность MVP

- JWT access (память) + refresh (httpOnly cookie)
- Rate limit на auth/payment
- Платёжный webhook с секретом (`PAYMENT_WEBHOOK_SECRET`)
