# Postgres role LOGIN self-heal

## Why `role "postgres" is not permitted to log in` happens

PostgreSQL stores a flag `rolcanlogin` per role. When it is false, every
connection fails with:

```text
FATAL: role "postgres" is not permitted to log in
```

The app then returns `500 Internal server error` / Prisma `P1000`, while
`/health` used to stay green because it did not touch the database.

This project does **not** set `NOLOGIN` in application code. It usually comes
from:

1. Emergency `postgres --single` repairs while the DB container was still running
   (catalog / data-dir races).
2. Manual "hardening" SQL (`ALTER ROLE postgres NOLOGIN`) without updating
   compose credentials.
3. Incomplete recovery after volume corruption / interrupted single-user sessions.

`pg_isready` alone does **not** detect this (it can stay healthy without LOGIN).

## What we do now

1. `deploy/db/entrypoint.sh` — before every Postgres start, runs single-user
   `ALTER ROLE postgres WITH LOGIN SUPERUSER PASSWORD ...` when the data dir
   already exists. Self-heals on `docker compose up` / container restart.
2. Compose healthcheck uses `psql ... SELECT 1` (real login).
3. Backend `/health` returns `503` with `"db":"down"` if Prisma cannot query.
4. `deploy/db/repair-postgres-login.sh` — offline emergency repair if the
   entrypoint cannot run.

## Ops rules

- Never run `ALTER ROLE postgres NOLOGIN` on this stack.
- Never run `postgres --single` while `shastudio-db` is still up.
- Keep `POSTGRES_PASSWORD` in `.env` in sync with what you expect; compose builds
  backend `DATABASE_URL` as `postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/shastudio`.
- Local `DATABASE_URL` with `localhost:5433` is only for host-side Prisma/dev.
