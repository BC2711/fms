import type { ListPageConfig, MenuItem, PageConfig } from '@/types/configuration.types'

function titleFromPath(path: string): string {
  const segment = path.split('/').filter(Boolean).at(-1) ?? 'resource'
  return segment.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function pageId(path: string): string {
  return `generated-${path.replace(/^\//, '').replaceAll('/', '-')}`
}

export function createGeneratedResourcePage(path: string, label?: string): ListPageConfig {
  const title = label ?? titleFromPath(path)
  const id = pageId(path)
  const api = {
    baseUrl: '/api',
    data_mapping: { type: 'paginated' as const, items: 'data.items', total: 'data.total', page: 'data.page', pageSize: 'data.pageSize' },
    endpoints: {
      list: { path, method: 'GET' as const },
      item: { path: `${path}/{id}`, method: 'GET' as const, responseMappingPath: 'data' },
      create: { path, method: 'POST' as const, responseMappingPath: 'data' },
      update: { path: `${path}/{id}`, method: 'PUT' as const, responseMappingPath: 'data' },
      delete: { path: `${path}/{id}`, method: 'DELETE' as const },
    },
  }
  const form = {
    layout: { type: 'columns' as const, columns: 2 as const },
    cancelPath: path,
    resetEnabled: true,
    fields: [
      { name: 'name', type: 'text' as const, label: 'Name', required: true },
      { name: 'code', type: 'text' as const, label: 'Code' },
      { name: 'status', type: 'select' as const, label: 'Status', default_value: 'active', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] },
      { name: 'description', type: 'textarea' as const, label: 'Description', rows: 4, grid: { columns: 12 } },
    ],
  }

  return {
    id, title, page_title: title, description: `Manage ${title.toLowerCase()}.`, type: 'list', page_type: 'list', path, route: path,
    authentication: { required: true }, api,
    filters: [
      { id: 'search', type: 'search', label: 'Search', field: 'search', query_parameter: 'search', placeholder: `Search ${title.toLowerCase()}` },
      { id: 'status', type: 'select', label: 'Status', field: 'status', query_parameter: 'status', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] },
    ],
    table: {
      rowKey: 'id', striped: true, stickyHeader: true,
      pagination: { enabled: true, pageSize: 10, pageSizeOptions: [10, 20, 50] },
      sorting: { enabled: true, defaultColumn: 'created_at', defaultDirection: 'desc' },
      columns: [
        { id: 'name', type: 'text', header: 'Name', accessor: 'name', sortable: true, searchable: true },
        { id: 'code', type: 'text', header: 'Code', accessor: 'code', sortable: true },
        { id: 'status', type: 'badge', header: 'Status', accessor: 'status', sortable: true, options: { active: 'success', inactive: 'danger', pending: 'warning' } },
        { id: 'created-at', type: 'datetime', header: 'Created', accessor: 'created_at', sortable: true },
        { id: 'actions', type: 'actions', header: 'Actions', actions: [
          { id: 'view', type: 'navigate', label: 'View', icon: 'Eye', path: `${path}/{id}` },
          { id: 'edit', type: 'edit', label: 'Edit', icon: 'Pencil', path: `${path}/{id}/edit` },
          { id: 'delete', type: 'delete', label: 'Delete', icon: 'Trash2', endpoint: `${path}/{id}`, requires_confirmation: true },
        ] },
      ],
    },
    page_actions: [{ id: 'create', type: 'navigate', label: `Add ${title}`, icon: 'Plus', path: `${path}/create` }],
    sub_pages: [
      { id: `${id}-create`, parentId: id, title: `Add ${title}`, page_title: `Add ${title}`, type: 'create', page_type: 'create', path: `${path}/create`, route: `${path}/create`, authentication: { required: true }, api, form: { ...form, submitLabel: `Add ${title}` } },
      { id: `${id}-details`, parentId: id, title: `${title} Details`, page_title: `${title} Details`, type: 'details', page_type: 'details', path: `${path}/:id`, route: `${path}/:id`, authentication: { required: true }, api, recordIdParam: 'id', fields: ['name', 'code', 'status', 'description', 'created_at'], sections: [{ id: 'overview', title: 'Overview', fields: [{ key: 'name', label: 'Name', type: 'text' }, { key: 'code', label: 'Code', type: 'text' }, { key: 'status', label: 'Status', type: 'badge' }, { key: 'description', label: 'Description', type: 'text' }, { key: 'created_at', label: 'Created', type: 'datetime' }] }] },
      { id: `${id}-edit`, parentId: id, title: `Edit ${title}`, page_title: `Edit ${title}`, type: 'edit', page_type: 'edit', path: `${path}/:id/edit`, route: `${path}/:id/edit`, authentication: { required: true }, api, form: { ...form, submitLabel: 'Save Changes' }, recordIdParam: 'id' },
    ],
  }
}

export function missingMenuPages(menu: MenuItem[], existingPaths: Set<string>): PageConfig[] {
  const pages: PageConfig[] = []
  const visit = (item: MenuItem) => {
    if (item.children?.length) { item.children.forEach(visit); return }
    if (item.path && !existingPaths.has(item.path)) {
      pages.push(createGeneratedResourcePage(item.path, item.label))
      existingPaths.add(item.path)
    }
  }
  menu.forEach(visit)
  return pages
}
