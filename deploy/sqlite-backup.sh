#!/usr/bin/env bash
# Nightly SQLite + uploads backup for ShaStudio
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/SHASTUDIO}"
BACKUP_DIR="${BACKUP_DIR:-/opt/backups/shastudio}"
TS="$(date +%F_%H-%M-%S)"
mkdir -p "$BACKUP_DIR"

cd "$APP_DIR"
COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)

# Copy sqlite file from volume via backend container
"${COMPOSE[@]}" exec -T backend sh -c 'cp /app/data/shastudio.db /tmp/shastudio.db 2>/dev/null || true'
"${COMPOSE[@]}" cp backend:/tmp/shastudio.db "$BACKUP_DIR/shastudio_$TS.db" 2>/dev/null || {
  # fallback: docker volume mount one-off
  docker run --rm -v shastudio_backend_data:/data -v "$BACKUP_DIR":/out alpine \
    cp /data/shastudio.db "/out/shastudio_$TS.db"
}

gzip -9 -f "$BACKUP_DIR/shastudio_$TS.db"
find "$BACKUP_DIR" -type f -name "shastudio_*.db.gz" -mtime +14 -delete
echo "Backup: $BACKUP_DIR/shastudio_$TS.db.gz"
