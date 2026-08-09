import { createGeneratedResourcePage } from '@/config/generated-page-factory'
import { menuConfig } from '@/config/menu.config'
import type { FormFieldConfig, ListPageConfig, MenuItem } from '@/types/configuration.types'

const commonFields: FormFieldConfig[] = [
  { name: 'name', type: 'text', label: 'Setting Name', required: true },
  { name: 'code', type: 'text', label: 'Setting Key', required: true, description: 'Stable key used by backend services.' },
  { name: 'value', type: 'text', label: 'Value', required: true },
  { name: 'data_type', type: 'select', label: 'Value Type', default_value: 'string', options: [
    { label: 'Text', value: 'string' }, { label: 'Number', value: 'number' }, { label: 'Boolean', value: 'boolean' }, { label: 'JSON', value: 'json' },
  ] },
  { name: 'status', type: 'select', label: 'Status', default_value: 'active', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] },
  { name: 'description', type: 'textarea', label: 'Description', rows: 4, grid: { columns: 12 } },
]

const integrationFields: FormFieldConfig[] = [
  { name: 'name', type: 'text', label: 'Integration Name', required: true },
  { name: 'code', type: 'text', label: 'Provider Key', required: true },
  { name: 'endpoint_url', type: 'url', label: 'Endpoint URL' },
  { name: 'api_key', type: 'password', label: 'API Key / Secret', description: 'Stored as a protected configuration value.' },
  { name: 'timeout_seconds', type: 'number', label: 'Timeout (seconds)', default_value: 30 },
  { name: 'environment', type: 'select', label: 'Environment', default_value: 'sandbox', options: [{ label: 'Sandbox', value: 'sandbox' }, { label: 'Production', value: 'production' }] },
  { name: 'status', type: 'select', label: 'Status', default_value: 'active', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] },
  { name: 'description', type: 'textarea', label: 'Notes', rows: 3, grid: { columns: 12 } },
]

function settingsPage(item: MenuItem): ListPageConfig {
  const page = createGeneratedResourcePage(item.path!, item.label)
  page.id = item.id
  page.authentication = { required: true }
  page.permissions = { any: ['settings.view'] }
  page.description = `Configure ${item.label.toLowerCase()} for the Fuel Management System.`
  page.statistics = [
    { id: 'total', type: 'statistic', title: 'Total Settings', dataPath: 'statistics.total', icon: 'Settings', format: 'number' },
    { id: 'active', type: 'statistic', title: 'Active', dataPath: 'statistics.active', icon: 'CircleCheck', format: 'number' },
    { id: 'inactive', type: 'statistic', title: 'Inactive', dataPath: 'statistics.inactive', icon: 'CircleOff', format: 'number' },
  ]
  const fields = item.path!.startsWith('/settings-integrations/') ? integrationFields : commonFields
  page.sub_pages?.forEach((subPage) => {
    subPage.id = `${item.id}-${subPage.type}`
    subPage.parentId = item.id
    subPage.authentication = { required: true }
    const operation = subPage.type === 'details' ? 'view' : subPage.type
    subPage.permissions = { any: [`settings.${operation}`] }
    if (subPage.type === 'create' || subPage.type === 'edit') {
      subPage.form = { layout: { type: 'columns', columns: 2 }, fields, cancelPath: item.path, resetEnabled: true, submitLabel: subPage.type === 'create' ? 'Add Setting' : 'Save Setting' }
    }
    if (subPage.type === 'details') {
      subPage.fields = fields.filter((field) => field.type !== 'password').map((field) => field.name)
      subPage.sections = [{ id: 'configuration', title: 'Configuration', fields: fields.filter((field) => field.type !== 'password').map((field) => ({ key: field.name, label: field.label, type: field.type === 'checkbox' ? 'boolean' as const : 'text' as const })) }]
    }
  })
  return page
}

const settingsMenu = menuConfig.find((item) => item.id === 'settings')
const leaves = settingsMenu?.children?.flatMap((section) => section.children ?? []) ?? []

export const settingsPageRegistry: Record<string, ListPageConfig> = Object.fromEntries(leaves.map((item) => [item.id, settingsPage(item)]))
