import { createGeneratedResourcePage } from '@/config/generated-page-factory'
import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { ListPageConfig, PageConfig } from '@/types/configuration.types'

interface ParentReference {
  field: 'country_id' | 'province_id' | 'district_id'
  label: string
  endpoint: string
}

export function createAdministrationPage(resource: string, title: string, parent?: ParentReference): ListPageConfig {
  const page = createGeneratedResourcePage(`/administration/${resource}`, title)
  page.id = `administration-${resource}`
  const permission = `administration.${resource}`
  page.permissions = { any: [`${permission}.view`] }
  page.sub_pages?.forEach((subPage) => {
    subPage.id = `${page.id}-${subPage.type}`
    subPage.parentId = page.id
    const operation = subPage.type === 'details' ? 'view' : subPage.type
    subPage.permissions = { any: [`${permission}.${operation}`] }
    if (parent && (subPage.type === 'create' || subPage.type === 'edit')) {
      subPage.form.fields.splice(2, 0, {
        name: parent.field,
        type: 'select',
        label: parent.label,
        required: true,
        options: [],
        options_endpoint: parent.endpoint,
        option_label: 'name',
        option_value: 'id',
      })
    }
    if (parent && subPage.type === 'details') {
      subPage.fields.splice(2, 0, parent.field)
      subPage.sections[0]?.fields.splice(2, 0, { key: parent.field, label: parent.label, type: 'text' })
    }
  })
  if (parent) {
    page.table.columns.splice(2, 0, { id: parent.field, type: 'text', header: parent.label, accessor: parent.field, sortable: false })
  }
  return validateConfig(`${title} list page`, pageConfigSchema, page) as ListPageConfig
}

export function administrationSubPage<T extends PageConfig['type']>(page: ListPageConfig, type: T): Extract<PageConfig, { type: T }> {
  const subPage = page.sub_pages?.find((candidate) => candidate.type === type)
  if (!subPage) throw new Error(`${page.title} does not define a ${type} page`)
  return validateConfig(`${page.title} ${type} page`, pageConfigSchema, subPage) as Extract<PageConfig, { type: T }>
}
