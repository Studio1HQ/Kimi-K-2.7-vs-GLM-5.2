# Task Management REST API

A production-ready Task Management REST API built with **FastAPI**, **PostgreSQL**, and **SQLAlchemy**. It features JWT authentication, full CRUD operations for tasks, input validation via Pydantic, and a clean layered architecture.

---

## Architecture

This project follows a **layered (clean) architecture** that separates concerns into distinct layers. This makes the codebase easier to maintain, test, and scale.

```
┌─────────────────────────────────────────────────────────────┐
│                         Presentation Layer                  │
│              (FastAPI routers / API endpoints)                │
├─────────────────────────────────────────────────────────────┤
│                          Service Layer                      │
│         (Business logic, orchestration, validation)           │
├─────────────────────────────────────────────────────────────┤
│                          Repository Layer                     │
│              (Database access using SQLAlchemy ORM)           │
├─────────────────────────────────────────────────────────────┤
│                          Data Layer                           │
│              (SQLAlchemy models, Pydantic schemas)            │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Presentation** | Defines FastAPI routes, handles HTTP requests/responses, and delegates work to the service layer. |
| **Service** | Contains business logic, such as ensuring users can only access their own tasks. |
| **Repository** | Abstracts database operations (CRUD) using SQLAlchemy ORM. |
| **Data** | Defines database models (`models/`) and Pydantic validation schemas (`schemas/`). |

### Authentication Flow

1. User registers or logs in.
2. On login, a JWT access token is returned.
3. The client includes the token in the `Authorization: Bearer <token>` header.
4. FastAPI dependency `get_current_user` decodes the token and loads the user.
5. All task endpoints are scoped to the authenticated user.

---

## Project Structure

```
task-management-api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration & environment variables
│   ├── database.py          # SQLAlchemy engine, session, base
│   ├── dependencies.py      # Reusable FastAPI dependencies
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User SQLAlchemy model
│   │   └── task.py          # Task SQLAlchemy model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py          # User Pydantic schemas
│   │   └── task.py          # Task Pydantic schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication routes
│   │   └── tasks.py         # Task CRUD routes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py  # Auth business logic
│   │   └── task_service.py  # Task business logic
│   └── repositories/
│       ├── __init__.py
│       ├── user_repository.py
│       └── task_repository.py
├── requirements.txt
└── README.md
```

---

## Setup Instructions

### 1. Create a PostgreSQL database

```bash
createdb task_management_db
```

Or use any PostgreSQL client of your choice.

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/task_management_db
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Install dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Run the application

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 5. Interactive API docs

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List all tasks for the current user |
| POST | `/tasks` | Create a new task |
| GET | `/tasks/{task_id}` | Get a specific task |
| PUT | `/tasks/{task_id}` | Update a task |
| DELETE | `/tasks/{task_id}` | Delete a task |

---

## Example Usage

### Register

```bash
curl -X POST "http://127.0.0.1:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword"}'
```

### Login

```bash
curl -X POST "http://127.0.0.1:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepassword"}'
```

### Create Task

```bash
curl -X POST "http://127.0.0.1:8000/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread", "status": "pending"}'
```
