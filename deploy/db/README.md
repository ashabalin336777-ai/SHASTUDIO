# SQLite (no Postgres)

ShaStudio uses a local SQLite file inside the backend container:

- path: `/app/data/shastudio.db`
- volume: `backend_data`
- env: `DATABASE_URL=file:/app/data/shastudio.db`

## Why

Postgres on this VPS kept losing `LOGIN` on role `postgres`. For a small
portfolio (text + files in `/uploads`) SQLite is enough and removes that failure mode.

## Deploy

```bash
cd /opt/SHASTUDIO
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build backend
curl -sS https://shastudio.ru/health
```

Uploads volume `backend_uploads` is unchanged — certificate PDFs/images stay on disk.
Database rows (profile, certificate metadata, etc.) start empty unless you import JSON.

Admin user is re-seeded from `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) on backend start.

## Backup

```bash
chmod +x deploy/sqlite-backup.sh
./deploy/sqlite-backup.sh
```

## Old Postgres volume

After SQLite works, you may remove the unused volume (destroys PG data):

```bash
docker volume rm shastudio_postgres_data
```
