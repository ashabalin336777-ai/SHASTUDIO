#!/usr/bin/env bash
# Emergency offline repair: restore LOGIN for postgres + app role, then start stack.
# Usage: cd /opt/SHASTUDIO && bash deploy/db/repair-postgres-login.sh

set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$APP_DIR"

COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)
VOLUME="${POSTGRES_VOLUME:-shastudio_postgres_data}"
PASSWORD="${POSTGRES_PASSWORD:-postgres}"
APP_USER="${POSTGRES_APP_USER:-shastudio}"
APP_PASSWORD="${POSTGRES_APP_PASSWORD:-$PASSWORD}"

echo "==> Stopping stack (data dir must not be locked)"
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
  -e POSTGRES_PASSWORD="$PASSWORD" \
  -e POSTGRES_APP_USER="$APP_USER" \
  -e POSTGRES_APP_PASSWORD="$APP_PASSWORD" \
  -e PGDATA=/var/lib/postgresql/data \
  -v "${VOLUME}:/var/lib/postgresql/data" \
  -v "$APP_DIR/deploy/db/ensure-roles.sh:/ensure-roles.sh:ro" \
  postgres:16-alpine \
  sh /ensure-roles.sh

echo "==> Starting stack"
"${COMPOSE[@]}" up -d

echo "==> Waiting for db"
sleep 10
"${COMPOSE[@]}" exec -T db psql -U "$APP_USER" -d shastudio -c "SELECT current_user, 1 AS ok;"

echo "==> Done. Check: curl -sS https://shastudio.ru/health"
