#!/bin/sh
# Runs before the official Postgres entrypoint.
#
# Why: if role "postgres" has rolcanlogin=false, every API call fails with
# Prisma P1000 / "not permitted to log in". Normal psql cannot fix that —
# only single-user mode can, and only while the postmaster is stopped.
# Doing this on every container start makes the failure self-healing.

set -eu

DATA="${PGDATA:-/var/lib/postgresql/data}"
SUPER_PASSWORD="${POSTGRES_PASSWORD:-postgres}"

sql_escape() {
  printf '%s' "$1" | sed "s/'/''/g"
}

ensure_postgres_login() {
  if [ ! -f "$DATA/PG_VERSION" ]; then
    return 0
  fi

  PASSWORD_ESC="$(sql_escape "$SUPER_PASSWORD")"
  echo "[db-entrypoint] Ensuring role postgres has LOGIN..."

  if printf "ALTER ROLE postgres WITH LOGIN SUPERUSER PASSWORD '%s';\n" "$PASSWORD_ESC" \
    | postgres --single -D "$DATA" postgres >/tmp/db-ensure-login.log 2>&1; then
    echo "[db-entrypoint] Role postgres LOGIN ok"
  else
    echo "[db-entrypoint] WARN: could not ensure LOGIN (cluster may still start)"
    cat /tmp/db-ensure-login.log || true
  fi
}

ensure_postgres_login

exec /usr/local/bin/docker-entrypoint.sh "$@"
