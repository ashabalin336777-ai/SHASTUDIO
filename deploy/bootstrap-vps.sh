#!/bin/bash
# ShaStudio — первичный деплой на VPS (Timeweb). Запуск из веб-консоли:
#   curl -fsSL https://raw.githubusercontent.com/ashabalin336777-ai/SHASTUDIO/main/deploy/bootstrap-vps.sh | bash

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/SHASTUDIO}"
REPO_URL="${REPO_URL:-https://github.com/ashabalin336777-ai/SHASTUDIO.git}"
BRANCH="${BRANCH:-main}"

echo "==> Docker"
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y ca-certificates curl git
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

echo "==> Repo"
mkdir -p "$(dirname "$APP_DIR")"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "==> .env"
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "!!! Создан .env из примера. Отредактируйте секреты:"
  echo "    nano $APP_DIR/.env"
  echo "    (JWT_SECRET, ADMIN_PASSWORD, VSELLM_API_KEY, ...)"
  echo ""
fi

echo "==> SSL certs"
if [ ! -f deploy/certs/fullchain.pem ] || [ ! -f deploy/certs/privkey.pem ]; then
  echo "Нет deploy/certs/fullchain.pem или privkey.pem"
  echo "Положите certificate.crt и private.key в deploy/certs/ и выполните:"
  echo "  chmod +x deploy/certs/combine-timeweb.sh && ./deploy/certs/combine-timeweb.sh"
  exit 1
fi

echo "==> Build & up (production)"
chmod +x deploy/db/*.sh 2>/dev/null || true
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

echo "==> Status"
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

echo ""
echo "Готово. Проверка:"
echo "  curl -k https://127.0.0.1/health   # status=ok и db=up"
echo "  curl -k https://127.0.0.1/api/profile"
echo "  https://shastudio.ru"
echo ""
echo "DB: backend uses role shastudio (not postgres)."
echo "If broken offline: bash deploy/db/repair-postgres-login.sh"
echo "Also check: crontab -l  # for ALTER ROLE postgres NOLOGIN jobs"
