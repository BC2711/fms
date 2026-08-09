# Adding Generated Pages

Generated pages are React pages created from TypeScript or JSON configuration. They use the shared page generators for routing, data loading, tables, forms, details, dashboards, permissions, and actions.

Use generated pages when a screen follows a conventional application pattern:

- paginated list or management table;
- create form;
- edit form;
- record details;
- configuration-driven dashboard.

Use a custom page instead when the screen requires a specialized layout or interaction that the generators do not support.

## Generated-page architecture

The generation flow is:

```text
menu.config.ts
      ↓
page-registry.ts
      ↓
RouteGenerator.tsx
      ↓
PageGenerator.tsx
      ↓
ListPageGenerator / FormPageGenerator / DetailsGenerator / DashboardGenerator
```

Relevant files:

- `src/types/configuration.types.ts`: supported configuration types.
- `src/framework/schemas/page.schema.ts`: runtime page validation.
- `src/framework/schemas/validation.ts`: readable validation errors.
- `src/config/modules/`: module configurations.
- `src/config/page-registry.ts`: registered page configurations.
- `src/config/menu.config.ts`: navigation entries.
- `src/framework/generators/`: generated-page renderers.
- `src/hooks/useDynamicQuery.ts`: generated GET requests.
- `src/hooks/useDynamicMutation.ts`: generated POST, PUT, PATCH, and DELETE requests.

## Recommended module structure

Keep related pages in one module configuration:

```text
src/config/modules/
  stations.config.ts
```

A typical CRUD module exports four configurations:

```text
stations                /stations
stations-create         /stations/create
stations-details        /stations/:id
stations-edit           /stations/:id/edit
```

The list is the parent page. Create, details, and edit pages are stored in its `sub_pages` array.

## Complete CRUD example

Create `src/config/modules/stations.config.ts`:

