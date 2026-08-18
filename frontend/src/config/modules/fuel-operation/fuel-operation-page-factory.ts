import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { FormFieldConfig, ListPageConfig, PageConfig, TableColumnConfig } from '@/types/configuration.types'

export interface FuelOperationField {
  name: string
  label: string
  type?: FormFieldConfig['type']
  required?: boolean
  options?: { label: string; value: string }[]
}

export interface FuelOperationDefinition {
  slug: string
  title: string
  description: string
  icon?: string
  fields: FuelOperationField[]
  readOnly?: boolean
  routeRoot?: string
  idPrefix?: string
  createSlug?: string
  createId?: string
}

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'
const fuelOperationsPath = import.meta.env.VITE_API_ROUTE_FUEL_OPERATIONS || '/fuel-operations'
const statuses = [{ label: 'Active', value: 'active' }, { label: 'Pending', value: 'pending' }, { label: 'Completed', value: 'completed' }, { label: 'Inactive', value: 'inactive' }]

function detailType(field: FuelOperationField) {
  if (field.name === 'status') return 'badge' as const
  if (field.type === 'number' || field.type === 'currency') return 'number' as const
  if (field.type === 'date') return 'date' as const
  if (field.type === 'datetime') return 'datetime' as const
  return 'text' as const
}

function tableColumn(field: FuelOperationField): TableColumnConfig {
  const common = { id: field.name.replaceAll('_', '-'), header: field.label, accessor: field.name, sortable: true }
  if (field.name === 'status') return { ...common, type: 'badge', options: { active: 'success', completed: 'success', pending: 'warning', inactive: 'danger' } }
  if (field.type === 'currency') return { ...common, type: 'number', format: 'currency', currency: 'ZMW' }
  if (field.type === 'number') return { ...common, type: 'number' }
  if (field.type === 'date' || field.type === 'datetime') return { ...common, type: 'datetime' }
  return { ...common, type: 'text', searchable: ['name', 'code', 'reference'].includes(field.name) }
}

export function createFuelOperationPage(definition: FuelOperationDefinition): ListPageConfig {
  const routeRoot = definition.routeRoot ?? fuelOperationsPath
  const id = `${definition.idPrefix ?? 'fuel-operations'}-${definition.slug}`
  const path = `${routeRoot}/${definition.slug}`
  const createPath = definition.createSlug ? `${routeRoot}/${definition.createSlug}` : `${path}/create`
  const fields = definition.fields.some((field) => field.name === 'status') ? definition.fields : [...definition.fields, { name: 'status', label: 'Status', type: 'select' as const, options: statuses }]
  const api = {
    baseUrl: apiBaseUrl,
    data_mapping: { type: 'paginated' as const, items: 'data.items', total: 'data.total', page: 'data.page', pageSize: 'data.pageSize' },
    endpoints: {
      list: { path, method: 'GET' as const }, item: { path: `${path}/{id}`, method: 'GET' as const, responseMappingPath: 'data' },
      create: { path: createPath, method: 'POST' as const, responseMappingPath: 'data' }, update: { path: `${path}/{id}`, method: 'PUT' as const, responseMappingPath: 'data' }, delete: { path: `${path}/{id}`, method: 'DELETE' as const },
    },
  }
  const formFields: FormFieldConfig[] = fields.map((field) => ({ name: field.name, label: field.label, type: field.type ?? 'text', required: field.required, options: field.options ?? (field.name === 'status' ? statuses : undefined) }))
  const form = { cancelPath: path, resetEnabled: true, layout: { type: 'columns' as const, columns: 3 as const }, fields: formFields }
  const columns = fields.slice(0, 7).map(tableColumn)
  columns.push({ id: 'created-at', type: 'datetime', header: 'Created', accessor: 'created_at', sortable: true })
  if (!definition.readOnly) columns.push({ id: 'actions', type: 'actions', header: 'Actions', actions: [
    { id: 'view', type: 'navigate', label: 'View', icon: 'Eye', path: `${path}/{id}` }, { id: 'edit', type: 'edit', label: 'Edit', icon: 'Pencil', path: `${path}/{id}/edit` },
    { id: 'delete', type: 'delete', label: 'Delete', icon: 'Trash2', endpoint: `${path}/{id}`, requires_confirmation: true, confirmation: `Delete this ${definition.title.toLowerCase()} record?` },
  ] })
  const backAction = { id: 'back', type: 'navigate' as const, label: `Back to ${definition.title}`, icon: 'ArrowLeft', path, variant: 'secondary' as const }
  const subPages: PageConfig[] = [{ id: `${id}-details`, parentId: id, title: `${definition.title} Details`, page_title: `${definition.title} Details`, type: 'details', page_type: 'details', path: `${path}/:id`, route: `${path}/:id`, authentication: { required: true }, api, recordIdParam: 'id', fields: fields.map((field) => field.name), page_actions: [backAction], sections: [{ id: 'overview', title: definition.title, fields: fields.map((field) => ({ key: field.name, label: field.label, type: detailType(field) })) }] }]
  if (!definition.readOnly) {
    subPages.unshift({ id: definition.createId ?? `${id}-create`, parentId: id, title: `Add ${definition.title}`, page_title: `Add ${definition.title}`, type: 'create', page_type: 'create', path: createPath, route: createPath, authentication: { required: true }, api, form: { ...form, submitLabel: `Add ${definition.title}` }, page_actions: [backAction] })
    subPages.push({ id: `${id}-edit`, parentId: id, title: `Edit ${definition.title}`, page_title: `Edit ${definition.title}`, type: 'edit', page_type: 'edit', path: `${path}/:id/edit`, route: `${path}/:id/edit`, authentication: { required: true }, api, form: { ...form, submitLabel: 'Save Changes' }, recordIdParam: 'id', page_actions: [backAction] })
  }
  const page: PageConfig = {
    id, title: definition.title, page_title: definition.title, description: definition.description, type: 'list', page_type: 'list', path, route: path, authentication: { required: true }, api,
    statistics: [{ id: 'total', type: 'statistic', title: 'Total Records', dataPath: 'statistics.total', icon: 'Circle', format: 'number' }, { id: 'active', type: 'statistic', title: 'Active', dataPath: 'statistics.active', icon: 'CircleCheck', format: 'number' }, { id: 'pending', type: 'statistic', title: 'Pending', dataPath: 'statistics.pending', icon: 'Clock', format: 'number' }],
    filters: [{ id: 'search', type: 'search', label: 'Search', field: 'search', query_parameter: 'search', placeholder: `Search ${definition.title.toLowerCase()}` }, { id: 'status', type: 'select', label: 'Status', field: 'status', query_parameter: 'status', options: statuses }],
    table: { rowKey: 'id', stickyHeader: true, striped: true, pagination: { enabled: true, pageSize: 10, pageSizeOptions: [10, 20, 50, 100] }, sorting: { enabled: true, defaultColumn: 'created_at', defaultDirection: 'desc' }, columns },
    page_actions: definition.readOnly ? [] : [{ id: 'add', type: 'navigate', label: `Add ${definition.title}`, icon: 'Plus', path: createPath }], sub_pages: subPages,
  }
  return validateConfig(`${definition.title} list page`, pageConfigSchema, page) as ListPageConfig
}
