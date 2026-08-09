import { getPageConfig } from '@/config/page-registry'
import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'

export function usePageConfig(pageKey: string) {
  const config = getPageConfig(pageKey)
  if (!config) throw new Error(`Page configuration "${pageKey}" is not registered.`)
  return validateConfig(pageKey, pageConfigSchema, config)
}
