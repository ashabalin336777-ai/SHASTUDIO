# Database notes (SQLite)

ShaStudio uses **SQLite**, not PostgreSQL.

- File in container: `/app/data/shastudio.db`
- Docker volume: `backend_data`
- Uploads (images/PDF): volume `backend_uploads` → `/app/uploads`

Full ops docs (deploy, backup, troubleshooting): see root [README.md](../../README.md).

```bash
# backup
bash deploy/sqlite-backup.sh

# health
curl -sS https://shastudio.ru/health
```
