# Архитектура OneSec

## Обзор

OneSec — монорепозиторий с **Next.js 16** (frontend) и **Express + Prisma + SQLite** (backend). Браузер обращается к `/api/*` на том же origin; Next.js переписывает запросы на `BACKEND_URL`.

```mermaid
flowchart LR
  Browser --> NextJS["Next.js"]
  NextJS -->|"rewrite /api"| Express
  Express --> Prisma
  Prisma --> SQLite
  Browser --> LocalStorage["localStorage: cart, favorites cache"]
  Express --> FavoritesDB["Favorite table"]
```

## Слои

| Слой | Технологии | Ответственность |
|------|------------|-----------------|
| UI | React, Tailwind, Untitled UI | Страницы, формы, состояние корзины |
| Middleware | Next.js `middleware.ts` | Защита `/admin` по cookie `user_role` |
| API client | `src/lib/api/client.ts` | `apiFetch`, refresh JWT, server-side `BACKEND_URL` |
| Backend | Express, Zod, JWT | REST API, валидация, бизнес-правила |
| Data | Prisma ORM | Модели User, Product, Order, Favorite, Review, FaqItem |

## Аутентификация

```mermaid
sequenceDiagram
  participant B as Browser
  participant N as Next.js
  participant E as Express
  participant DB as SQLite

  B->>N: POST /api/auth/login
  N->>E: proxy
  E->>DB: verify user
  E-->>B: accessToken (JSON) + httpOnly cookies (refresh_token, user_role)
  B->>N: API calls with Authorization Bearer
  N->>E: proxy + token
  E->>DB: authorize request
```

- **Access token** — в памяти (Zustand), TTL ~15 мин.
- **Refresh token** — httpOnly cookie, путь `/`.
- **user_role** — httpOnly cookie для middleware (нельзя подделать из JS).

## Оформление заказа

```mermaid
sequenceDiagram
  participant U as User
  participant C as Cart/checkout
  participant E as Express
  participant DB as SQLite

  U->>C: Добавить в корзину (localStorage)
  U->>C: /checkout — выбор оплаты
  C->>E: POST /api/orders
  E->>DB: transaction: order + stock decrement
  E-->>C: order id
  C->>U: /checkout/success
```

## Админ: смена статуса

```mermaid
sequenceDiagram
  participant A as Admin
  participant E as Express
  participant DB as SQLite

  A->>E: PATCH /api/admin/orders/:id { status }
  E->>E: requireAuth + requireAdmin (JWT role)
  E->>DB: update order + statusHistory
  E-->>A: updated order
```

## ER-диаграмма (основные сущности)

```mermaid
erDiagram
  User ||--o{ Order : places
  User ||--o{ Favorite : has
  User ||--o{ RefreshToken : owns
  Order ||--|{ OrderItem : contains
  Order ||--o{ OrderStatusEntry : history
  Product }o--o{ OrderItem : referenced_by
```

## Демо-аккаунты

См. таблицу в корневом [README.md](../README.md).

## Ограничения MVP

- Оплата картой/СБП — симуляция (webhook `/api/payments/webhook`); реальный платёжный шлюз не подключён.
- Email для forgot-password — mock в dev (ссылка в консоли backend).
- Forgot-password и reset-password реализованы через `PasswordResetToken`.
- Корзина синхронизируется с сервером для авторизованных пользователей.
- Избранное — синхронизируется с сервером для авторизованных пользователей.
- Отзывы пользователей проходят модерацию в админке.
- Фильтрация `discount` (oldPrice > price) — post-filter; `q` — Prisma `contains`.
