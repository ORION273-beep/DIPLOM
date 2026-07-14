# Backend (Express + Mongoose + MongoDB)

Отдельный процесс API. Данные в **MongoDB**, ODM — **Mongoose**. Авторизация: **JWT** (access в JSON, refresh в httpOnly-cookie с `Path=/api/auth`).

## Установка

```bash
npm install --prefix backend
```

Создайте `backend/.env` с переменными:

- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — длинные случайные строки
- `MONGODB_URI=mongodb://127.0.0.1:27017/onesec` (локальный Mongo; иначе в non-production поднимется in-memory)

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `PORT` / `BACKEND_PORT` | Порт (по умолчанию 4000) |
| `MONGODB_URI` | Строка подключения MongoDB |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Подпись access / refresh токенов |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | TTL (например `15m`, `14d`) |
| `COOKIE_SECURE` | `true` в продакшене за HTTPS |
| `FRONTEND_URL` | URL фронтенда для ссылок сброса пароля |
| `PAYMENT_WEBHOOK_SECRET` | Секрет для `/api/payments/webhook` |
| `RUN_SEED` | `true` — принудительный reseed при старте |

## База данных

```bash
# из папки backend/
npm run db:seed

# или полный wipe + seed
npm run db:reset
```

Сид заполняет коллекции из **`data/db.json`** (`src/db/seed.js`). Пароли пользователей хешируются bcrypt при сиде.

При пустой БД сервер автоматически сидит данные на старте.

## Запуск

```bash
npm run dev
```

Или из корня репозитория: `npm run backend:dev` / `npm run dev` (backend + Vite).

## OpenAPI

Спецификация REST-контракта: [`openapi.yaml`](openapi.yaml). Интерактивный UI: **`http://localhost:4000/api/docs`** (Swagger UI, не в production).

## API (через Vite в браузере)

Клиент обращается к **`/api/...`** на origin SPA; Vite dev-proxy (и nginx в production) проксирует на этот сервис. Прямой вызов: `http://localhost:4000/api/...`.

### Формат ответов

Успех:

```json
{ "ok": true, "products": [] }
```

Ошибка:

```json
{ "ok": false, "error": { "code": "NOT_FOUND", "message": "..." } }
```

### Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | Проверка API и БД |
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход, выдача access + refresh cookie |
| POST | `/api/auth/refresh` | Обновление access по refresh cookie |
| POST | `/api/auth/logout` | Выход |
| GET | `/api/products` | Каталог |
| GET/POST/PATCH | `/api/cart`, `/api/favorites`, `/api/orders` | Коммерция (auth) |
| `/api/admin/*` | Админ-CRUD (роль admin) |

Демо-аккаунты — в корневом [`README.md`](../README.md).
