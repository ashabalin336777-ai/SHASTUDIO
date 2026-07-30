# Postgres LOGIN outages

## What goes wrong

Something on the VPS periodically sets `ALTER ROLE postgres NOLOGIN`.
Then API/admin return 500 and `/health` shows `"db":"down"`.

## What this stack does

1. **`deploy/db/entrypoint.sh`** — before Postgres starts, runs
   `ensure-roles.sh` as OS user `postgres` via `su-exec`
   (`postgres --single` refuses root).
2. **`ensure-roles.sh`** — `ALTER ROLE postgres WITH LOGIN SUPERUSER PASSWORD ...`
3. **healthcheck** — real `psql -U postgres ... SELECT 1` (not only `pg_isready`)
4. **autoheal** — restarts unhealthy `db`; entrypoint restores LOGIN again

Backend uses role **`postgres`** (simple and proven for this project).

## Ops

```bash
cd /opt/SHASTUDIO
git pull origin main
bash deploy/db/repair-postgres-login.sh   # if currently broken
# or:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Find host jobs that set NOLOGIN:

```bash
crontab -l
grep -RniE 'NOLOGIN|ALTER ROLE postgres' /etc/cron* /usr/local/bin /opt 2>/dev/null | head
```
