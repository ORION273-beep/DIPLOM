# OneSec

Дипломный проект — интернет-магазин игрового доната (клон kupikod.com).  
Монорепозиторий: **Next.js 16 (frontend)** + **Express + Prisma + SQLite (backend)**.

Браузер обращается к `/api/*` на том же origin; Next.js переписывает запросы на `BACKEND_URL` (CORS не нужен).

## Требования

- Node.js 20+
- npm

## Быстрый старт

```bash
npm install
npm install --prefix backend
# .env.local в корне: BACKEND_URL=http://localhost:4000
# backend/.env: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, DATABASE_URL=file:./prisma/dev.db

# Первая инициализация БД (миграции + сид из backend/data/db.json)
npm run db:reset --prefix backend

# Frontend + backend одной командой
npm run dev:all
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000](http://localhost:4000)
- Swagger UI: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

## Демо-аккаунты

После `npm run db:reset --prefix backend` доступны учётные записи из сида:

| Email | Пароль | Роль |
|-------|--------|------|
| `fgf@mail.ru` | `demo123456` | Пользователь |
| `ffffgdgf@mail.ru` | `admin123456` | Администратор |
| `fffff@mail.ru` | `admin123456` | Администратор |

Админ-панель: [http://localhost:3000/admin](http://localhost:3000/admin) (требуется вход под admin).

## Переменные окружения

| Файл | Назначение |
|------|------------|
| **`.env.local`** (корень) | `BACKEND_URL` — для rewrites и серверных fetch в Next |
| **`backend/.env`** | `DATABASE_URL`, секреты JWT, `COOKIE_SECURE`, порт |

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Только Next.js |
| `npm run backend:dev` | Только Express |
| `npm run dev:all` | Backend + Next параллельно |
| `npm run db:seed` | Сид БД из `backend/data/db.json` |
| `npm run db:reset` | Сброс + миграции + сид в `backend/` |
| `npm test` | Vitest (frontend) |
| `npm run lint` | ESLint (frontend) |

## Структура (кратко)

- `src/app/` — страницы и UI Next.js
- `src/lib/api/client.ts` — `apiFetch` (браузер → `/api`, RSC → `BACKEND_URL`)
- `src/lib/auth/store.ts` — Zustand-сессия (access token в памяти)
- `backend/src/server.js` — REST API, JWT, Prisma
- `backend/prisma/` — схема, миграции, `dev.db`

Подробнее по backend: [`backend/README.md`](backend/README.md).  
Архитектура и диаграммы: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Деплой на сервер (Docker)

```bash
cp .env.example .env   # заполните JWT-секреты
docker compose up -d --build
```

Сайт: `http://<IP-сервера>` (порт 80 через nginx).  
Полная инструкция с HTTPS и Let's Encrypt: [`docs/DEPLOY.md`](docs/DEPLOY.md).
