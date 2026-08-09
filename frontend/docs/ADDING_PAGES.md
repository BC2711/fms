# Adding Frontend Pages

This frontend supports two page styles:

1. **Generated pages** use configuration objects and the existing page generators. Use these for conventional lists, forms, details pages, and dashboards.
2. **Custom pages** use a dedicated React component while retaining the configuration-based route, menu, and access-control system. Use these for highly designed experiences such as All Account Holders and Oil Marketing Companies.

Backend work is optional. A frontend page can use local fixture data until its API is ready.

For the complete configuration-driven workflow, see [Adding Generated Pages](GENERATED_PAGES.md).

## How page routing works

The important files are:

- `src/config/menu.config.ts`: visible navigation entries.
- `src/config/page-registry.ts`: page configurations available to the router.
- `src/framework/generators/RouteGenerator.tsx`: creates React Router routes from registered configurations.
- `src/framework/generators/PageGenerator.tsx`: selects the generated or custom page component.
- `src/config/modules/`: configuration files for application modules.
- `src/features/`: custom page components and frontend fixture data.

A menu entry does not create a route by itself. Every navigable menu path must have a corresponding page configuration registered in `page-registry.ts`.

## Required child-menu format

Every child menu must include `id`, `label`, `path`, and `icon`:

```ts
{
  id: 'accounts-oil-marketing-companies',
  label: 'Oil Marketing Companies',
  path: '/accounts/oil-marketing-companies',
  icon: 'Building2',
}
```

Use these conventions:

- IDs are lowercase kebab-case and globally unique.
- Paths are lowercase kebab-case and start with `/`.
- The page configuration ID should match the menu ID.
- Icons must be keys supported by `src/framework/registry/icon-registry.ts`.
- Do not add `disabled: true` after the page is registered and ready.

## Adding a custom-designed page

Use this approach when a page needs specialized cards, tables, drawers, charts, or workflows.

### 1. Create the feature component

Create a folder under `src/features`:

```text
src/features/accounts/
  CorporateCompaniesPage.tsx
  corporate-companies.data.ts
```

Keep temporary fixture data separate from the component:

```ts
// src/features/accounts/corporate-companies.data.ts
export interface CorporateCompany {
  id: number
  name: string
  accountNumber: string
  status: 'active' | 'suspended'
}

export const corporateCompanyFixtures: CorporateCompany[] = [
  {
    id: 1,
    name: 'Example Company',
    accountNumber: 'FMS-000001',
    status: 'active',
  },
]
```

Export the page as a named component:

```tsx
export function CorporateCompaniesPage() {
  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-semibold text-slate-400">
          Accounts / Corporate Companies
        </p>
        <h1 className="mt-2 text-3xl font-bold">Corporate Companies</h1>
      </header>
    </section>
  )
}
```

Custom pages should support:

- light and dark themes;
- desktop and mobile layouts;
- keyboard-accessible buttons and form controls;
- explicit loading, empty, and error states when API integration is added;
- semantic headings, tables, labels, and dialogs.

### 2. Add a page configuration

Add the configuration to the relevant file in `src/config/modules`. Account pages currently live in `accounts.config.ts`.

The configuration supplies routing and access metadata even when a custom component handles rendering:

```ts
export const corporateCompaniesConfig = validateConfig(
  'corporate companies page',
  pageConfigSchema,
  {
    ...raw,
    id: 'accounts-corporate-companies',
    title: 'Corporate Companies',
    page_title: 'Corporate Companies',
    path: '/accounts/corporate-companies',
    route: '/accounts/corporate-companies',
  },
) as ListPageConfig
```

If a custom page does not use an API, its component must not invoke the generic query generator. The API fields inherited by the configuration are then routing/schema metadata only.

### 3. Register the configuration

Import the configuration in `src/config/page-registry.ts` and add it to `pageRegistry`:

```ts
import { corporateCompaniesConfig } from '@/config/modules/accounts.config'

export const pageRegistry: Record<string, PageConfig> = {
  // Existing pages...
  'accounts-corporate-companies': corporateCompaniesConfig,
}
```

### 4. Connect the custom component

Import the component in `src/framework/generators/PageGenerator.tsx` and select it before the generic switch:

```tsx
import { CorporateCompaniesPage } from '@/features/accounts/CorporateCompaniesPage'

function renderPage(config: PageConfig, routeParams: Readonly<Params<string>>) {
  if (config.id === 'accounts-corporate-companies') {
    return <CorporateCompaniesPage />
  }

  // Existing generated-page switch...
}
```

### 5. Add the menu entry

Add the child to `src/config/menu.config.ts`:

