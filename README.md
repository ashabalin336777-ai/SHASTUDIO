# ShaStudio

Динамическое портфолио на Docker: сайт (Next.js), API (Express + Prisma + SQLite), AI-чат (VseLLM) и админка для контента. Публикация на `shastudio.ru` через Nginx с SSL.

## Как запустить

1. Скопируйте окружение:

```bash
cp .env.example .env
```

2. Поднимите сервисы:

```bash
docker compose up -d --build
```

3. Откройте:

| Сервис   | URL |
|----------|-----|
| Frontend | http://localhost:3010 |
| Backend  | http://localhost:3001 |
| Health   | http://localhost:3001/health |
| Admin    | http://localhost:3010/admin/login |

Админ по умолчанию: `admin@shastudio.local` / `admin123` (или значения из `.env`).

### Локально без полного Docker

```bash
# Backend (SQLite: file:./data/shastudio.db)
cd backend && npm install && npx prisma migrate deploy && npm run dev

# Frontend
cd frontend && npm install && npm run dev -- -p 3010
```

## HTTPS (Timeweb)

1. Положите `.crt`, `.key` (и при наличии ca-bundle) в `deploy/certs/`
2. Соберите PEM:
   - Windows: `cd deploy\certs; .\combine-timeweb.ps1`
   - Linux: `./deploy/certs/combine-timeweb.sh`
3. `docker compose up -d --build`
4. В `.env`: `NEXT_PUBLIC_API_URL=https://shastudio.ru`, `NEXTAUTH_URL=https://shastudio.ru`

Nginx слушает 80/443, редиректит HTTP→HTTPS, проксирует `/` → frontend:3000, `/api` и `/uploads` → backend:3001.

## Работа с GitHub: ветка → PR → merge

1. **Ветка** — создайте feature-ветку от `main` и внесите изменения:
   ```bash
   git checkout main
   git pull
   git checkout -b feature
   # ... правки ...
   git add -A
   git commit -m "Описание изменений"
   git push -u origin feature
   ```
2. **Pull Request** — откройте PR `feature` → `main` на GitHub (кнопка Compare & pull request или `gh pr create`).
3. **Merge** — после ревью нажмите **Merge pull request** в интерфейсе GitHub, затем локально:
   ```bash
   git checkout main
   git pull
   ```

## Структура

```
├── frontend/          # Next.js
├── backend/           # Express + Prisma
├── mcp-server/        # MCP stub
├── deploy/            # Nginx + SSL (Timeweb)
├── docker-compose.yml
└── .env.example
```
