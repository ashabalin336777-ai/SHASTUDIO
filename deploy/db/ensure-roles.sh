#!/bin/sh
# Restore LOGIN for role postgres via single-user mode.
# Must run as OS user "postgres" (not root).

set -eu

DATA="${PGDATA:-/var/lib/postgresql/data}"
SUPER_PASSWORD="${POSTGRES_PASSWORD:-postgres}"

sql_escape() {
  printf '%s' "$1" | sed "s/'/''/g"
}

if [ ! -f "$DATA/PG_VERSION" ]; then
  echo "[ensure-roles] No cluster yet — skip"
  exit 0
fi

SUPER_ESC="$(sql_escape "$SUPER_PASSWORD")"
echo "[ensure-roles] Ensuring role postgres has LOGIN..."

printf "ALTER ROLE postgres WITH LOGIN SUPERUSER PASSWORD '%s';\n" "$SUPER_ESC" \
  | postgres --single -D "$DATA" postgres

echo "[ensure-roles] Done"
