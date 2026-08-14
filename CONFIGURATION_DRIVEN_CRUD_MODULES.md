# Adding a Configuration-Driven CRUD Module

This guide shows how to add a complete database-backed CRUD module to FMS. It covers the backend model, schemas, generated API, migration, permissions, frontend-generated pages, navigation, and tests.

The worked example adds a **Depots** module with these screens and endpoints:

| Capability | Frontend route | API endpoint |
| --- | --- | --- |
| List/search/filter | `/depots` | `GET /api/depots` |
| Create | `/depots/create` | `POST /api/depots` |
| View | `/depots/:id` | `GET /api/depots/{id}` |
| Edit | `/depots/:id/edit` | `PUT /api/depots/{id}` |
| Delete | List/details action | `DELETE /api/depots/{id}` |

The framework supplies pagination, search, filters, sorting, authentication, permission checks, audit records, and soft deletion. Use it for conventional CRUD. Add a custom service and route for workflows such as approvals, transfers, balance changes, or multi-record transactions.

## 1. Understand the generation flow

```text
Backend
SQLAlchemy model + Pydantic schemas
              -> ResourceConfig in RESOURCES
              -> generate_crud_router(...)
              -> /api/depots endpoints

Frontend
PageConfig (list + create/details/edit sub-pages)
              -> pageRegistry
              -> RouteGenerator / PageGenerator
              -> generated routes, table, forms, and actions

Navigation
menu.config.ts -> generated navigation -> /depots
```

No dedicated React component or FastAPI CRUD router is required for an ordinary module.

## 2. Files involved

Files marked **add/edit** are normally changed for every new module. The others are framework files to understand, not usually modify.

| File | Action | Purpose |
| --- | --- | --- |
| `backend/app/models/resources.py` | Add/edit | SQLAlchemy table model. A large domain may use a new model file instead. |
| `backend/app/models/__init__.py` | Edit if model is in a new file | Makes the model visible to Alembic metadata imports. |
| `backend/app/schemas/resources.py` | Add/edit | Pydantic create, update, and response contracts. A large domain may use a new schema file. |
| `backend/app/configuration/resources.py` | Edit | Registers the model, schemas, route, permissions, search, filters, and sorting. |
| `backend/app/configuration/resource.py` | Reference | Defines all `ResourceConfig` options. |
| `backend/app/api/router_factory.py` | Reference | Generates the five standard endpoints. |
| `backend/app/services/crud.py` | Reference | Implements generated create/read/update/delete and audit behavior. |
| `backend/app/repositories/base.py` | Reference | Implements database listing, filtering, sorting, and statistics. |
| `backend/alembic/versions/<revision>.py` | Add | Versioned database migration. |
| `backend/tests/test_api.py` | Edit | Backend integration and permission tests. |
| `frontend/src/config/modules/depots.config.ts` | Add | Complete generated UI module. |
| `frontend/src/config/page-registry.ts` | Edit | Registers all four page IDs. |
| `frontend/src/config/menu.config.ts` | Edit | Adds the module to navigation. |
| `frontend/src/tests/depots-module.test.tsx` | Add | Validates configuration, routes, rendering, and API behavior. |
| `frontend/src/types/configuration.types.ts` | Reference | TypeScript configuration contract. |
| `frontend/src/framework/schemas/page.schema.ts` | Reference | Runtime Zod validation contract. |

## 3. Choose one naming contract

Define these values before editing files and reuse them exactly:

| Concept | Depot value |
| --- | --- |
| Python class | `Depot` |
| Database table | `depots` |
| Backend resource name | `depots` |
| API resource path | `/depots` |
| Frontend root ID | `depots` |
| Frontend browser path | `/depots` |
| Permission prefix | `depots` |

The resulting permissions are `depots.view`, `depots.create`, `depots.update`, and `depots.delete`. The list endpoint also uses `depots.view`. Do not use a frontend alias such as `depots.edit` when the backend generates `depots.update`.

## 4. Add the database model

Add the model to `backend/app/models/resources.py`:

```python
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import ResourceMixin


class Depot(ResourceMixin, Base):
    __tablename__ = "depots"

    name: Mapped[str] = mapped_column(String(160), index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    province: Mapped[str] = mapped_column(String(80), index=True)
    address: Mapped[str] = mapped_column(Text, default="")
```

`ResourceMixin` adds:

- `id`;
- `status`;
- `created_at` and `updated_at`;
- `created_by` and `updated_by`;
- `deleted_at` for soft deletion.

Use ordinary columns for values that require constraints, indexes, relationships, search, or sorting. A `details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)` column is suitable for flexible secondary data, but not for core relational data.

If the model is placed in a new `backend/app/models/depots.py` file, import and export it in `backend/app/models/__init__.py`:

```python
from app.models.depots import Depot

__all__ = [
    # existing names...
    "Depot",
]
```

This import is essential because Alembic loads `app.models` to discover tables.

## 5. Add the API schemas

Add these schemas to `backend/app/schemas/resources.py`:

```python
from pydantic import BaseModel, Field

from app.schemas.common import ResourceResponse


class DepotCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    code: str = Field(min_length=2, max_length=40)
    province: str = Field(min_length=2, max_length=80)
    address: str = ""
    status: str = "active"


class DepotUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    code: str | None = Field(default=None, min_length=2, max_length=40)
    province: str | None = Field(default=None, min_length=2, max_length=80)
    address: str | None = None
    status: str | None = None


class DepotResponse(ResourceResponse):
    name: str
    code: str
    province: str
    address: str
```

Rules to follow:

- Required create fields must match non-null model columns that have no database/application default.
- Update fields should be optional so `PUT` can perform the partial updates supported by the CRUD service.
- The response inherits `ResourceResponse`, which exposes common IDs, status, timestamps, actor IDs, and `details`.
- Never accept `created_by`, `updated_by`, timestamps, or `deleted_at` from the client.
- Keep validation limits aligned across the model, Pydantic schema, and frontend form. In this example `code` is 40 characters everywhere.

## 6. Register the generated backend resource

In `backend/app/configuration/resources.py`:

1. Import `Depot` from the model module.
2. Import `DepotCreate`, `DepotUpdate`, and `DepotResponse`.
3. Add the following entry to `OTHER_RESOURCES` (or a new domain-specific group):

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
),
```

Ensure the group is included in the final `RESOURCES` list. `backend/app/api/router.py` loops through that list and calls `generate_crud_router`, so do not register another CRUD router manually.

### ResourceConfig reference

| Setting | Meaning |
| --- | --- |
| `name` | Used in OpenAPI tags, messages, audits, and default permission names. |
| `model` | SQLAlchemy model queried by the generic repository. |
| `create_schema` | Validates `POST` bodies. |
| `update_schema` | Validates `PUT` bodies. |
| `response_schema` | Serializes records returned to clients. |
| `route_prefix` | Path below the application's `/api` prefix. |
| `permissions` | Maps each operation to a permission code. |
| `searchable_fields` | Text model columns searched by `search` or `q`. |
| `filterable_fields` | Exact-match query parameters accepted by the list endpoint. |
| `sortable_fields` | Allowed `sortBy` values. The first entry is the repository fallback. |
| `allowed_operations` | Optional subset of `list`, `view`, `create`, `update`, and `delete`. |
| `fixed_values` | Values forced into queries and creates; useful when multiple resources share one table. |

Only expose real model attributes as searchable/sortable fields. Filter fields may also reference keys stored in a model's `details` JSON object.

For a read-only resource:

```python
allowed_operations=frozenset({"list", "view"})
```

For typed views over one shared table, follow the account module pattern:

```python
fixed_values={"account_type": "depot_operator"}
```

## 7. Generate and apply the migration

From `backend`, using the database configured for the target environment:

```powershell
.\.venv\Scripts\python.exe -m alembic revision --autogenerate -m "add depots module"
```

Review the new file in `backend/alembic/versions/`. Confirm table name, types, nullability, defaults, indexes, unique constraints, foreign keys, and the reverse operations in `downgrade()`.

Apply it:

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
```