```ts
{
  id: 'accounts-corporate-companies',
  label: 'Corporate Companies',
  path: '/accounts/corporate-companies',
  icon: 'Building2',
}
```

The menu ID, registry ID, custom component check, path, and route must agree.

## Adding a generated list page

Generated list pages use `ListPageGenerator` and fetch data through `useDynamicQuery`.

```ts
import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { ListPageConfig } from '@/types/configuration.types'

const raw = {
  id: 'stations-all',
  title: 'All Stations',
  page_title: 'All Stations',
  description: 'Manage registered fuel stations.',
  type: 'list',
  page_type: 'list',
  path: '/stations/all-stations',
  route: '/stations/all-stations',
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
    },
  },
  filters: [
    {
      id: 'search',
      type: 'search',
      label: 'Search',
      field: 'search',
      query_parameter: 'search',
      placeholder: 'Search stations',
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
        id: 'name',
        type: 'text',
        header: 'Station',
        accessor: 'name',
        sortable: true,
        searchable: true,
      },
      {
        id: 'status',
        type: 'badge',
        header: 'Status',
        accessor: 'status',
        options: {
          active: 'success',
          inactive: 'danger',
        },
      },
    ],
  },
} satisfies ListPageConfig

export const stationsListConfig = validateConfig(
  'stations list page',
  pageConfigSchema,
  raw,
) as ListPageConfig
```

Register the configuration and add its menu entry as described above. Generated pages do not need a custom check in `PageGenerator.tsx`.

The expected paginated API response is:

```json
{
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "pageSize": 10
  }
}
```

## Guest and protected pages

Pages are accessible to guests when both `authentication` and `permissions` are omitted:

```ts
{
  id: 'accounts-corporate-companies',
  // No authentication or permissions properties.
}
```

Require a signed-in user with:

```ts
authentication: { required: true }
```

Require permissions with:

```ts
authentication: { required: true },
permissions: { any: ['accounts.view'] }
```

Do not put a protected page in an unrestricted menu unless intentionally allowing users to see the destination before receiving an Unauthorized response. Usually the menu entry should carry matching permissions:

```ts
{
  id: 'accounts-corporate-companies',
  label: 'Corporate Companies',
  path: '/accounts/corporate-companies',
  icon: 'Building2',
  permissions: { any: ['accounts.view'] },
}
```

## Testing a page

Add a focused component test under `src/tests`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CorporateCompaniesPage } from '@/features/accounts/CorporateCompaniesPage'

describe('CorporateCompaniesPage', () => {
  it('renders the page heading', () => {
    render(<CorporateCompaniesPage />)
    expect(
      screen.getByRole('heading', { name: 'Corporate Companies' }),
    ).toBeInTheDocument()
  })
})
```

Run focused validation:

```powershell
npm.cmd run test -- src/tests/corporate-companies-page.test.tsx
npm.cmd run test -- src/tests/configuration-validation.test.ts
npm.cmd run test -- src/tests/routing/route-generation.test.ts
.\node_modules\.bin\vite.cmd build
```

## Page checklist

Before considering a page complete, verify:

- [ ] The menu child has `id`, `label`, `path`, and `icon`.
- [ ] The menu ID is unique and appears only once.
- [ ] The page configuration ID matches the menu ID.
- [ ] `path` and `route` match the menu path.
- [ ] The configuration is exported and registered in `page-registry.ts`.
- [ ] A custom page is connected in `PageGenerator.tsx`, if applicable.
- [ ] Guest/authentication behavior is intentional.
- [ ] Fixture data is isolated from the component.
- [ ] Search and filters work together.
- [ ] Desktop, mobile, light, and dark layouts are usable.
- [ ] Empty states and detail panels are keyboard accessible.
- [ ] Focused tests pass.
- [ ] The production bundle succeeds.

## Common problems

### The page shows “Page not found”

The menu exists, but the configuration is missing from `page-registry.ts`, or the registered route does not match the menu path.

### The page shows “Unauthorized”

The configuration contains `authentication.required` or `permissions`. Remove them for a guest preview, or ensure the current user has the required permission.

### A menu appears twice

The item is probably handwritten and also included in an `items(...)` label array. Keep only the explicit entry when it has a custom path or icon.

### The menu does not navigate

Verify that the child has a `path` and is not disabled. Parent entries with `children` expand instead of navigating.

### A custom page still calls an API

Ensure its configuration ID is handled before the generated-page switch in `PageGenerator.tsx`.

### Tests remain on “Loading workspace...”

This can be caused by application-level authentication initialization in full router tests. Prefer a focused component test for the page and separate route/configuration tests.
