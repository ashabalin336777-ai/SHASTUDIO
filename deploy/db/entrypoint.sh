#!/bin/sh
# Runs before the official Postgres entrypoint.
# Must run ensure-roles as user "postgres" — postgres --single refuses root.

set -eu

run_ensure() {
  if [ ! -f /ensure-roles.sh ]; then
    return 0
  fi

  if [ "$(id -u)" = '0' ]; then
    if command -v su-exec >/dev/null 2>&1; then
      su-exec postgres sh /ensure-roles.sh
    elif command -v gosu >/dev/null 2>&1; then
      gosu postgres sh /ensure-roles.sh
    else
      echo "[db-entrypoint] ERROR: su-exec/gosu missing; cannot ensure roles"
      return 1
    fi
  else
    sh /ensure-roles.sh
  fi
}

if ! run_ensure; then
  echo "[db-entrypoint] WARN: ensure-roles failed (cluster may still start)"
fi

exec /usr/local/bin/docker-entrypoint.sh "$@"
