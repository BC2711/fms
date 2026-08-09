# Fuel Management System: Frontend and Backend Guide

This document explains how the Fuel Management System (FMS) is structured, how a browser request moves through the React frontend and FastAPI backend, and how developers can add or change modules safely.

## 1. Technology stack

### Frontend

- React 19 and TypeScript
- Vite
- React Router
- TanStack Query for server state
- TanStack Table for data tables
- React Hook Form and Zod
- Zustand for authentication state
- Axios for HTTP requests
- Tailwind CSS

### Backend

- FastAPI
- PostgreSQL
- SQLAlchemy 2
- Pydantic 2
- Alembic
- JWT bearer authentication
- Argon2 password hashing

## 2. Repository layout

```text
fms/
├── backend/
│   ├── alembic/                 Database migrations
│   ├── app/
│   │   ├── api/routes/          Dedicated and generated API routes
│   │   ├── configuration/       ResourceConfig declarations
│   │   ├── core/                Settings, security and errors
│   │   ├── database/            Engine, sessions and base classes
│   │   ├── models/              SQLAlchemy models
│   │   ├── permissions/         Authentication and permission dependencies
│   │   ├── repositories/        Reusable database queries
│   │   ├── schemas/             Pydantic request/response schemas
│   │   ├── services/            CRUD and business-critical logic
│   │   └── utilities/           Seed and database bootstrap commands
│   └── tests/
└── frontend/
    ├── docs/
    └── src/
        ├── app/                  Application and route composition
        ├── auth/                 Session store and authorization
        ├── components/           Reusable UI controls
        ├── config/               Menus and page configurations
        ├── framework/            Page, list, form and detail generators
        ├── hooks/                Dynamic query/mutation hooks
        ├── services/             API client, mappings and endpoint resolver
        └── tests/
```

## 3. Running the system locally

### Backend setup

From `backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt -r requirements-dev.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m app.utilities.bootstrap_database
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m app.utilities.seed_cli
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The default configuration expects PostgreSQL at:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/fms
```

Important environment variables use the `FMS_` prefix:

```text
FMS_DATABASE_URL
FMS_JWT_SECRET
FMS_CORS_ORIGINS
FMS_AUTO_CREATE_TABLES
FMS_SEED_ON_STARTUP
```

Use a strong, private `FMS_JWT_SECRET` in production. Prefer Alembic migrations over `AUTO_CREATE_TABLES` outside disposable development environments.

Backend URLs:

- API: `http://127.0.0.1:8000/api`
- Swagger: `http://127.0.0.1:8000/api/docs`
- ReDoc: `http://127.0.0.1:8000/api/redoc`
- Health: `http://127.0.0.1:8000/api/health`

Seeded local administrator:

```text
Email: admin@fms.example.com
Password: ChangeMe123!
```

Change this password for any shared or deployed environment.

### Frontend setup

From `frontend`:

```powershell
npm install
npm run dev
```

The API client uses `VITE_API_URL` when it is configured and `/api` otherwise:

```text
VITE_API_URL=http://127.0.0.1:8000/api
```

## 4. End-to-end request flow

For a station list page, the flow is:

```text
Menu / route
  → page-registry.ts
  → PageGenerator
  → ListPageGenerator
  → useDynamicQuery
  → endpoint-resolver
  → Axios API client
  → GET /api/stations
  → JWT dependency and permission check
  → generated FastAPI router
  → CRUDService
  → BaseRepository
  → SQLAlchemy / PostgreSQL
  → standard response envelope
  → response mapper
  → statistics, filters and table UI
```

The frontend does not need a hand-written React page for every CRUD resource. A validated page configuration describes the API, table, filters, form, details view and actions. Shared generators render that configuration.

## 5. Backend architecture

### Application startup

`backend/app/main.py` creates FastAPI, installs CORS and centralized error handlers, and mounts the API router under `/api`.

Database sessions come from `get_db()`. Each request receives a SQLAlchemy session that is closed at the end of the request.

### Models and common fields

Resources using `ResourceMixin` receive:

```text
id
created_at
updated_at
created_by
updated_by
status
deleted_at
```

`deleted_at` implements soft deletion. Repository queries exclude deleted records by default.