Do not rely on runtime table creation for deployed databases. Commit the reviewed migration with the model.

## 8. Seed and assign permissions

From `backend`, run the idempotent permission/database seed:

```powershell
.\.venv\Scripts\python.exe -m app.utilities.seed_cli
```

Assign the new permission codes to the appropriate non-superuser roles:

```text
depots.view
depots.create
depots.update
depots.delete
```

A development superuser bypasses permission checks, so permission testing must include a normal user.

## 9. Verify the backend contract

The registration produces:

```text
GET    /api/depots
GET    /api/depots/{item_id}
POST   /api/depots
PUT    /api/depots/{item_id}
DELETE /api/depots/{item_id}
```

List parameters are:

```text
page=1
pageSize=10
search=Lusaka       # q is also accepted
status=active       # configured exact filter
province=Lusaka     # configured exact filter
sortBy=name
sortDirection=asc   # asc or desc
```

The list response shape expected by the frontend is:

```json
{
  "success": true,
  "message": "Depots retrieved successfully",
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "pageSize": 10,
    "active": 0,
    "inactive": 0,
    "statistics": {}
  }
}
```

Open `/api/docs` while the backend is running and confirm all configured operations appear.

## 10. Create the frontend module configuration

Create `frontend/src/config/modules/depots.config.ts`. A CRUD module has one list page and three nested sub-pages. The example below is deliberately complete but compact:

