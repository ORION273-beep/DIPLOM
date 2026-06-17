#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FLY="${FLY:-$HOME/.local/bin/flyctl}"
API_APP="${API_APP:-onesec-diplom-api}"
WEB_APP="${WEB_APP:-onesec-diplom-web}"
API_URL="https://${API_APP}.fly.dev"
WEB_URL="https://${WEB_APP}.fly.dev"

install_fly() {
  if [[ -x "$FLY" ]]; then
    return 0
  fi
  echo "→ Установка flyctl..."
  mkdir -p "$HOME/.local/bin"
  curl -fsSL https://fly.io/install.sh | FLYCTL_INSTALL="$HOME/.local" sh
  FLY="$HOME/.local/bin/flyctl"
}

gen_secret() {
  openssl rand -base64 48 | tr -d '/+=' | head -c 48
}

require_auth() {
  if ! "$FLY" auth whoami >/dev/null 2>&1; then
    echo "Нужен вход в Fly.io:"
    "$FLY" auth login
  fi
  echo "✓ Fly.io: $("$FLY" auth whoami 2>&1 | head -1)"
}

ensure_api_app() {
  if ! "$FLY" status -a "$API_APP" >/dev/null 2>&1; then
    echo "→ Создание приложения ${API_APP}..."
    "$FLY" apps create "$API_APP"
  fi
  if ! "$FLY" volumes list -a "$API_APP" 2>/dev/null | grep -q onesec_data; then
    echo "→ Создание volume для SQLite..."
    "$FLY" volumes create onesec_data --region ams --size 1 -a "$API_APP" -y
  fi
}

ensure_web_app() {
  if ! "$FLY" status -a "$WEB_APP" >/dev/null 2>&1; then
    echo "→ Создание приложения ${WEB_APP}..."
    "$FLY" apps create "$WEB_APP"
  fi
}

set_api_secrets() {
  local access refresh
  access="${JWT_ACCESS_SECRET:-$(gen_secret)}"
  refresh="${JWT_REFRESH_SECRET:-$(gen_secret)}"
  echo "→ Секреты backend..."
  "$FLY" secrets set -a "$API_APP" \
    "JWT_ACCESS_SECRET=${access}" \
    "JWT_REFRESH_SECRET=${refresh}" \
    "FRONTEND_URL=${WEB_URL}" \
    "COOKIE_SECURE=true" \
    "PAYMENT_WEBHOOK_SECRET=${PAYMENT_WEBHOOK_SECRET:-$(gen_secret)}"
}

set_web_secrets() {
  echo "→ Секреты frontend..."
  "$FLY" secrets set -a "$WEB_APP" "BACKEND_URL=${API_URL}"
}

deploy_api() {
  echo "→ Деплой backend (${API_URL})..."
  cd "$ROOT/backend"
  "$FLY" deploy --config fly.toml --app "$API_APP" --ha=false
}

deploy_web() {
  echo "→ Деплой frontend (${WEB_URL})..."
  cd "$ROOT"
  "$FLY" deploy --config fly.toml --app "$WEB_APP" --ha=false
}

wait_healthy() {
  local url="$1"
  local i
  for i in $(seq 1 40); do
    if curl -sf "$url" >/dev/null 2>&1; then
      echo "✓ $url"
      return 0
    fi
    sleep 3
  done
  echo "✗ Не дождались: $url"
  return 1
}

install_fly
require_auth
ensure_api_app
set_api_secrets
deploy_api
wait_healthy "${API_URL}/api/health"
ensure_web_app
set_web_secrets
deploy_web
wait_healthy "${WEB_URL}/"

echo ""
echo "════════════════════════════════════════"
echo "  OneSec задеплоен на Fly.io"
echo "════════════════════════════════════════"
echo ""
echo "  Сайт:    ${WEB_URL}"
echo "  API:     ${API_URL}"
echo "  Swagger: ${API_URL}/api/docs"
echo ""
echo "  Демо: fgf@mail.ru / demo123456"
echo "  Админ: fffff@mail.ru / admin123456"
echo ""