```ts
import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type {
  ApiConfig,
  FormConfig,
  PageConfig,
} from '@/types/configuration.types'

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
    list: {
      path: '/stations',
      method: 'GET',
    },
    item: {
      path: '/stations/{id}',
      method: 'GET',
      responseMappingPath: 'data',
    },
    create: {
      path: '/stations',
      method: 'POST',
      responseMappingPath: 'data',
    },
    update: {
      path: '/stations/{id}',
      method: 'PUT',
      responseMappingPath: 'data',
    },
    delete: {
      path: '/stations/{id}',
      method: 'DELETE',
    },
  },
}

const form: FormConfig = {
  cancelPath: '/stations',
  resetEnabled: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Station Name',
      required: true,
      validation: {
        min_length: 2,
        max_length: 100,
      },
    },
    {
      name: 'code',
      type: 'text',
      label: 'Station Code',
      required: true,
      validation: {
        min_length: 2,
        max_length: 20,
      },
    },
    {
      name: 'province',
      type: 'select',
      label: 'Province',
      required: true,
      options: [
        { label: 'Lusaka', value: 'Lusaka' },
        { label: 'Copperbelt', value: 'Copperbelt' },
        { label: 'Southern', value: 'Southern' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      default_value: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Address',
      rows: 4,
    },
  ],
}

const raw: PageConfig = {
  id: 'stations',
  title: 'All Stations',
  page_title: 'All Stations',
  description: 'Manage registered fuel stations.',
  type: 'list',
  page_type: 'list',
  path: '/stations',
  route: '/stations',
  authentication: { required: true },
  permissions: { any: ['stations.view'] },
  api,
  statistics: [
    {
      id: 'total-stations',
      type: 'statistic',
      title: 'Total Stations',
      dataPath: 'total',
      icon: 'Fuel',
      format: 'number',
    },
  ],
  filters: [
    {
      id: 'search',
      type: 'search',
      label: 'Search',
      field: 'search',
      query_parameter: 'search',
      placeholder: 'Search stations',
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      field: 'status',
      query_parameter: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      id: 'province',
      type: 'select',
      label: 'Province',
      field: 'province',
      query_parameter: 'province',
      options: [
        { label: 'Lusaka', value: 'Lusaka' },
        { label: 'Copperbelt', value: 'Copperbelt' },
        { label: 'Southern', value: 'Southern' },
      ],
    },
  ],
  table: {
    rowKey: 'id',
    stickyHeader: true,
    striped: true,
    pagination: {
      enabled: true,
      pageSize: 10,
      pageSizeOptions: [10, 20, 50],
    },
    sorting: {
      enabled: true,
      defaultColumn: 'name',
      defaultDirection: 'asc',
    },
    columns: [
      {
        id: 'code',
        type: 'text',
        header: 'Code',
        accessor: 'code',
        sortable: true,
      },
      {
        id: 'name',
        type: 'text',
        header: 'Station',
        accessor: 'name',
        sortable: true,
        searchable: true,
      },
      {
        id: 'province',
        type: 'text',
        header: 'Province',
        accessor: 'province',
        sortable: true,
      },
      {
        id: 'status',
        type: 'badge',
        header: 'Status',
        accessor: 'status',
        sortable: true,
        options: {
          active: 'success',
          inactive: 'danger',
        },
      },
      {
        id: 'created-at',
        type: 'datetime',
        header: 'Created',
        accessor: 'created_at',
        sortable: true,
      },
      {
        id: 'actions',
        type: 'actions',
        header: 'Actions',
        actions: [
          {
            id: 'view',
            type: 'navigate',
            label: 'View',
            icon: 'Eye',
          },
          {
            id: 'edit',
            type: 'edit',
            label: 'Edit',
            icon: 'Pencil',
            permission: { any: ['stations.update'] },
          },
          {
            id: 'delete',
            type: 'delete',
            label: 'Delete',
            icon: 'Trash2',
            endpoint: '/api/stations/{id}',
            permission: { any: ['stations.delete'] },
            requires_confirmation: true,
            confirmation: 'Delete this station?',
            success_message: 'Station deleted.',
          },
        ],
      },
    ],
  },
  page_actions: [
    {
      id: 'add-station',
      type: 'navigate',
      label: 'Add Station',
      icon: 'Plus',
      path: '/stations/create',
      permission: { any: ['stations.create'] },
    },
  ],
  sub_pages: [
    {
      id: 'stations-create',
      parentId: 'stations',
      title: 'Add Station',
      page_title: 'Add Station',
      type: 'create',
      page_type: 'create',
      path: '/stations/create',
      route: '/stations/create',
      authentication: { required: true },
      permissions: { any: ['stations.create'] },
      api,
      form: {
        ...form,
        submitLabel: 'Add Station',
      },
    },
    {
      id: 'stations-details',
      parentId: 'stations',
      title: 'Station Details',
      page_title: 'Station Details',
      type: 'details',
      page_type: 'details',
      path: '/stations/:id',
      route: '/stations/:id',
      authentication: { required: true },
      permissions: { any: ['stations.view'] },
      api,
      recordIdParam: 'id',
      fields: ['name', 'code', 'province', 'status', 'address'],
      page_actions: [
        {
          id: 'back',
          type: 'navigate',
          label: 'Back',
          path: '/stations',
          variant: 'secondary',
        },
        {
          id: 'edit',
          type: 'edit',
          label: 'Edit',
          icon: 'Pencil',
          path: '/stations/{id}/edit',
          permission: { any: ['stations.update'] },
        },
      ],
      sections: [
        {
          id: 'overview',
          title: 'Station information',
          fields: [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'code', label: 'Code', type: 'text', copyable: true },
            { key: 'province', label: 'Province', type: 'text' },
            {
              key: 'status',
              label: 'Status',
              type: 'badge',
              badgeVariants: {
                active: 'success',
                inactive: 'danger',
              },
            },
            { key: 'address', label: 'Address', type: 'text' },
            { key: 'created_at', label: 'Created', type: 'datetime' },
          ],
        },
      ],
    },
    {
      id: 'stations-edit',
      parentId: 'stations',
      title: 'Edit Station',
      page_title: 'Edit Station',
      type: 'edit',
      page_type: 'edit',
      path: '/stations/:id/edit',
      route: '/stations/:id/edit',
      authentication: { required: true },
      permissions: { any: ['stations.update'] },
      api,
      form: {
        ...form,
        submitLabel: 'Save Changes',
      },
      recordIdParam: 'id',
    },
  ],
}

export const stationsListConfig = validateConfig(
  'stations list page',
  pageConfigSchema,
  raw,
)

export const stationsCreateConfig = validateConfig(
  'stations create page',
  pageConfigSchema,
  stationsListConfig.sub_pages?.find((page) => page.type === 'create'),
)

export const stationsDetailsConfig = validateConfig(
  'stations details page',
  pageConfigSchema,
  stationsListConfig.sub_pages?.find((page) => page.type === 'details'),
)

export const stationsEditConfig = validateConfig(
  'stations edit page',
  pageConfigSchema,
  stationsListConfig.sub_pages?.find((page) => page.type === 'edit'),
)
```

