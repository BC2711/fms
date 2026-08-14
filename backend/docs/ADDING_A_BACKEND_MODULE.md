# Adding a Backend Module

This guide explains how to add a database-backed module to the FMS API. The preferred approach is the configuration-driven CRUD framework: define a SQLAlchemy model, define Pydantic schemas, and register one `ResourceConfig`. The application then generates authenticated CRUD endpoints with pagination, search, filtering, sorting, audit logging, and soft deletion.

The examples below add a `depots` module at `/api/depots`.

## 1. Decide whether generated CRUD is suitable

Use a generated resource when the module mainly needs:

- list, view, create, update, and delete operations;
- standard permission checks;
- text search, exact-match filters, and sorting;
- audit logging and soft deletion.

Use a custom router and service as well when the module has workflow operations such as approval, stock transfer, payment, balance mutation, or reporting. Keep the basic CRUD endpoints generated and put business rules in a dedicated service where practical.

## 2. Add the SQLAlchemy model

Add the model to `app/models/resources.py`, or create a separate model file for a larger module.

```python
from typing import Any

from sqlalchemy import JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import ResourceMixin


class Depot(ResourceMixin, Base):
    __tablename__ = "depots"

    name: Mapped[str] = mapped_column(String(160), index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    province: Mapped[str] = mapped_column(String(80), index=True)
    address: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
```

`ResourceMixin` supplies `id`, `status`, timestamps, actor IDs, and `deleted_at`. Generated delete operations set `deleted_at`; they do not physically remove the row.

If the model is in a new file, export it from `app/models/__init__.py`. Alembic imports `app.models`, so an unimported model will not be detected:

```python
from app.models.depots import Depot

__all__ = [
    # existing exports...
    "Depot",
]
```

Use real database columns for fields that must be indexed, constrained, joined, searched, or sorted. The optional `details` JSON column is useful for flexible secondary fields. Values stored in JSON must be JSON-compatible.

## 3. Add request and response schemas

Add schemas to `app/schemas/resources.py`, or use a module-specific schema file and import from it later.

```python
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.common import ResourceResponse


class DepotCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    code: str = Field(min_length=2, max_length=40)
    province: str = Field(min_length=2, max_length=80)
    address: str = ""
    status: str = "active"
    details: dict[str, Any] = Field(default_factory=dict)


class DepotUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    code: str | None = Field(default=None, min_length=2, max_length=40)
    province: str | None = Field(default=None, min_length=2, max_length=80)
    address: str | None = None
    status: str | None = None
    details: dict[str, Any] | None = None


class DepotResponse(ResourceResponse):
    name: str
    code: str
    province: str
    address: str
```

Important schema rules:

- Create fields should match required model fields and database defaults.
- Update fields should normally be optional because updates are partial.
- Response schemas must inherit `ResourceResponse` and include every field the API should expose.
- Do not accept ownership or audit fields such as `created_by`; the CRUD service supplies them.
- Use constrained Pydantic types and `Field` validation at the API boundary.

## 4. Register the resource

Import the model and schemas in `app/configuration/resources.py`, then add a configuration entry to `OTHER_RESOURCES` or to a new logical resource group.

```python
ResourceConfig(
    name="depots",
    model=Depot,
    create_schema=DepotCreate,
    update_schema=DepotUpdate,
    response_schema=DepotResponse,
    route_prefix="/depots",
    permissions=permissions("depots"),
    searchable_fields=("name", "code", "address"),
    filterable_fields=("status", "province"),
    sortable_fields=("name", "code", "province", "created_at"),
)
```

Make sure the entry is included in the final `RESOURCES` list. No manual router registration is required: `app/api/router.py` generates and includes a router for every entry in `RESOURCES`.

`ResourceConfig` options are:

| Option | Purpose |
| --- | --- |
| `name` | Resource name used in tags, messages, audit records, and default permissions. |
| `model` | SQLAlchemy model. |
| `create_schema` | POST request schema. |
| `update_schema` | PUT request schema. |
| `response_schema` | Response serialization schema. |
| `route_prefix` | Path below the configured `/api` prefix. |
| `permissions` | Permission code for each operation. |
| `searchable_fields` | Model text columns included in case-insensitive search. |
| `filterable_fields` | Allowed exact-match query parameters. |
| `sortable_fields` | Allowed `sortBy` values; the first is the fallback sort. |
| `allowed_operations` | Optional subset of `list`, `view`, `create`, `update`, and `delete`. |
| `fixed_values` | Values forced on every query and create, useful for subtypes sharing a table. |

