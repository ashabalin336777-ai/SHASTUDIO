#!/bin/sh
# Live guard (runs in docker:cli container with docker.sock).
# If app role cannot log in, restart only shastudio-db so entrypoint restores LOGIN.
# Primary protection is using role "shastudio" instead of "postgres".

set -eu

APP_USER="${POSTGRES_APP_USER:-shastudio}"
APP_PASSWORD="${POSTGRES_APP_PASSWORD:-${POSTGRES_PASSWORD:-postgres}}"
DB_NAME="${POSTGRES_DB:-shastudio}"
INTERVAL="${DB_GUARD_INTERVAL_SEC:-45}"
FAILS_BEFORE_RESTART="${DB_GUARD_FAILS_BEFORE_RESTART:-2}"
DB_CONTAINER="${DB_CONTAINER:-shastudio-db}"

fails=0

echo "[db-guard] watching ${APP_USER} in ${DB_CONTAINER} every ${INTERVAL}s"

while true; do
  if docker exec \
    -e "PGPASSWORD=${APP_PASSWORD}" \
    "$DB_CONTAINER" \
    psql -h 127.0.0.1 -U "$APP_USER" -d "$DB_NAME" -c "SELECT 1" >/dev/null 2>&1; then
    if [ "$fails" -ne 0 ]; then
      echo "[db-guard] DB login restored"
    fi
    fails=0
  else
    fails=$((fails + 1))
    echo "[db-guard] login failed (${fails}/${FAILS_BEFORE_RESTART})"
    if [ "$fails" -ge "$FAILS_BEFORE_RESTART" ]; then
      echo "[db-guard] restarting ${DB_CONTAINER}"
      docker restart "$DB_CONTAINER" || true
      fails=0
      sleep 25
    fi
  fi
  sleep "$INTERVAL"
done
