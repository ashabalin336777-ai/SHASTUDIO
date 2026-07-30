#!/bin/sh
# Shared: restore LOGIN for postgres + app role via single-user mode.
# Requires: postmaster stopped, $PGDATA mounted, run as postgres uid.

set -eu

DATA="${PGDATA:-/var/lib/postgresql/data}"
SUPER_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
APP_USER="${POSTGRES_APP_USER:-shastudio}"
APP_PASSWORD="${POSTGRES_APP_PASSWORD:-${POSTGRES_PASSWORD:-postgres}}"

sql_escape() {
  printf '%s' "$1" | sed "s/'/''/g"
}

run_sql() {
  printf '%s\n' "$1" | postgres --single -D "$DATA" postgres >/tmp/ensure-roles-last.log 2>&1 || true
}

if [ ! -f "$DATA/PG_VERSION" ]; then
  echo "[ensure-roles] No cluster in $DATA yet — skip"
  exit 0
fi

SUPER_ESC="$(sql_escape "$SUPER_PASSWORD")"
APP_ESC="$(sql_escape "$APP_PASSWORD")"

echo "[ensure-roles] Ensuring LOGIN for postgres + ${APP_USER}..."

# Separate single-user passes: more reliable than DO $$ blocks in --single
run_sql "ALTER ROLE postgres WITH LOGIN SUPERUSER PASSWORD '${SUPER_ESC}';"

# Create app role if missing (ignore error if already exists)
run_sql "CREATE ROLE ${APP_USER} WITH LOGIN SUPERUSER PASSWORD '${APP_ESC}';"
run_sql "ALTER ROLE ${APP_USER} WITH LOGIN SUPERUSER PASSWORD '${APP_ESC}';"

echo "[ensure-roles] Done"
