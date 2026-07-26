# ShaStudio

Динамическое портфолио: Docker monorepo (Next.js + Express + PostgreSQL) с AI-чатом на VseLLM.

## Структура

```
├── frontend/          # Next.js приложение
├── backend/           # Node.js API (Express + Prisma)
├── mcp-server/        # MCP сервер (stub) для генерации разделов
├── deploy/            # Nginx config для TimeWEB
├── docker-compose.yml
├── .env / .env.example
└── README.md
```

## Быстрый старт (Docker)

```bash
npm run docker:up
# или
docker compose up -d --build
```

## Авторизация админки

По умолчанию при старте backend создаётся пользователь:

- email: `admin@shastudio.local`
- password: `admin123` (задайте `ADMIN_PASSWORD` в `.env`)

Вход: http://localhost:3010/admin/login  
Смена пароля: http://localhost:3010/admin/account  

Сброс пароля из `.env`:
1. Укажите новый `ADMIN_PASSWORD`
2. Поставьте `ADMIN_PASSWORD_FORCE=true`
3. `docker compose up -d --force-recreate backend`
4. Верните `ADMIN_PASSWORD_FORCE=false`

Публичные GET и AI-чат остаются открытыми; POST/PUT/DELETE требуют JWT.

4. Сервисы:

| Сервис   | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:3010    |
| Backend  | http://localhost:3001    |
| Health   | http://localhost:3001/health |
| Admin    | http://localhost:3010/admin/experience |
| Postgres | localhost:5433 (host) → 5432 (container) |

> Хост-порт frontend — **3010** (3000 был занят). Хост-порт БД — **5433**. Внутри Docker-сети backend ходит на `db:5432`.

## Frontend hot-reload на Windows

Из‑за особенностей Docker Desktop bind-mount Next.js в контейнере может сразу завершаться.
Поэтому frontend в compose идёт **без** volume исходников.

Варианты:
1. После изменений frontend: `docker compose up -d --build frontend`
2. Либо локально: `cd frontend && npm run dev -- -p 3010`

## Локальная разработка без полного Docker

### Backend

```bash
cd backend
npm install
# DATABASE_URL=postgresql://postgres:postgres@localhost:5433/shastudio?schema=public
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET/PUT | `/api/profile` | Профиль |
| CRUD | `/api/experience` | Опыт работы |
| CRUD | `/api/education` | Образование |
| CRUD | `/api/courses` | Курсы |
| CRUD | `/api/projects` | Проекты |
| CRUD | `/api/blog` | Блог |
| CRUD | `/api/certificates` | Сертификаты |
| POST | `/api/chat` | AI-чат (VseLLM + контекст из БД) |

## Деплой на TimeWEB VPS

Размещайте как второй проект на том же IP через поддомен / разные порты и Nginx reverse proxy.

Пример: `deploy/nginx.shastudio.conf`

## Следующие шаги

- [x] Базовая структура с Docker
- [x] Расширенная схема опыта (HeadHunter-стиль)
- [x] AI-чат с VseLLM (`https://api.vsellm.ru/v1`)
- [x] Админ-панели: Profile, Education, Courses, Projects, Blog, Certificates, AI генерация
- [x] Публичные страницы: опыт, проекты
- [x] MCP-сервер (`mcp-server/`) для генерации разделов
- [ ] Финальная настройка деплоя на TimeWEB
