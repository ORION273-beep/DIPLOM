# Деплой OneSec на VPS (Docker Compose)

Пошаговая инструкция для развёртывания fullstack-приложения на сервере с Ubuntu 22+.

## Архитектура

```
Интернет → nginx:80/443 → frontend (Next.js) → backend (Express) → SQLite volume
```

- Backend **не** публикуется наружу — доступен только из Docker-сети.
- Браузер обращается к `/api/*` на том же origin; Next.js проксирует запросы на backend.

## Требования

- VPS с Ubuntu 22.04+ (или другой Linux с Docker)
- Docker Engine 24+ и Docker Compose v2
- Домен, указывающий на IP сервера (для HTTPS)
- Порты 80 и 443 открыты в firewall

### Установка Docker (Ubuntu)

```bash
sudo apt update
sudo apt install -y ca-certificates curl
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# Перелогиньтесь, чтобы группа docker применилась
```

## 1. Клонирование и настройка

```bash
git clone <your-repo-url> onesec
cd onesec/kupikod-clone

cp .env.example .env
```

Отредактируйте `.env`:

| Переменная | Значение |
|------------|----------|
| `SITE_URL` | `http://<IP-сервера>` на первом запуске, затем `https://yourdomain.com` |
| `JWT_ACCESS_SECRET` | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 32` |
| `COOKIE_SECURE` | `false` для HTTP, `true` после включения HTTPS |
| `PAYMENT_WEBHOOK_SECRET` | произвольная строка |

## 2. Первый запуск (HTTP)

```bash
docker compose up -d --build
```

Проверка:

```bash
docker compose ps
curl http://localhost/api/health
```

Сайт доступен на `http://<IP-сервера>`. При первом запуске база автоматически заполнится демо-данными (seed).

### Демо-аккаунты

| Email | Пароль | Роль |
|-------|--------|------|
| `fgf@mail.ru` | `demo123456` | Пользователь |
| `ffffgdgf@mail.ru` | `admin123456` | Администратор |

## 3. Получение TLS-сертификата (Let's Encrypt)

Убедитесь, что домен указывает на IP сервера и порт 80 доступен.

```bash
# Установите certbot на хосте
sudo apt install -y certbot

# Получите сертификат (webroot — nginx уже обслуживает /.well-known/)
sudo certbot certonly --webroot \
  -w $(pwd)/docker/certbot/www \
  -d yourdomain.com \
  --email your@email.com \
  --agree-tos
```

Скопируйте сертификаты в каталог, доступный nginx-контейнеру:

```bash
sudo mkdir -p docker/certbot/conf
sudo cp -rL /etc/letsencrypt/* docker/certbot/conf/
sudo chown -R $USER:$USER docker/certbot/conf
```

## 4. Включение HTTPS

1. Откройте `docker/nginx/default.https.conf` и замените `example.com` на ваш домен (3 вхождения).

2. Обновите `docker-compose.yml` — замените секцию nginx:

```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/default.https.conf:/etc/nginx/conf.d/default.conf:ro
      - ./docker/certbot/conf:/etc/letsencrypt:ro
      - ./docker/certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
    restart: unless-stopped
```

3. Обновите `.env`:

```
SITE_URL=https://yourdomain.com
COOKIE_SECURE=true
```

4. Пересоберите frontend (нужен для `NEXT_PUBLIC_SITE_URL` в sitemap/robots):

```bash
docker compose up -d --build
```

## 5. Обновление приложения

```bash
git pull
docker compose up -d --build
```

Миграции БД применяются автоматически при старте backend.

## 6. Бэкап SQLite

```bash
docker compose exec backend cp /data/prod.db /data/backup-$(date +%F).db
docker compose cp backend:/data/backup-$(date +%F).db ./backup-$(date +%F).db
```

## 7. Принудительный сброс данных

**Внимание:** seed полностью очищает базу!

```bash
# В .env установите RUN_SEED=true, затем:
docker compose up -d --force-recreate backend
# После сброса уберите RUN_SEED из .env
```

## 8. Продление сертификата

```bash
sudo certbot renew
sudo cp -rL /etc/letsencrypt/* docker/certbot/conf/
docker compose restart nginx
```

Рекомендуется добавить cron на хосте:

```
0 3 * * * certbot renew --quiet && cp -rL /etc/letsencrypt/* /path/to/onesec/kupikod-clone/docker/certbot/conf/ && docker compose -f /path/to/onesec/kupikod-clone/docker-compose.yml restart nginx
```

## Устранение неполадок

### Backend не стартует

```bash
docker compose logs backend
```

Чаще всего — не заданы `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` в `.env`.

### Frontend не видит API

Проверьте, что backend healthy:

```bash
docker compose exec frontend wget -qO- http://backend:4000/api/health
```

### Cookies / авторизация не работают

- За HTTPS: `COOKIE_SECURE=true`
- `SITE_URL` должен совпадать с адресом в браузере

### Пересборка с нуля

```bash
docker compose down
docker volume rm kupikod-clone_sqlite-data   # удалит БД!
docker compose up -d --build
```

## Локальная проверка Docker-сборки

```bash
cp .env.example .env
docker compose up --build
# Откройте http://localhost
```