## Registering generated pages

Import every exported configuration in `src/config/page-registry.ts`:

```ts
import {
  stationsCreateConfig,
  stationsDetailsConfig,
  stationsEditConfig,
  stationsListConfig,
} from '@/config/modules/stations.config'
```

Add each configuration to `pageRegistry`:

```ts
export const pageRegistry: Record<string, PageConfig> = {
  // Existing pages...
  stations: stationsListConfig,
  'stations-create': stationsCreateConfig,
  'stations-details': stationsDetailsConfig,
  'stations-edit': stationsEditConfig,
}
```

Do not add generated pages to `PageGenerator.tsx`. The existing switch automatically selects the appropriate generator using `type` or `page_type`.

## Adding the menu entry

Every child menu requires `id`, `label`, `path`, and `icon`:

```ts
{
  id: 'stations-all',
  label: 'All Stations',
  path: '/stations',
  icon: 'Fuel',
}
```

The menu ID does not have to equal the page ID, but matching them is recommended. The menu path must match the registered page route.

Only list pages normally need menu entries. Create, edit, and details pages are reached through page and row actions.

## API response contracts

### Paginated list

```json
{
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Central Station",
        "code": "ST-001",
        "province": "Lusaka",
        "status": "active",
        "created_at": "2026-08-05T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

### Single record

```json
{
  "data": {
    "id": 1,
    "name": "Central Station",
    "code": "ST-001",
    "province": "Lusaka",
    "status": "active"
  }
}
```

### Create and update

Create and update responses should also return the saved record under `data`:

```json
{
  "data": {
    "id": 1,
    "name": "Central Station"
  }
}
```

### Delete

```json
{
  "success": true
}
```

## Query parameters

The generated list sends:

- `page`: one-based page number;
- `pageSize`: requested number of rows;
- `sortBy`: selected column accessor;
- `sortDirection`: `asc` or `desc`;
- configured filter query parameters such as `search`, `status`, or `province`.

The API should validate these values and return the requested page.

## Supported table columns

Column types are defined in `configuration.types.ts`:

- `text`: normal text values;
- `number`: numeric, currency, or percentage values;
- `badge`: status values with semantic variants;
- `datetime`: formatted date and time values;
- `actions`: row actions such as view, edit, and delete.

The `accessor` must match a property in each API record.

Currency example:

```ts
{
  id: 'balance',
  type: 'number',
  header: 'Balance',
  accessor: 'balance',
  format: 'currency',
  currency: 'ZMW',
}
```

## Supported form fields

The form generator supports:

- `text`;
- `email`;
- `password`;
- `url`;
- `number`;
- `select`;
- `textarea`;
- `date`;
- `datetime`;
- `checkbox`;
- `radio`;
- `hidden`.

Example:

```ts
{
  name: 'email',
  type: 'email',
  label: 'Email Address',
  required: true,
  placeholder: 'name@example.com',
  validation: {
    max_length: 120,
  },
}
```

Use `default_value` for configuration-driven defaults. The camel-case `defaultValue` property is also supported by the TypeScript type, but existing module configurations conventionally use `default_value`.

## Filters

Supported filters are:

- `search`;
- `select`;
- `date_range`.

The `query_parameter` value controls the URL and API parameter:

```ts
{
  id: 'account-type',
  type: 'select',
  label: 'Account Type',
  field: 'account_type',
  query_parameter: 'type',
  options: [
    { label: 'Corporate', value: 'corporate' },
    { label: 'Individual', value: 'individual' },
  ],
}
```

The page stores filters in the browser URL, making filtered views shareable and restorable.

## Actions

Common page and row actions include:

- `navigate`;
- `create`;
- `edit`;
- `delete`;
- `export`;
- `refresh`.

Dynamic record paths use `{id}` placeholders:

```ts
{
  id: 'edit',
  type: 'edit',
  label: 'Edit',
  path: '/stations/{id}/edit',
}
```

Delete actions should require confirmation:

```ts
{
  id: 'delete',
  type: 'delete',
  label: 'Delete',
  endpoint: '/api/stations/{id}',
  requires_confirmation: true,
  confirmation: 'Delete this station? This action cannot be undone.',
  success_message: 'Station deleted.',
}
```

## Guest access and permissions

For a guest-accessible generated page, omit both properties:

```ts
// No authentication or permissions properties.
```

For any signed-in user:

```ts
authentication: { required: true }
```

For permission-controlled access:

```ts
authentication: { required: true },
permissions: { any: ['stations.view'] }
```

Actions can have separate permissions:

```ts
permission: { any: ['stations.delete'] }
```

Use the same permission rule on the menu entry if unauthorized users should not see it.

## Adding a dashboard page

Dashboard pages use `DashboardPageConfig`:

```ts
import type { DashboardPageConfig } from '@/types/configuration.types'