```ts
import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { ApiConfig, FormConfig, PageConfig } from '@/types/configuration.types'

const api: ApiConfig = {
  baseUrl: '/api',
  data_mapping: {
    type: 'paginated',
    items: 'data.items',
    total: 'data.total',
    page: 'data.page',
    pageSize: 'data.pageSize',
  },
  endpoints: {
    list: { path: '/depots', method: 'GET' },
    item: { path: '/depots/{id}', method: 'GET', responseMappingPath: 'data' },
    create: { path: '/depots', method: 'POST', responseMappingPath: 'data' },
    update: { path: '/depots/{id}', method: 'PUT', responseMappingPath: 'data' },
    delete: { path: '/depots/{id}', method: 'DELETE' },
  },
}

const form: FormConfig = {
  cancelPath: '/depots',
  resetEnabled: true,
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true,
      validation: { min_length: 2, max_length: 160 } },
    { name: 'code', type: 'text', label: 'Code', required: true,
      validation: { min_length: 2, max_length: 40 } },
    { name: 'province', type: 'select', label: 'Province', required: true,
      options: [
        { label: 'Lusaka', value: 'Lusaka' },
        { label: 'Copperbelt', value: 'Copperbelt' },
        { label: 'Southern', value: 'Southern' },
      ] },
    { name: 'status', type: 'select', label: 'Status', required: true,
      default_value: 'active', options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ] },
    { name: 'address', type: 'textarea', label: 'Address', rows: 4 },
  ],
}

const raw: PageConfig = {
  id: 'depots',
  title: 'Depots',
  page_title: 'Depots',
  description: 'Manage fuel storage depots.',
  type: 'list',
  page_type: 'list',
  path: '/depots',
  route: '/depots',
  authentication: { required: true },
  permissions: { any: ['depots.view'] },
  api,
  statistics: [
    { id: 'total-depots', type: 'statistic', title: 'Total Depots', dataPath: 'total', icon: 'Warehouse' },
    { id: 'active-depots', type: 'statistic', title: 'Active', dataPath: 'active', icon: 'CircleCheck' },
  ],
  filters: [
    { id: 'search', type: 'search', label: 'Search', field: 'search',
      query_parameter: 'search', placeholder: 'Search depots' },
    { id: 'status', type: 'select', label: 'Status', field: 'status',
      query_parameter: 'status', options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ] },
  ],
  table: {
    rowKey: 'id',
    stickyHeader: true,
    striped: true,
    pagination: { enabled: true, pageSize: 10, pageSizeOptions: [10, 20, 50] },
    sorting: { enabled: true, defaultColumn: 'name', defaultDirection: 'asc' },
    columns: [
      { id: 'code', type: 'text', header: 'Code', accessor: 'code', sortable: true },
      { id: 'name', type: 'text', header: 'Name', accessor: 'name', sortable: true, searchable: true },
      { id: 'province', type: 'text', header: 'Province', accessor: 'province', sortable: true },
      { id: 'status', type: 'badge', header: 'Status', accessor: 'status', sortable: true,
        options: { active: 'success', inactive: 'danger' } },
      { id: 'created-at', type: 'datetime', header: 'Created', accessor: 'created_at', sortable: true },
      { id: 'actions', type: 'actions', header: 'Actions', actions: [
        { id: 'view', type: 'navigate', label: 'View', icon: 'Eye' },
        { id: 'edit', type: 'edit', label: 'Edit', icon: 'Pencil',
          permission: { any: ['depots.update'] } },
        { id: 'delete', type: 'delete', label: 'Delete', icon: 'Trash2',
          endpoint: '/api/depots/{id}', permission: { any: ['depots.delete'] },
          requires_confirmation: true, confirmation: 'Delete this depot?',
          success_message: 'Depot deleted.' },
      ] },
    ],
  },
  page_actions: [
    { id: 'add-depot', type: 'navigate', label: 'Add Depot', icon: 'Plus',
      path: '/depots/create', permission: { any: ['depots.create'] } },
  ],
  sub_pages: [
    {
      id: 'depots-create', parentId: 'depots', title: 'Add Depot', page_title: 'Add Depot',
      type: 'create', page_type: 'create', path: '/depots/create', route: '/depots/create',
      authentication: { required: true }, permissions: { any: ['depots.create'] }, api,
      form: { ...form, submitLabel: 'Add Depot' },
    },
    {
      id: 'depots-details', parentId: 'depots', title: 'Depot Details', page_title: 'Depot Details',
      type: 'details', page_type: 'details', path: '/depots/:id', route: '/depots/:id',
      authentication: { required: true }, permissions: { any: ['depots.view'] }, api,
      recordIdParam: 'id', fields: ['name', 'code', 'province', 'status', 'address'],
      page_actions: [
        { id: 'back', type: 'navigate', label: 'Back', path: '/depots', variant: 'secondary' },
        { id: 'edit', type: 'edit', label: 'Edit', icon: 'Pencil', path: '/depots/{id}/edit',
          permission: { any: ['depots.update'] } },
      ],
      sections: [{
        id: 'overview', title: 'Depot information', fields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'code', label: 'Code', type: 'text' },
          { key: 'province', label: 'Province', type: 'text' },
          { key: 'status', label: 'Status', type: 'badge',
            badgeVariants: { active: 'success', inactive: 'danger' } },
          { key: 'address', label: 'Address', type: 'text' },
          { key: 'created_at', label: 'Created', type: 'datetime' },
        ],
      }],
    },
    {
      id: 'depots-edit', parentId: 'depots', title: 'Edit Depot', page_title: 'Edit Depot',
      type: 'edit', page_type: 'edit', path: '/depots/:id/edit', route: '/depots/:id/edit',
      authentication: { required: true }, permissions: { any: ['depots.update'] }, api,
      form: { ...form, submitLabel: 'Save Changes' }, recordIdParam: 'id',
    },
  ],
}

export const depotsListConfig = validateConfig('depots list page', pageConfigSchema, raw)
export const depotsCreateConfig = validateConfig(
  'depots create page', pageConfigSchema,
  depotsListConfig.sub_pages?.find((page) => page.type === 'create'),
)
export const depotsDetailsConfig = validateConfig(
  'depots details page', pageConfigSchema,
  depotsListConfig.sub_pages?.find((page) => page.type === 'details'),
)
export const depotsEditConfig = validateConfig(
  'depots edit page', pageConfigSchema,
  depotsListConfig.sub_pages?.find((page) => page.type === 'edit'),
)
```

`validateConfig` catches malformed configuration at startup instead of allowing a partially broken screen. Keep it around the root and extracted sub-pages.

### Important frontend/backend mappings

