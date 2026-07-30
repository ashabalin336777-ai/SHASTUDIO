# ShaStudio

Динамическое портфолио на Docker: **Next.js** (сайт) + **Express / Prisma / SQLite** (API) + **Nginx SSL** + AI-чат (VseLLM).  
Прод: [https://shastudio.ru](https://shastudio.ru)

## Стек

| Часть | Технология |
|-------|------------|
| Frontend | Next.js (App Router) |
| Backend | Express 5, Prisma 7, SQLite (`@prisma/adapter-libsql`) |
| Файлы | том Docker `backend_uploads` → `/app/uploads` |
| БД | файл SQLite в томе `backend_data` → `/app/data/shastudio.db` |
| Прокси | Nginx (HTTP→HTTPS, `/` → frontend, `/api` и `/uploads` → backend) |

PostgreSQL **больше не используется** (на VPS были повторяющиеся сбои `role postgres is not permitted to log in`). Для портфолио достаточно SQLite.

---

## Быстрый старт (локально)

```bash
cp .env.example .env
# заполните JWT_SECRET, ADMIN_PASSWORD, VSELLM_API_KEY при необходимости

docker compose up -d --build
```

| URL | Назначение |
|-----|------------|
| http://localhost:3010 | Сайт |
| http://localhost:3001 | API напрямую |
| http://localhost:3001/health | Health (`status`, `db`) |
| http://localhost:3010/admin/login | Админка |

Админ создаётся при старте backend из `.env`: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (по умолчанию `admin@shastudio.local` / `admin123`).

### Без полного Docker

```bash
# Backend
cd backend
npm install
# DATABASE_URL=file:./data/shastudio.db в backend/.env или корневом .env
npx prisma migrate deploy
npm run dev

# Frontend (другой терминал)
cd frontend
npm install
npm run dev -- -p 3010
```

---

## Продакшен на VPS (Timeweb)

Каталог на сервере: `/opt/SHASTUDIO`.

### Первый / обычный деплой

```bash
cd /opt/SHASTUDIO
git fetch origin
git checkout main
git reset --hard origin/main   # если на сервере были локальные правки

# SSL: deploy/certs/fullchain.pem + privkey.pem
# (из certificate.crt + private.key → ./deploy/certs/combine-timeweb.sh)

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Проверка:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl -sS https://shastudio.ru/health
# ожидаемо: {"status":"ok","db":"up",...}
```

Контейнеры на проде: **backend**, **frontend**, **nginx** (без Postgres).

### Важно: volumes на проде

`docker-compose.prod.yml` использует `volumes: !override`, чтобы **не** подмешивать локальный bind-mount `./backend` и том `backend_node_modules` с dev-compose.  
Иначе на VPS бывает `MODULE_NOT_FOUND` при том, что код уже новый.

Если backend в `Restarting` и в логах нет нужного npm-пакета:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker volume rm shastudio_backend_node_modules 2>/dev/null || true
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Переменные `.env` на VPS

См. `.env.example`. Критично:

- `JWT_SECRET`, `NEXTAUTH_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (и временно `ADMIN_PASSWORD_FORCE=true` только для сброса пароля, потом снова `false`)
- `NEXT_PUBLIC_API_URL=https://shastudio.ru`
- `NEXTAUTH_URL=https://shastudio.ru`
- `VSELLM_API_KEY` (для AI)

`DATABASE_URL` в контейнере задаётся compose: `file:/app/data/shastudio.db` (локальный `.env` с `localhost` Postgres не нужен).

### SSL (Timeweb)

1. Положить `.crt` / `.key` (и ca-bundle при наличии) в `deploy/certs/`
2. `chmod +x deploy/certs/combine-timeweb.sh && ./deploy/certs/combine-timeweb.sh`
3. Перезапуск nginx:  
   `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx`

---

## Данные: что где лежит

| Данные | Где |
|--------|-----|
| Текст, профиль, метаданные сертификатов, разделы | SQLite → том **`backend_data`** |
| Загруженные PDF/картинки | том **`backend_uploads`** → `/uploads/...` |
| Старый Postgres (если остался) | том `shastudio_postgres_data` — можно удалить после перехода на SQLite |

После миграции на SQLite **записи в БД** нужно заново внести через админку (или импорт JSON).  
**Файлы** в `backend_uploads` обычно сохраняются, если том не удаляли.

Админка: [https://shastudio.ru/admin](https://shastudio.ru/admin)  
Публичные сертификаты: превью сеткой на `/certificates` (PDF — iframe, картинки — img).

---

## Бэкап SQLite

```bash
cd /opt/SHASTUDIO
chmod +x deploy/sqlite-backup.sh
bash deploy/sqlite-backup.sh
# файлы в /opt/backups/shastudio/shastudio_YYYY-MM-DD_....db.gz
```

Cron (пример, ежедневно в 03:30):

```bash
( crontab -l 2>/dev/null; echo "30 3 * * * /opt/SHASTUDIO/deploy/sqlite-backup.sh >> /var/log/shastudio-backup.log 2>&1" ) | crontab -
```

---

## Git: ветки по разделам сайта

Для независимой разработки:

| Ветка | Раздел |
|-------|--------|
| `feature/overview` | Обзор |
| `feature/profile` | Профиль |
| `feature/experience` | Опыт |
| `feature/education` | Образование |
| `feature/courses` | Курсы |
| `feature/projects` | Проекты |
| `feature/blog` | Блог |
| `feature/certificates` | Сертификаты |
| `feature/contacts` | Контакты |
| `feature/ai` | AI |

Рабочий цикл:

```bash
git checkout feature/certificates
git pull origin feature/certificates
# правки → commit → push

# тест на VPS (переключить ветку и пересобрать frontend/backend по необходимости)
git fetch origin && git checkout feature/certificates && git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d frontend nginx

# в main после проверки — merge / PR на GitHub
git checkout main && git pull && git merge feature/certificates && git push origin main
```

На VPS для продакшена держите **`main`**.

---

## Health и типичные сбои

```bash
curl -sS https://shastudio.ru/health
# ok + db=up  → API и SQLite в порядке
# 503 + db=down → проблема доступа к файлу БД / падение backend
# 502 от nginx → backend не запущен (смотрите logs backend)
```

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs backend --tail=80
```

| Симптом | Что сделать |
|---------|-------------|
| `502 Bad Gateway` | `ps` / `logs backend`; пересобрать backend |
| `MODULE_NOT_FOUND` | см. выше: `!override` volumes + удалить `backend_node_modules` + `--no-cache` |
| Docker Hub `429` | `docker login`, затем снова `build` |
| DNS «не найден IP» | проверить A-запись на `5.129.240.160`, сменить DNS на ПК / flushdns |

---

## Структура репозитория

```
├── frontend/                 # Next.js
├── backend/                  # Express + Prisma + SQLite
│   ├── prisma/               # schema + migrations (sqlite)
│   ├── data/                 # локальный .db (в git не коммитится)
│   └── src/
├── deploy/
│   ├── nginx/                # nginx.conf + conf.d
│   ├── certs/                # SSL (не коммитить секреты)
│   ├── sqlite-backup.sh
│   ├── bootstrap-vps.sh
│   └── db/README.md          # заметки по SQLite
├── docker-compose.yml        # base (+ bind-mount для dev)
├── docker-compose.prod.yml   # прод: override volumes, Dockerfile.prod
├── .env.example
└── README.md
```

---

## Лицензия / репозиторий

GitHub: [ashabalin336777-ai/SHASTUDIO](https://github.com/ashabalin336777-ai/SHASTUDIO)
