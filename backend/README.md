# Backend (Express + Prisma + SQLite)

Отдельный процесс API. Данные в **SQLite** (`backend/prisma/dev.db` по умолчанию), ORM — **Prisma**. Авторизация: **JWT** (access в JSON, refresh в httpOnly-cookie с `Path=/api/auth`).

## Установка

```bash
npm install --prefix backend
cp .env.example .env
```

Обязательно задайте в `.env`:

- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — длинные случайные строки  
- `DATABASE_URL="file:./prisma/dev.db"` (как в примере)

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `PORT` / `BACKEND_PORT` | Порт (по умолчанию 4000) |
| `DATABASE_URL` | SQLite datasource для Prisma |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Подпись access / refresh токенов |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | TTL (например `15m`, `14d`) |
| `COOKIE_SECURE` | `true` в продакшене за HTTPS |
| `FRONTEND_URL` | URL фронтенда для ссылок сброса пароля |
| `PAYMENT_WEBHOOK_SECRET` | Секрет для `/api/payments/webhook` |

## База данных

```bash
# из папки backend/
npm run prisma:generate
npm run prisma:migrate
npm run db:seed

# или полный сброс (migrate reset + seed)
npm run db:reset
```

Сид заполняет таблицы из **`data/db.json`** (`prisma/seed.js`). Пароли пользователей хешируются bcrypt при сиде.

## Запуск

```bash
npm run dev
```

Или из корня репозитория: `npm run backend:dev` / `npm run dev:all`.

## OpenAPI

Спецификация REST-контракта: [`openapi.yaml`](openapi.yaml). Интерактивный UI: **`http://localhost:4000/api/docs`** (Swagger UI).

## API (через Next в браузере)

Клиент обращается к **`/api/...`** на origin Next; Next **rewrites** проксирует на этот сервис. Прямой вызов с машины разработчика: `http://localhost:4000/api/...`.

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
| GET | `/api/auth/me` | Профиль (Bearer) |
| POST | `/api/auth/forgot-password` | Запрос сброса пароля (ссылка в консоль в dev) |
| POST | `/api/auth/reset-password` | Установка нового пароля по токену |
| PATCH | `/api/auth/password` | Смена пароля (Bearer) |
| GET/POST/PATCH/DELETE | `/api/cart` | Серверная корзина (Bearer) |
| POST | `/api/cart/merge` | Merge localStorage-корзины (Bearer) |
| POST | `/api/payments/webhook` | Симуляция оплаты заказа |
| GET | `/api/reviews` | Опубликованные отзывы |
| POST | `/api/reviews` | Отправить отзыв (Bearer, после completed заказа) |
| GET | `/api/faq` | Список вопросов FAQ |
| GET | `/api/games` | Список игр |
| GET | `/api/games/:slug` | Игра по slug |
| GET | `/api/categories` | Список категорий |
| GET | `/api/products` | Товары (`?category=&platform=&q=&sort=&page=&limit=&popular=1&inStock=1&discount=1`) |
| GET | `/api/products/:id` | Товар по id |
| GET | `/api/orders` | Заказы пользователя (Bearer) |
| POST | `/api/orders` | Создать заказ, списание stock (Bearer) |
| GET | `/api/admin/orders` | Все заказы (admin) |
| PATCH | `/api/admin/orders/:id` | Смена статуса (admin) |
| GET/POST/PATCH/DELETE | `/api/admin/products` | CRUD товаров (admin) |
| GET/POST/PATCH/DELETE | `/api/admin/games` | CRUD игр (admin) |
| GET/POST/PATCH/DELETE | `/api/admin/faq` | CRUD FAQ (admin) |
| GET/PATCH/DELETE | `/api/admin/reviews` | Модерация отзывов (admin) |
| GET/PATCH | `/api/admin/users` | Пользователи: роль, баланс, блокировка (admin) |
| GET | `/api/admin/stats` | Дашборд: выручка, заказы, топ товаров (admin) |

## Docker

Из корня репозитория:

```bash
docker compose up --build
```

Frontend: http://localhost:3000, backend: http://localhost:4000

## Тесты

```bash
cd backend
npm install
npm test
```

## Безопасность

Подключены **helmet**, **express-rate-limit** (жёстче на `/api/auth/*`, мягче на `/api/*`). Вход только по bcrypt-паролям.