| Frontend configuration | Backend contract |
| --- | --- |
| `baseUrl: '/api'` + endpoint `/depots` | `/api/depots` |
| `items: 'data.items'` | list response records |
| `total: 'data.total'` | total matching records |
| filter `query_parameter: 'status'` | `filterable_fields` contains `status` |
| sortable column accessor `province` | `sortable_fields` contains `province` |
| `responseMappingPath: 'data'` | item/create/update response payload |
| route `:id` | endpoint placeholder `{id}` and `recordIdParam: 'id'` |

Do not configure a filter or sort key that the backend does not allow. It may render correctly but will not produce the intended query.

## 11. Register all frontend pages

Edit `frontend/src/config/page-registry.ts`.

Import the four exports:

```ts
import {
  depotsCreateConfig,
  depotsDetailsConfig,
  depotsEditConfig,
  depotsListConfig,
} from '@/config/modules/depots.config'
```

Add them to `pageRegistry`:

```ts
depots: depotsListConfig,
'depots-create': depotsCreateConfig,
'depots-details': depotsDetailsConfig,
'depots-edit': depotsEditConfig,
```

Register every sub-page explicitly. The registry also walks `sub_pages`, but explicit entries make the module contract clear and match the established modules and tests.

Static paths such as `/depots/create` are resolved before `/depots/:id`, so `create` is not mistaken for an ID.

## 12. Add the navigation item

Edit `frontend/src/config/menu.config.ts`. Depots already logically belong under Logistics, so replace the generated Depots entry with an explicit item if a different ID/icon/permission is required, or add one like this:

```ts
{
  id: 'depots',
  label: 'Depots',
  path: '/depots',
  icon: 'Warehouse',
  permissions: { any: ['depots.view'] },
}
```

Place it inside the appropriate section's `children`. The menu path must equal the list page path. Use an icon supported by `frontend/src/framework/registry/icon-registry.ts`; register a new icon there only when necessary.

## 13. Add backend tests

Add integration coverage to `backend/tests/test_api.py` (using the fixtures already defined in `backend/tests/conftest.py`):

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
        "/api/depots?search=Lusaka&province=Lusaka&sortBy=name&sortDirection=asc",
        headers=auth_headers,
    )
    assert listing.status_code == 200
    assert listing.json()["data"]["total"] == 1

    viewed = client.get(f"/api/depots/{depot_id}", headers=auth_headers)
    assert viewed.status_code == 200
    assert viewed.json()["data"]["code"] == "LSK-DEPOT"

    updated = client.put(
        f"/api/depots/{depot_id}",
        headers=auth_headers,
        json={"status": "inactive"},
    )
    assert updated.status_code == 200
    assert updated.json()["data"]["status"] == "inactive"

    deleted = client.delete(f"/api/depots/{depot_id}", headers=auth_headers)
    assert deleted.status_code == 200
    assert client.get(f"/api/depots/{depot_id}", headers=auth_headers).status_code == 404
```

Also test:

- invalid payloads return `422`;
- duplicate `code` values return the expected conflict response;
- users without each required permission receive `403`;
- deleted rows are absent from list and item endpoints;
- create, update, and delete produce the expected audit log entries.

Run from `backend`:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

## 14. Add frontend tests

Create `frontend/src/tests/depots-module.test.tsx`. At minimum, validate the registry and route matching:

```tsx
import { describe, expect, it } from 'vitest'

import { depotsListConfig } from '@/config/modules/depots.config'
import { getPageConfigByRoute, pageRegistry } from '@/config/page-registry'

