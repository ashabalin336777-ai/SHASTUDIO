#!/usr/bin/env bash
# One-shot repair when role "postgres" has NOLOGIN and the stack is already broken.
# Prefer the compose entrypoint (self-heal on restart). Use this only for emergencies.
#
# Usage on VPS:
#   cd /opt/SHASTUDIO && bash deploy/db/repair-postgres-login.sh

set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$APP_DIR"

COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)
VOLUME="${POSTGRES_VOLUME:-shastudio_postgres_data}"
PASSWORD="${POSTGRES_PASSWORD:-postgres}"

echo "==> Stopping stack (required: data dir must not be locked)"
"${COMPOSE[@]}" down

if ! docker volume inspect "$VOLUME" >/dev/null 2>&1; then
  echo "Volume '$VOLUME' not found. Available volumes:"
  docker volume ls
  exit 1
fi

PG_UID="$(docker run --rm postgres:16-alpine sh -lc 'id -u postgres')"
echo "==> Repairing LOGIN on volume $VOLUME (uid=$PG_UID)"

docker run --rm \
  --user "$PG_UID:$PG_UID" \
  -v "${VOLUME}:/var/lib/postgresql/data" \
  postgres:16-alpine \
  sh -lc "printf \"%s\\n\" \"ALTER ROLE postgres WITH LOGIN SUPERUSER PASSWORD '${PASSWORD//\'/\'\'}';\" | postgres --single -D /var/lib/postgresql/data postgres"

echo "==> Starting stack"
"${COMPOSE[@]}" up -d

echo "==> Waiting for db"
sleep 8
"${COMPOSE[@]}" exec -T db psql -U postgres -d shastudio -c "SELECT 1 AS ok;"

echo "==> Done. Check: curl -sS https://shastudio.ru/api/profile"