Dedicated domain models include users, roles, permissions, accounts, stations, station types, groups, price boards, inspections, performance and documents. `GenericRecord` stores configuration-driven resources that do not yet require dedicated business models.

### Configuration-driven CRUD

A reusable resource is declared in `backend/app/configuration/resources.py`:

```python
ResourceConfig(
    name="stations",
    model=Station,
    create_schema=StationCreate,
    update_schema=StationUpdate,
    response_schema=StationResponse,
    route_prefix="/stations",
    permissions={
        "list": "stations.view",
        "view": "stations.view",
        "create": "stations.create",
        "update": "stations.update",
        "delete": "stations.delete",
    },
    searchable_fields=("name", "code"),
    filterable_fields=("status", "province_id"),
    sortable_fields=("name", "created_at"),
)
```

`generate_crud_router()` turns this declaration into:

```text
GET    /api/stations
GET    /api/stations/{id}
POST   /api/stations
PUT    /api/stations/{id}
DELETE /api/stations/{id}
```

List parameters use:

```text
page=1
pageSize=10
search=query
sortBy=name
sortDirection=asc
status=active
```

### Generic resources

Generated menu modules use the authenticated generic resource route when a dedicated model is unnecessary. Records are separated by `resource_path`, stored in PostgreSQL, audited and soft-deleted.

Dedicated routes are registered before the generic catch-all. Therefore an explicit account or station endpoint always takes precedence.

### Business services

Business-critical state changes should not be implemented as arbitrary generic CRUD. For example, account balance adjustments use a dedicated endpoint and service:

```text
POST /api/accounts/{id}/balance-adjustments
```

The service validates the operation, locks the account row, prevents an invalid debit and creates an audit record.

The same pattern should be used for payments, transactions, approvals, reconciliation and performance calculations.

## 6. Authentication and permissions

### Login

The frontend sends:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@fms.example.com",
  "password": "ChangeMe123!"
}
```

The backend verifies the Argon2 password and returns a JWT, user details and permission codes.

The frontend stores the session through the authentication store and adds this header to subsequent requests:

```http
Authorization: Bearer <token>
```

On application startup, `/api/auth/me` restores and validates the current session. A missing or expired session redirects the user to login. A `401` response also clears the local session.

### Authorization

Permissions use resource-operation names:

```text
accounts.view
accounts.create
accounts.update
accounts.delete
stations.view
settings.update
administration.roles.create
```

Backend dependencies provide the final security boundary. Frontend page permissions hide inaccessible pages and actions, but backend permission checks must never be removed.

## 7. API response contract

All successful endpoints return:

```json
{
  "success": true,
  "message": "Stations retrieved successfully",
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "pageSize": 10,
    "statistics": {
      "total": 0,
      "active": 0
    }
  }
}
```

Details and mutation responses use the same envelope, with the resource under `data`.

Centralized exception handlers convert validation, permission, missing-record and business errors into consistent JSON responses. Typical status codes are:

```text
400 Invalid request
401 Missing or invalid login
403 Missing permission
404 Resource not found
409 Business conflict
422 Schema validation failure
500 Unexpected server failure
```

## 8. Frontend configuration system

### Page registry

`frontend/src/config/page-registry.ts` is the source of page lookup. It registers dedicated configurations and generated menu pages, including nested create, details and edit routes.

`PageGenerator` validates the configuration in development, verifies authentication and permissions, and selects one of:

- `DashboardGenerator`
- `ListPageGenerator`
- `FormPageGenerator`
- `DetailsGenerator`

### API configuration

A page connects to the backend using:

```typescript
api: {
  baseUrl: '/api',
  data_mapping: {
    type: 'paginated',
    items: 'data.items',
    total: 'data.total',
    page: 'data.page',
    pageSize: 'data.pageSize',
  },
  endpoints: {
    list: { path: '/stations', method: 'GET' },
    item: { path: '/stations/{id}', method: 'GET' },
    create: { path: '/stations', method: 'POST' },
    update: { path: '/stations/{id}', method: 'PUT' },
    delete: { path: '/stations/{id}', method: 'DELETE' },
  },
}
```

UI routes use React Router parameters such as `:id`. API endpoints use placeholders such as `{id}`. The endpoint resolver replaces API placeholders with current route values.

### Lists

List configuration controls:

- Table columns and nested accessors
- Row actions
- Search and filters
- Server-side sorting
- Pagination
- Statistics
- Empty, loading and error states

An accessor such as `station_type.name` requires the backend response to include the nested object:

```json
{
  "station_type": {
    "id": 1,
    "name": "Retail Station"
  }
}
```

### Forms

Form configuration defines field names, types, validation, layout and options. Field names must match Pydantic request fields or supported flexible detail fields.

API-backed selections use:

```typescript
{
  name: 'station_id',
  type: 'select',
  label: 'Station',
  options: [],
  options_endpoint: '/stations',
  option_label: 'name',
  option_value: 'id',
}
```

The dynamic select fetches up to 100 sorted options and displays loading or API failure state.

File inputs are converted to data URLs before JSON submission. Station document storage currently supports this mechanism. For large files or production object storage, replace it with multipart uploads and signed download URLs.

## 9. Adding a new dedicated module

### Backend

1. Add the SQLAlchemy model under `app/models`.
2. Import it from `app/models/__init__.py`.
3. Add create, update and response Pydantic schemas.
4. Define its `ResourceConfig`.
5. Add permissions to seed data if they are not generated through the config.
6. Create an Alembic migration.
7. Add API tests for CRUD, filters, permissions and important business rules.

Commands:

```powershell
.\.venv\Scripts\python.exe -m alembic revision --autogenerate -m "add new resource"
.\.venv\Scripts\python.exe -m alembic upgrade head
```

Review autogenerated migrations before applying them.

### Frontend

1. Create a configuration under `src/config/modules`.
2. Define list, details, create and edit endpoints.
3. Match form field names to the backend schemas.
4. Match table/detail accessors to response fields.
5. Add dynamic option endpoints for foreign keys.
6. Register the root page in `page-registry.ts`.
7. Add the menu item if it does not exist.
8. Run configuration contracts and the production build.

## 10. Testing and verification

Backend:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -q
```

