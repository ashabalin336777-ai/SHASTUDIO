# Postgres LOGIN outages

## Root cause (why it came back every ~30 minutes)

Something on the VPS (cron / security hardening / panel script) periodically runs
the equivalent of:

```sql
ALTER ROLE postgres NOLOGIN;
```

That is **not** done by ShaStudio app code. Symptoms:

- `/health` → `{"status":"degraded","db":"down"}`
- API / admin → `500` / Prisma `P1000`
- `psql -U postgres` → `role "postgres" is not permitted to log in`

`pg_isready` stays green. Fixing only at container start is not enough if
NOLOGIN is applied while Postgres is still running.

## Permanent mitigation in this repo

1. **App role `shastudio`** — backend `DATABASE_URL` uses this role, not `postgres`.
   Hardening that only disables `postgres` no longer takes the site down.
2. **`deploy/db/ensure-roles.sh`** — on every db container start (single-user),
   restores `LOGIN` for both `postgres` and `shastudio`.
3. **`autoheal`** — restarts unhealthy containers; db entrypoint re-applies LOGIN.
4. **`db-guard`** — every ~45s checks app-role login; after 2 failures restarts
   only `shastudio-db`.

## Deploy / repair on VPS

```bash
cd /opt/SHASTUDIO
git pull origin main
# one-time if currently broken:
bash deploy/db/repair-postgres-login.sh
# or if already healthy, just recreate stack:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Confirm:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl -sS https://shastudio.ru/health   # expect db=up
crontab -l                             # look for scripts that touch postgres
```

## Find the host job that sets NOLOGIN

```bash
crontab -l
ls -la /etc/cron.* /etc/cron.d 2>/dev/null
grep -RniE 'NOLOGIN|ALTER ROLE|postgres' /etc/cron* /usr/local/bin /opt 2>/dev/null | head
```

Disable or edit that job so it does not run `ALTER ROLE postgres NOLOGIN`
against this volume — otherwise you will still see useless restarts of `db`
even though the app role keeps the site up.
