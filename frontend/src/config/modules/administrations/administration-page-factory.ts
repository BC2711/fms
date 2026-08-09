import { createGeneratedResourcePage } from '@/config/generated-page-factory'
import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { ListPageConfig, PageConfig } from '@/types/configuration.types'

export function createAdministrationPage(resource: string, title: string): ListPageConfig {
  const page = createGeneratedResourcePage(`/administration/${resource}`, title)
  page.id = `administration-${resource}`
  const permission = `administration.${resource}`
  page.permissions = { any: [`${permission}.view`] }
  page.sub_pages?.forEach((subPage) => {
    subPage.id = `${page.id}-${subPage.type}`
    subPage.parentId = page.id
    const operation = subPage.type === 'details' ? 'view' : subPage.type
    subPage.permissions = { any: [`${permission}.${operation}`] }
  })
  return validateConfig(`${title} list page`, pageConfigSchema, page) as ListPageConfig
}

export function administrationSubPage<T extends PageConfig['type']>(page: ListPageConfig, type: T): Extract<PageConfig, { type: T }> {
  const subPage = page.sub_pages?.find((candidate) => candidate.type === type)
  if (!subPage) throw new Error(`${page.title} does not define a ${type} page`)
  return validateConfig(`${page.title} ${type} page`, pageConfigSchema, subPage) as Extract<PageConfig, { type: T }>
}
