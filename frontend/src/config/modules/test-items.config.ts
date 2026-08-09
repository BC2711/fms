import testItemsJson from './test-items.json'

import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { CreatePageConfig, DetailsPageConfig, EditPageConfig, ListPageConfig, PageConfig } from '@/types/configuration.types'

const backendConfig = JSON.parse(
  JSON.stringify(testItemsJson[0]).replaceAll('https://api.example.com', '/api'),
) as unknown
const moduleConfig = validateConfig('test-items module', pageConfigSchema, backendConfig)
if (moduleConfig.type !== 'list') throw new Error('The first test-items configuration must be a list page.')

function subPage<T extends PageConfig['type']>(type: T): Extract<PageConfig, { type: T }> {
  const config = moduleConfig.sub_pages?.find((page) => page.type === type)
  if (!config) throw new Error(`The test-items module does not define a ${type} page.`)
  return validateConfig(`test-items ${type} page`, pageConfigSchema, config) as Extract<PageConfig, { type: T }>
}

export const testItemsListConfig = moduleConfig as ListPageConfig
export const testItemsCreateConfig = subPage('create') as CreatePageConfig
export const testItemsDetailsConfig = subPage('details') as DetailsPageConfig
export const testItemsEditConfig = subPage('edit') as EditPageConfig
export const testItemsConfigs = [testItemsListConfig, testItemsCreateConfig, testItemsDetailsConfig, testItemsEditConfig] as const
