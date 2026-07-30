#!/bin/sh
# Runs before the official Postgres entrypoint.
# See deploy/db/README.md for why role LOGIN keeps disappearing.

set -eu

DATA="${PGDATA:-/var/lib/postgresql/data}"

if [ -f /ensure-roles.sh ]; then
  sh /ensure-roles.sh || {
    echo "[db-entrypoint] WARN: ensure-roles failed (cluster may still start)"
  }
fi

exec /usr/local/bin/docker-entrypoint.sh "$@"
