import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { ApiConfig, FormConfig, PageConfig } from '@/types/configuration.types'

const api: ApiConfig = {
  baseUrl: '/api',
  data_mapping: { type: 'paginated', items: 'data.items', total: 'data.total', page: 'data.page', pageSize: 'data.pageSize' },
  endpoints: {
    list: { path: '/banks', method: 'GET' }, item: { path: '/banks/{id}', method: 'GET', responseMappingPath: 'data' },
    create: { path: '/banks', method: 'POST' }, update: { path: '/banks/{id}', method: 'PUT' }, delete: { path: '/banks/{id}', method: 'DELETE' },
  },
}

const form: FormConfig = {
  cancelPath: '/banks', resetEnabled: true,
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true, validation: { min_length: 2, max_length: 100 } },
    { name: 'code', type: 'text', label: 'Code', required: true, validation: { min_length: 2, max_length: 10 } },
    { name: 'country', type: 'select', label: 'Country', required: true, options: [{ label: 'Zambia', value: 'Zambia' }, { label: 'South Africa', value: 'South Africa' }, { label: 'Kenya', value: 'Kenya' }, { label: 'Nigeria', value: 'Nigeria' }, { label: 'United Kingdom', value: 'United Kingdom' }] },
    { name: 'status', type: 'select', label: 'Status', required: true, default_value: 'active', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] },
    { name: 'address', type: 'textarea', label: 'Address', rows: 4 },
  ],
}

const raw: PageConfig = {
  id: 'banks', title: 'Banks', page_title: 'Banks', description: 'Manage financial institutions.', type: 'list', page_type: 'list', path: '/banks', route: '/banks', authentication: { required: true }, permissions: { any: ['banks.view'] }, api,
  table: { rowKey: 'id', stickyHeader: true, striped: true, pagination: { enabled: true, pageSize: 10, pageSizeOptions: [10, 20, 50] }, sorting: { enabled: true, defaultColumn: 'name', defaultDirection: 'asc' }, columns: [
    { id: 'id', type: 'number', header: 'ID', accessor: 'id', sortable: true }, { id: 'name', type: 'text', header: 'Name', accessor: 'name', sortable: true, searchable: true }, { id: 'code', type: 'text', header: 'Code', accessor: 'code', sortable: true }, { id: 'country', type: 'text', header: 'Country', accessor: 'country', sortable: true }, { id: 'status', type: 'badge', header: 'Status', accessor: 'status', sortable: true, options: { active: 'success', inactive: 'danger' } }, { id: 'created-at', type: 'datetime', header: 'Created', accessor: 'created_at', sortable: true },
    { id: 'actions', type: 'actions', header: 'Actions', actions: [{ id: 'view', type: 'navigate', label: 'View', icon: 'Eye' }, { id: 'edit', type: 'edit', label: 'Edit', icon: 'Pencil', permission: { any: ['banks.update'] } }, { id: 'delete', type: 'delete', label: 'Delete', icon: 'Trash2', permission: { any: ['banks.delete'] }, endpoint: 'https://api.example.com/banks/{id}', requires_confirmation: true, confirmation: 'Delete this bank? This action cannot be undone.', success_message: 'Bank deleted.' }] },
  ] },
  filters: [{ id: 'search', type: 'search', label: 'Search', field: 'search', query_parameter: 'search', placeholder: 'Search banks' }, { id: 'status', type: 'select', label: 'Status', field: 'status', query_parameter: 'status', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] }, { id: 'country', type: 'select', label: 'Country', field: 'country', query_parameter: 'country', options: [{ label: 'Zambia', value: 'Zambia' }, { label: 'South Africa', value: 'South Africa' }, { label: 'Kenya', value: 'Kenya' }, { label: 'Nigeria', value: 'Nigeria' }, { label: 'United Kingdom', value: 'United Kingdom' }] }],
  statistics: [{ id: 'total-banks', type: 'statistic', title: 'Total Banks', dataPath: 'total', icon: 'Landmark' }, { id: 'active-banks', type: 'statistic', title: 'Active Banks', dataPath: 'active', icon: 'CircleCheck' }, { id: 'inactive-banks', type: 'statistic', title: 'Inactive Banks', dataPath: 'inactive', icon: 'CircleX' }],
  page_actions: [{ id: 'add-bank', type: 'navigate', label: 'Add Bank', icon: 'Plus', path: '/banks/create', permission: { any: ['banks.create'] } }],
  sub_pages: [
    { id: 'banks-create', parentId: 'banks', title: 'Add Bank', page_title: 'Add Bank', type: 'create', page_type: 'create', path: '/banks/create', route: '/banks/create', authentication: { required: true }, permissions: { any: ['banks.create'] }, api, form: { ...form, submitLabel: 'Add Bank' } },
    { id: 'banks-details', parentId: 'banks', title: 'Bank Details', page_title: 'Bank Details', type: 'details', page_type: 'details', path: '/banks/:id', route: '/banks/:id', authentication: { required: true }, permissions: { any: ['banks.view'] }, api, recordIdParam: 'id', fields: ['name', 'code', 'country', 'status', 'address'], page_actions: [{ id: 'back', type: 'navigate', label: 'Back', path: '/banks', variant: 'secondary' }, { id: 'edit', type: 'edit', label: 'Edit', icon: 'Pencil', path: '/banks/{id}/edit', permission: { any: ['banks.update'] } }], sections: [{ id: 'overview', title: 'Bank information', fields: [{ key: 'name', label: 'Name', type: 'text' }, { key: 'code', label: 'Code', type: 'text' }, { key: 'country', label: 'Country', type: 'text' }, { key: 'status', label: 'Status', type: 'badge', badgeVariants: { active: 'success', inactive: 'danger' } }, { key: 'address', label: 'Address', type: 'text' }, { key: 'created_at', label: 'Created', type: 'datetime' }] }] },
    { id: 'banks-edit', parentId: 'banks', title: 'Edit Bank', page_title: 'Edit Bank', type: 'edit', page_type: 'edit', path: '/banks/:id/edit', route: '/banks/:id/edit', authentication: { required: true }, permissions: { any: ['banks.update'] }, api, form: { ...form, submitLabel: 'Save Changes' }, recordIdParam: 'id' },
  ],
}

export const banksListConfig = validateConfig('banks list page', pageConfigSchema, raw)
export const banksCreateConfig = validateConfig('banks create page', pageConfigSchema, banksListConfig.sub_pages?.find((page) => page.type === 'create'))
export const banksDetailsConfig = validateConfig('banks details page', pageConfigSchema, banksListConfig.sub_pages?.find((page) => page.type === 'details'))
export const banksEditConfig = validateConfig('banks edit page', pageConfigSchema, banksListConfig.sub_pages?.find((page) => page.type === 'edit'))