export const operationsDashboardConfig = {
  id: 'operations-dashboard',
  title: 'Operations Dashboard',
  type: 'dashboard',
  page_type: 'dashboard',
  path: '/dashboard/operations-dashboard',
  route: '/dashboard/operations-dashboard',
  authentication: { required: true },
  widgets: [
    {
      id: 'active-stations',
      type: 'statistic',
      title: 'Active Stations',
      dataPath: 'summary.active_stations',
      icon: 'Fuel',
      format: 'number',
    },
  ],
} satisfies DashboardPageConfig
```

Widgets that load remote data also need a page-level `api` configuration and a matching `endpointKey`.

## Validation and tests

All configurations should pass runtime schema validation before being registered.

Run:

```powershell
npm.cmd run test -- src/tests/configuration-validation.test.ts
npm.cmd run test -- src/tests/routing/route-generation.test.ts
npm.cmd run test -- src/tests/page-generator.test.tsx
.\node_modules\.bin\vite.cmd build
```

A module-specific test should verify:

- exported configurations exist;
- list, create, details, and edit routes are registered;
- the list heading renders;
- page actions navigate to the correct routes;
- form fields render;
- API response mapping produces table rows;
- permissions hide restricted actions.

## Generated-page checklist

- [ ] Create the module configuration under `src/config/modules`.
- [ ] Give every configuration a unique ID.
- [ ] Set matching `path` and `route` values.
- [ ] Configure API endpoints and response mappings.
- [ ] Configure list filters, statistics, table, and actions.
- [ ] Add create, details, and edit pages under `sub_pages` when needed.
- [ ] Export and validate every page configuration.
- [ ] Register every exported configuration in `page-registry.ts`.
- [ ] Add the list page to `menu.config.ts` using `id`, `label`, `path`, and `icon`.
- [ ] Confirm guest or protected access is intentional.
- [ ] Add focused configuration, route, and rendering tests.
- [ ] Run the production build.

## Troubleshooting

### Page not found

The page configuration is not registered, or its `path`/`route` differs from the menu path.

### Unauthorized

The page contains `authentication` or `permissions`, and the current user does not satisfy them.

### Empty table with a successful request

The `data_mapping.items` path does not match the response envelope, or a table `accessor` does not match the record property.

### Create or edit submits to the wrong endpoint

Check the endpoint keys. Create pages use `create`; edit pages use `update`; edit pages also use `item` to load initial data.

### Details or edit page cannot resolve the record

Ensure the route contains `:id`, `recordIdParam` is `id`, and endpoint paths use `{id}`.

### Delete succeeds but the table does not update

Ensure the delete action is executed through the action registry so the relevant query is invalidated.

### Validation fails during application startup

Read the complete schema error. Common causes include unknown properties, missing `rowKey`, unsupported field types, missing select options, or an endpoint without `path` and `method`.
