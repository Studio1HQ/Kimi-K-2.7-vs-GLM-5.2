# Task Management REST API

A production-style REST API for managing tasks, built with **FastAPI**, **PostgreSQL**, **SQLAlchemy**, and **JWT authentication**.

## Architecture

The project follows a **layered architecture** to separate concerns:

```
HTTP Request
    │
    ▼
┌──────────────┐   Pydantic validation, dependency injection
│  API Layer   │   (app/api/routers)
└──────┬───────┘
       │
       ▼
┌──────────────┐   Business logic, ownership enforcement
│ Service Layer│   (app/services)
└──────┬───────┘
       │
       ▼
┌──────────────────┐  Data access abstraction
│ Repository Layer │  (app/repositories)
└──────┬───────────┘
       │
       ▼
┌──────────────┐   SQLAlchemy ORM models
│ Model Layer  │   (app/models)
└──────┬───────┘
       │
       ▼
   PostgreSQL
```

- **Core** (`app/core`): configuration, JWT/password security, custom exceptions & handlers.
- **DB** (`app/db`): engine, session factory, declarative base.
- **Schemas** (`app/schemas`): Pydantic models for request/response validation.

## Project Structure

```
GLM/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI app, routers, exception handlers
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Settings from env vars
│   │   ├── security.py          # Password hashing + JWT
│   │   └── exceptions.py        # Custom errors + handlers
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py              # DeclarativeBase
│   │   └── session.py           # Engine + get_db dependency
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # User ORM model
│   │   └── task.py              # Task ORM model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py              # UserCreate, UserLogin, UserOut
│   │   ├── task.py              # TaskCreate, TaskUpdate, TaskOut
│   │   └── token.py             # Token, TokenData
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py              # Generic CRUD repository
│   │   ├── user_repository.py
│   │   └── task_repository.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py      # Register, login, token
│   │   └── task_service.py      # Task CRUD business logic
│   └── api/
│       ├── __init__.py
│       ├── deps.py              # get_current_user, OAuth2 scheme
│       └── routers/
│           ├── __init__.py
│           ├── auth.py          # /api/auth/register, /api/auth/login
│           └── tasks.py         # /api/tasks CRUD
├── requirements.txt
├── .env.example
└── README.md
```

## Setup

### 1. Install dependencies

```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Create the database

```sql
CREATE DATABASE taskdb;
```

Tables are created automatically on startup.

### 4. Run the server

```bash
uvicorn app.main:app --reload
```

Visit the interactive docs at **http://localhost:8000/docs**.

## API Endpoints

| Method | Path                    | Description              | Auth |
|--------|-------------------------|--------------------------|------|
| POST   | `/api/auth/register`    | Register a new user      | No   |
| POST   | `/api/auth/login`       | Login, get JWT token     | No   |
| GET    | `/api/tasks/`           | List your tasks          | Yes  |
| POST   | `/api/tasks/`           | Create a task            | Yes  |
| GET    | `/api/tasks/{id}`       | Get a task by ID         | Yes  |
| PUT    | `/api/tasks/{id}`       | Update a task            | Yes  |
| DELETE | `/api/tasks/{id}`       | Delete a task            | Yes  |
| GET    | `/health`               | Health check             | No   |

## Example Usage

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user1","password":"password123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create a task (replace TOKEN)
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk and eggs","status":"pending"}'

# List tasks
curl http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer TOKEN"
```

## Key Features

- **JWT Authentication** — OAuth2 password flow with signed access tokens.
- **Input Validation** — Pydantic v2 schemas enforce field constraints.
- **SQLAlchemy ORM** — Type-safe model definitions with relationships.
- **Layered Architecture** — Clean separation: API → Service → Repository → Model.
- **Ownership Enforcement** — Users can only access their own tasks.
- **Error Handling** — Custom exceptions mapped to proper HTTP status codes.
- **Generic Repository** — Reusable CRUD base class reduces boilerplate.