describe('depots generated CRUD module', () => {
  it('registers all pages and resolves each route', () => {
    expect(Object.keys(pageRegistry)).toEqual(expect.arrayContaining([
      'depots', 'depots-create', 'depots-details', 'depots-edit',
    ]))
    expect(getPageConfigByRoute('/depots')?.id).toBe('depots')
    expect(getPageConfigByRoute('/depots/create')?.id).toBe('depots-create')
    expect(getPageConfigByRoute('/depots/42')?.id).toBe('depots-details')
    expect(getPageConfigByRoute('/depots/42/edit')?.id).toBe('depots-edit')
    expect(depotsListConfig.sub_pages).toHaveLength(3)
  })
})
```

Follow `frontend/src/tests/banks-module.test.tsx` for examples of rendering a generated page and exercising CRUD through the API client. Tests should cover:

- table headers and values;
- create navigation;
- create and edit form fields;
- details sections;
- delete confirmation and request path;
- permission-based action visibility;
- correct list query parameters and response mapping.

Run from `frontend`:

```powershell
npm.cmd run test
npm.cmd run build
npm.cmd run lint
```

## 15. End-to-end verification

After both applications are running:

1. Apply the latest migration and run the seed command.
2. Sign in as a role containing `depots.view/create/update/delete`.
3. Confirm the Depots navigation item appears.
4. Open `/depots` and verify pagination, search, status/province filters, and sorting.
5. Create a record and confirm it appears in the list.
6. Open details, edit one field, and reload to confirm persistence.
7. Delete it and confirm it disappears and its item endpoint returns `404`.
8. Inspect `/api/docs` and `audit_logs`.
9. Repeat with a restricted role and verify hidden actions plus backend `403` enforcement.

Frontend permission guards improve the interface, but the backend permission dependency is the security boundary.

## 16. When generated CRUD is not enough

Keep the standard CRUD resource for ordinary record management. For a workflow such as depot stock transfer:

1. Add request/response schemas for the operation.
2. Put validation and transactional writes in `backend/app/services/depots.py`.
3. Add an endpoint in `backend/app/api/routes/depots.py`.
4. Protect it with `require_permission("depots.update")` or a dedicated seeded permission.
5. Include that custom router in `backend/app/api/router.py`.
6. Register a custom frontend action/component only if the standard action registry cannot express it.
7. Test success, validation, permission denial, conflict, and transaction rollback.

All related writes and their audit entry should share one SQLAlchemy transaction.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Table is missing after migration | Model was not imported or migration not applied | Export the model from `app.models` when using a separate file, regenerate/review, then upgrade. |
| API route is missing | Resource is not included in `RESOURCES` | Add it to a resource group included by the final list and restart the API. |
| API returns `403` | Permission not seeded/assigned or code mismatch | Seed, assign the role, and compare exact strings on both sides. |
| Edit receives `422` for omitted fields | Update schema fields are required | Make update properties optional with defaults of `None`. |
| List is empty in the UI but API has rows | Incorrect `data_mapping` | Use `data.items`, `data.total`, `data.page`, and `data.pageSize`. |
| Create/edit response does not populate | Missing/wrong response mapping | Set `responseMappingPath: 'data'` for item/create/update endpoints. |
| Filter has no effect | Query name is absent from `filterable_fields` | Align `query_parameter` with the backend field. |
| Sorting falls back unexpectedly | Column is absent from `sortable_fields` | Add the real model column or disable sorting for it. |
| `/depots/create` opens details | Route IDs/paths are inconsistent | Use the exact four routes shown and register all pages. |
| Delete calls the wrong server | Absolute or inconsistent endpoint | Prefer `/api/depots/{id}` for action endpoints. |
| Icon does not render | Icon is absent from the icon registry | Choose a registered icon or add it to `icon-registry.ts`. |

## Completion checklist

- [ ] Naming, route, and permission prefix are consistent end to end.
- [ ] Model inherits `ResourceMixin` and is visible to Alembic.
- [ ] Create, optional-field update, and response schemas match the database.
- [ ] `ResourceConfig` is included in `RESOURCES`.
- [ ] Search, filters, and sortable fields are valid model/data fields.
- [ ] Migration is generated, reviewed, applied, and committed.
- [ ] Permissions are seeded and assigned to roles.
- [ ] Frontend list/create/details/edit configuration passes runtime validation.
- [ ] All four page IDs are in `pageRegistry`.
- [ ] Menu route and permission match the page.
- [ ] Backend CRUD, validation, uniqueness, authorization, audit, and soft delete are tested.
- [ ] Frontend routes, rendering, mappings, actions, and permissions are tested.
- [ ] Backend tests, frontend tests, build, and lint pass.
- [ ] End-to-end behavior is verified with privileged and restricted users.
