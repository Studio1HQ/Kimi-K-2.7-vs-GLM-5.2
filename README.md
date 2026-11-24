<div align="center">

<img src="https://raw.githubusercontent.com/Studio1HQ/Studio1HQ/main/assets/banners/Kimi-K-2.7-vs-GLM-5.2.webp" alt="Kimi K 2.7 vs GLM 5.2 Task API: Two model-built FastAPI task management APIs, side by side" width="100%" />

<br />
<br />

# Kimi K 2.7 vs GLM 5.2 Task API

### Two model-built FastAPI task management APIs, side by side

A model comparison: Kimi K 2.7 and GLM 5.2 were each asked to build a layered Task Management REST API with FastAPI, SQLAlchemy and JWT auth. Each result lives in its own folder.

<br />

[![Built by Studio1](https://img.shields.io/badge/Built_by_Studio1-f97316?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjAgMTYwIiBmaWxsPSJub25lIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTAgMzVDMCAxNi42ODA3IDE0LjA3NDQgMS42NDg0NCAzMiAwLjEyNjk1M1YxNDFINTEuMDUyM0M1Mi40MzA4IDEzNy4zNDQgNTQuNzQ0NiAxMzMuNjg5IDU3Ljk5MzggMTMwLjAzM0M2MS4xNDQ2IDEyNi41MDggNjQuNjg5MiAxMjMuNDQgNjguNjI3NyAxMjAuODI5QzcyLjU2NjIgMTE4LjM0OSA3Ni4zNTY5IDExNi43ODIgODAgMTE2LjEyOVY4Ni43NTQ0Qzc1LjQ3MDggODcuOTI5MiA3MS4zODQ2IDg5LjY5MTkgNjcuNzQxNSA5Mi4wNDE1QzY0IDk0LjUyMjUgNjAuNzUwOCA5Ny40NiA1Ny45OTM4IDEwMC44NTRDNTYuNTM0NSAxMDIuNzIgNTUuMjU0NSAxMDQuNjU5IDU0LjE1MzkgMTA2LjY3MVYwSDEyNUMxNDQuMzMgMCAxNjAgMTUuNjY5OSAxNjAgMzVWMTI1QzE2MCAxNDQuMzMgMTQ0LjMzIDE2MCAxMjUgMTYwSDEyNFYxOEgxMDQuOTQ4QzEwMy41NjkgMjEuNjgxNiAxMDEuMjU1IDI1LjM2MjggOTguMDA2MiAyOS4wNDQ0Qzk0Ljg1NTQgMzIuNTk0MiA5MS4zMTA4IDM1LjY4NDEgODcuMzcyMyAzOC4zMTRDODMuNDMzOCA0MC44MTIgNzkuNjQzMSA0Mi4zODk2IDc2IDQzLjA0NzRWNzIuNjMwNEM4MC41MjkyIDcxLjQ0NzMgODQuNjE1NCA2OS42NzI0IDg4LjI1ODUgNjcuMzA1N0M5MiA2NC44MDc2IDk1LjI0OTIgNjEuODQ5MSA5OC4wMDYyIDU4LjQzMDdDOTkuNDY1NSA1Ni41NTEzIDEwMC43NDUgNTQuNTk4NiAxMDEuODQ2IDUyLjU3MjNWMTYwSDM1QzE1LjY3IDE2MCAwIDE0NC4zMyAwIDEyNVYzNVoiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4K)](https://studio1hq.com)

[More examples](https://github.com/Studio1HQ) &nbsp;·&nbsp; [studio1hq.com](https://studio1hq.com)

</div>

<br />

## Overview

This repo compares two models on the same task: build a production-style Task Management REST API with FastAPI, SQLAlchemy and JWT authentication. The `GLM/` folder holds the GLM 5.2 result and the `kimi/` folder holds the Kimi K 2.7 result.

Both follow a layered design (routers, services, repositories, models) and both include a small static front end. The repo records the outputs only. It does not score them, so read the code side by side and judge for yourself.

## Features

- **JWT authentication**: register and login endpoints issue signed access tokens.
- **Task CRUD**: create, list, read, update and delete tasks, scoped to the authenticated user.
- **Ownership enforcement**: users can only reach their own tasks.
- **Layered architecture**: router, service, repository and model layers kept separate in both versions.
- **Pydantic validation**: request and response schemas for users, tasks and tokens.
- **Static web UI**: each app serves a simple HTML, CSS and JS front end.
- **Health check**: a `/health` endpoint in both.

## Tech stack

| Layer | Tool |
| --- | --- |
| Framework | [FastAPI](https://fastapi.tiangolo.com) |
| ORM | [SQLAlchemy](https://www.sqlalchemy.org) |
| Database | [PostgreSQL](https://www.postgresql.org) (kimi falls back to SQLite when `DATABASE_URL` is unset) |
| Validation | [Pydantic](https://docs.pydantic.dev) |
| Auth | JWT access tokens, password hashing with bcrypt |
| Server | [Uvicorn](https://www.uvicorn.org) |

## Getting started

### Prerequisites

- Python 3 and pip
- PostgreSQL for the default setup (the kimi version can run on SQLite without it)

### Installation

```bash
git clone https://github.com/Studio1HQ/Kimi-K-2.7-vs-GLM-5.2.git
cd Kimi-K-2.7-vs-GLM-5.2
cd GLM        # or: cd kimi
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment variables

Both versions read the same settings.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Database connection string. GLM example: `postgresql+psycopg2://postgres:postgres@localhost:5432/taskdb`. kimi defaults to `sqlite:///./task_management.db`. |
| `SECRET_KEY` | Secret used to sign JWTs. Change it for anything beyond local testing. |
| `ALGORITHM` | JWT algorithm, `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime. GLM example uses 60, kimi defaults to 30. |

In `GLM/`, copy `.env.example` to `.env` and create the database (`CREATE DATABASE taskdb;`). In `kimi/`, create a `.env` file in that folder; its README suggests `createdb task_management_db`. Tables are created automatically on startup in both.

### Run

```bash
uvicorn app.main:app --reload
```

Interactive docs are at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs). The static UI is served by the app itself.

## How it works

| | GLM (`GLM/`) | Kimi (`kimi/`) |
| --- | --- | --- |
| Auth routes | `POST /api/auth/register`, `POST /api/auth/login` | `POST /auth/register`, `POST /auth/login` |
| Task routes | `/api/tasks/` (GET, POST), `/api/tasks/{id}` (GET, PUT, DELETE) | `/tasks` (GET, POST), `/tasks/{task_id}` (GET, PUT, DELETE) |
| Health | `GET /health` | `GET /health` |
| Config | `app/core/config.py` | `app/config.py` |
| Layout | `app/api/routers`, `app/core`, `app/db`, plus a generic base repository | `app/routers`, `app/database.py`, `app/dependencies.py` |
| Extras | custom exceptions mapped to HTTP status codes | CORS open to all origins, UI mounted at `/` |

Example with the GLM routes:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user1","password":"password123"}'

curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

curl -X POST http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk and eggs","status":"pending"}'
```

For kimi, drop the `/api` prefix and register with `email` and `password`.

Each request flows from the router to a service that enforces ownership, then to a repository that talks to SQLAlchemy models. The `get_current_user` dependency decodes the bearer token and loads the user for every task route.

## Resources

- [FastAPI documentation](https://fastapi.tiangolo.com): framework reference.
- [SQLAlchemy documentation](https://docs.sqlalchemy.org): ORM reference.

<br />

---

<div align="center">

<a href="https://studio1hq.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Studio1HQ/website/main/brand/studio1-logo-on-dark.svg" />
    <img src="https://raw.githubusercontent.com/Studio1HQ/website/main/brand/studio1-logo-on-light.svg" alt="Studio1" width="160" />
  </picture>
</a>

Built by **[Studio1](https://studio1hq.com)**, the technical content and DevRel partner for devtool teams.<br />
Browse more open-source examples at [github.com/Studio1HQ](https://github.com/Studio1HQ).

[![Website](https://img.shields.io/badge/studio1hq.com-0b0807?style=for-the-badge&logo=googlechrome&logoColor=white)](https://studio1hq.com)
[![Book a call](https://img.shields.io/badge/Book_a_strategy_call-f97316?style=for-the-badge&logo=googlecalendar&logoColor=white)](https://cal.com/studio1/collab)
[![X](https://img.shields.io/badge/%40Studio1HQ-141414?style=for-the-badge&logo=x&logoColor=white)](https://x.com/Studio1HQ)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/studio1hq/)

<sub><a href="https://studio1hq.com">studio1hq.com</a> · Technical content, docs, video and DevRel for devtools</sub>

</div>
