# Деплой OneSec на VPS (Docker Compose)

Пошаговая инструкция для развёртывания fullstack-приложения на сервере с Ubuntu 22+.

## Архитектура

```
Интернет → nginx:80/443 → frontend (Vite static) + /api → backend (Express) → MongoDB
```

- Backend **не** публикуется наружу — доступен только из Docker-сети.
- Браузер ходит на `/` (SPA) и `/api/*` (Express) через edge-nginx.

## Требования

- VPS с Ubuntu 22.04+ и Docker Compose v2
- Порты 80 и 443 открыты

## 1. Клонирование и настройка

```bash
git clone <your-repo-url> onesec
cd onesec/kupikod-clone

cp .env.example .env
```

| Переменная | Значение |
|------------|----------|
| `SITE_URL` | `http://<IP>` или `https://domain` |
| `MONGODB_URI` | в compose задаётся как `mongodb://mongo:27017/onesec` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | `openssl rand -base64 32` |
| `COOKIE_SECURE` | `false` для HTTP, `true` для HTTPS |
| `PAYMENT_WEBHOOK_SECRET` | произвольная строка |
| `RUN_SEED` | `true` для принудительного reseeda |

## 2. Запуск

```bash
docker compose up -d --build
curl http://localhost/api/health
curl http://localhost/api/docs
```

При пустой БД backend автоматически выполнит seed из `backend/data/db.json`.
Swagger UI доступен по `/api/docs`, если `backend/openapi.yaml` попал в образ.

### Демо-аккаунты

| Email | Пароль | Роль |
|-------|--------|------|
| `fgf@mail.ru` | `demo123456` | Пользователь |
| `ffffgdgf@mail.ru` | `admin123456` | Администратор |

## 3. HTTPS (опционально)

См. certbot + `docker/nginx/default.https.conf` (проксирует `/api` на backend и `/` на frontend:80).

## Локальная разработка без Docker

```bash
npm run backend:dev   # Express + Mongo (или memory fallback)
npm run frontend:dev  # Vite :5173, proxy /api → :4000
# или
npm run dev
```