Only put actual model attributes in `searchable_fields` and `sortable_fields`. Filters may also target keys in a model's `details` JSON field.

For a read-only resource:

```python
allowed_operations=frozenset({"list", "view"})
```

## 5. Create and review the migration

From the `backend` directory, with the intended database configured:

```powershell
.\.venv\Scripts\python.exe -m alembic revision --autogenerate -m "add depots module"
```

Open the generated file under `alembic/versions/` and verify:

- the new table and all columns are present;
- nullability and defaults are correct;
- unique constraints, indexes, and foreign keys are correct;
- `downgrade()` safely reverses `upgrade()`.

Apply it:

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
```

Never rely on automatic table creation for a deployed database. Commit the reviewed migration with the model change.

## 6. Seed permissions

Generated permission codes come from `RESOURCES`. With `permissions("depots")`, the codes are:

```text
depots.view
depots.create
depots.update
depots.delete
```

The list operation also uses `depots.view`. Run the idempotent seed command after registering the resource:

```powershell
.\.venv\Scripts\python.exe -m app.utilities.seed_cli
```

The development superuser bypasses permission checks. To validate authorization properly, also test with a non-superuser role that has only the required permission codes.

## 7. Add API tests

Add an end-to-end test in `tests/test_api.py`. At minimum, cover create, list/search/filter, view, update, soft delete, and permissions.

```python
def test_depots_crud(client, auth_headers):
    created = client.post(
        "/api/depots",
        headers=auth_headers,
        json={
            "name": "Lusaka Depot",
            "code": "LSK-DEPOT",
            "province": "Lusaka",
            "address": "Industrial Area",
        },
    )
    assert created.status_code == 201
    depot_id = created.json()["data"]["id"]

    listing = client.get(
        "/api/depots?search=Lusaka&province=Lusaka&sortBy=name",
        headers=auth_headers,
    )
    assert listing.status_code == 200
    assert listing.json()["data"]["total"] == 1

    viewed = client.get(f"/api/depots/{depot_id}", headers=auth_headers)
    assert viewed.status_code == 200

    updated = client.put(
        f"/api/depots/{depot_id}",
        headers=auth_headers,
        json={"status": "inactive"},
    )
    assert updated.status_code == 200

    deleted = client.delete(f"/api/depots/{depot_id}", headers=auth_headers)
    assert deleted.status_code == 200
    assert client.get(f"/api/depots/{depot_id}", headers=auth_headers).status_code == 404
```

Run the complete backend suite:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

## 8. Verify the generated API

Start the application and open `/api/docs`. The module should expose the operations allowed by its configuration:

```text
GET    /api/depots
GET    /api/depots/{item_id}
POST   /api/depots
PUT    /api/depots/{item_id}
DELETE /api/depots/{item_id}
```

List endpoints accept:

- `page` and `pageSize` for pagination;
- `search` or `q` for text search;
- configured filter fields as query parameters;
- `sortBy` and `sortDirection` (`asc` or `desc`) for ordering.

Check that create/update operations produce rows in `audit_logs`, deleted records disappear from generated reads, duplicate constraints return a conflict response, and unauthorized users receive `403`.

## 9. Add custom workflows when needed

Generated CRUD should not contain domain workflows. For an operation such as depot stock transfer:

1. Create `app/services/depots.py` for validation, calculations, and transactional database changes.
2. Create `app/api/routes/depots.py` for the HTTP endpoint and request schema.
3. Protect it with `require_permission("depots.update")` or a more specific seeded permission.
4. Include its router in `app/api/router.py`.
5. Add success, validation, permission, conflict, and rollback tests.

Example route registration:

```python
from app.api.routes.depots import router as depots_router

api_router.include_router(depots_router)
```

Keep commits atomic: perform related writes and audit creation in one SQLAlchemy transaction, roll back on failure, and do not commit midway through a workflow.

## Completion checklist

- [ ] Model inherits `ResourceMixin` and is visible to Alembic.
- [ ] Create, update, and response schemas match the database contract.
- [ ] `ResourceConfig` is included in `RESOURCES`.
- [ ] Search, filter, and sort fields are valid and intentionally exposed.
- [ ] Migration was generated, reviewed, and applied.
- [ ] Permission codes were seeded and assigned to appropriate roles.
- [ ] CRUD, validation, uniqueness, permission, audit, and soft-delete behavior is tested.
- [ ] Custom business operations live in a service and dedicated route.
- [ ] The full test suite passes and endpoints appear in `/api/docs`.
