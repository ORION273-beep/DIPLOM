#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

GH="${GH:-$HOME/.local/bin/gh}"
REPO_NAME="${REPO_NAME:-onesec-diplom}"

require_gh() {
  if [[ ! -x "$GH" ]]; then
    echo "GitHub CLI не найден. Установите: https://cli.github.com"
    exit 1
  fi
  if ! "$GH" auth status >/dev/null 2>&1; then
    echo "→ Вход в GitHub (один раз):"
    "$GH" auth login -p https -h github.com -w
  fi
  echo "✓ GitHub: $("$GH" auth status 2>&1 | head -1)"
}

ensure_repo() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git init -b main
  fi

  if [[ -z "$(git status --porcelain)" ]]; then
    echo "✓ Git: нет незакоммиченных изменений"
  else
    echo "→ Коммит изменений для деплоя..."
    git add -A
    git commit -m "Deploy: OneSec on Render"
  fi

  if git remote get-url origin >/dev/null 2>&1; then
    echo "→ Push в origin..."
    git push -u origin main
    REPO_URL="$("$GH" repo view --json url -q .url)"
  else
    echo "→ Создание репозитория ${REPO_NAME} на GitHub..."
    "$GH" repo create "$REPO_NAME" --public --source=. --remote=origin --push
    REPO_URL="$("$GH" repo view --json url -q .url)"
  fi
}

print_render_steps() {
  local blueprint_url="https://dashboard.render.com/blueprint/new?repo=${REPO_URL}"

  echo ""
  echo "════════════════════════════════════════════════════════"
  echo "  Код на GitHub — осталось подключить Render"
  echo "════════════════════════════════════════════════════════"
  echo ""
  echo "  1. Войдите на https://render.com (через GitHub, бесплатно)"
  echo "  2. Откройте Blueprint:"
  echo "     ${blueprint_url}"
  echo "  3. Нажмите Apply — Render поднимет API + сайт из render.yaml"
  echo ""
  echo "  После деплоя (~5–10 мин):"
  echo "    Сайт: https://onesec-web.onrender.com"
  echo "    API:  https://onesec-api.onrender.com"
  echo ""
  echo "  Демо: fgf@mail.ru / demo123456"
  echo "════════════════════════════════════════════════════════"
  echo ""
}

require_gh
ensure_repo
print_render_steps
