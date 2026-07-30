#!/usr/bin/env bash
# Emergency offline repair for role postgres NOLOGIN.
# Usage: cd /opt/SHASTUDIO && bash deploy/db/repair-postgres-login.sh

set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$APP_DIR"

COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)
VOLUME="${POSTGRES_VOLUME:-shastudio_postgres_data}"
PASSWORD="${POSTGRES_PASSWORD:-postgres}"

echo "==> Stopping stack"
"${COMPOSE[@]}" down

if ! docker volume inspect "$VOLUME" >/dev/null 2>&1; then
  echo "Volume '$VOLUME' not found:"
  docker volume ls
  exit 1
fi

PG_UID="$(docker run --rm postgres:16-alpine sh -lc 'id -u postgres')"
echo "==> Repairing LOGIN on $VOLUME (uid=$PG_UID)"

docker run --rm \
  --user "$PG_UID:$PG_UID" \
  -e POSTGRES_PASSWORD="$PASSWORD" \
  -e PGDATA=/var/lib/postgresql/data \
  -v "${VOLUME}:/var/lib/postgresql/data" \
  -v "$APP_DIR/deploy/db/ensure-roles.sh:/ensure-roles.sh:ro" \
  postgres:16-alpine \
  sh /ensure-roles.sh

echo "==> Starting stack"
"${COMPOSE[@]}" up -d

echo "==> Wait + check"
sleep 12
"${COMPOSE[@]}" exec -T db psql -U postgres -d shastudio -c "SELECT 1 AS ok;"
echo "Done. curl -sS https://shastudio.ru/health"
