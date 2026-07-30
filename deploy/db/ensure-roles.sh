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

if [ ! -f "$DATA/PG_VERSION" ]; then
  echo "[ensure-roles] No cluster in $DATA yet — skip"
  exit 0
fi

SUPER_ESC="$(sql_escape "$SUPER_PASSWORD")"
APP_ESC="$(sql_escape "$APP_PASSWORD")"
USER_ESC="$(sql_escape "$APP_USER")"

echo "[ensure-roles] Ensuring LOGIN for postgres + ${APP_USER}..."

{
  printf "ALTER ROLE postgres WITH LOGIN SUPERUSER PASSWORD '%s';\n" "$SUPER_ESC"
  printf "DO \$\$\n"
  printf "BEGIN\n"
  printf "  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '%s') THEN\n" "$USER_ESC"
  printf "    CREATE ROLE \"%s\" WITH LOGIN SUPERUSER PASSWORD '%s';\n" "$USER_ESC" "$APP_ESC"
  printf "  ELSE\n"
  printf "    ALTER ROLE \"%s\" WITH LOGIN SUPERUSER PASSWORD '%s';\n" "$USER_ESC" "$APP_ESC"
  printf "  END IF;\n"
  printf "END\n"
  printf "\$\$;\n"
} | postgres --single -D "$DATA" postgres

echo "[ensure-roles] Done"
