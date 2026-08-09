# Fuel Management System API

FastAPI, SQLAlchemy 2, Pydantic 2, PostgreSQL, Alembic, and JWT backend with configuration-generated CRUD routes.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt -r requirements-dev.txt
Copy-Item .env.example .env
python -m app.utilities.bootstrap_database
alembic upgrade head
fastapi dev app/main.py
```

Set `FMS_SEED_ON_STARTUP=true` once for local bootstrap, or run `python -m app.utilities.seed_cli`. The initial administrator is `admin@fms.example.com` / `ChangeMe123!`; change it immediately outside local development.

API documentation is available at `/api/docs` and `/api/redoc`.

## Adding a resource

Define its SQLAlchemy model, create/update/response Pydantic schemas, then add a `ResourceConfig` to `app/configuration/resources.py`. The router factory supplies permission-protected list, view, create, update, delete, pagination, search, filtering, sorting, audit logging, and soft deletion.

Business workflows such as balance mutation, payments, approvals, and performance calculation belong in dedicated services rather than generated CRUD.