Frontend:

```powershell
cd frontend
npm run test
npm run build
```

The frontend connectivity contract checks CRUD endpoint shapes, route parameters, generated backend coverage, dropdown options and file configurations.

Before declaring a module complete, verify:

- List, details, create, update and delete
- Search, filters, sorting and pagination
- Statistics and response mappings
- Dynamic `{id}` parameters
- Select option APIs
- Authentication and every permission level
- Loading, failure, empty and success states
- Audit logs and soft deletion
- OpenAPI documentation

## 11. Troubleshooting

### Login returns `500` and PostgreSQL says database does not exist

```powershell
cd backend
.\.venv\Scripts\python.exe -m app.utilities.bootstrap_database
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m app.utilities.seed_cli
```

### Login returns `401`

- Confirm the email and password.
- Confirm seed data ran.
- Confirm the user is active and not soft-deleted.
- Confirm frontend and backend use the same environment.

### A page returns `403`

The JWT is valid, but the user lacks the required permission. Assign the permission to a role and the role to the user, then log in again to obtain a token with current claims.

### A page is empty even though the API returns records

Check `api.data_mapping` and table accessors. The standard list path is `data.items`; nested column accessors must exist in each returned item.

### A form returns `422`

Compare the submitted JSON field names and types with the endpoint's Pydantic schema in Swagger. Pay particular attention to required fields, dates, numbers and foreign-key IDs.

### Frontend requests the wrong server

Check `VITE_API_URL`, the Vite proxy configuration and the browser network request. The Axios client defaults to `/api`.

## 12. Production considerations

Before production deployment:

- Replace default PostgreSQL credentials.
- Set a strong JWT secret.
- Change the seeded administrator password.
- Restrict CORS to real frontend origins.
- Run migrations as a deployment step.
- Use HTTPS.
- Store uploaded files in managed object storage.
- Store integration secrets in a secret manager, not ordinary setting records.
- Add database backups and restore testing.
- Add rate limiting, monitoring and structured logs.
- Disable development tokens and automatic seed behavior.
