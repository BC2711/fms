import { describe, expect, it } from 'vitest'

import { getPageConfigByRoute } from '@/config/page-registry'
import { settingsConfigs } from '@/config/modules/settings/settings.config'

describe('settings configuration', () => {
  it('registers all 58 Settings menu API routes and icons', () => {
    expect(settingsConfigs).toHaveLength(58)
    const counts = { '/settings-general/': 8, '/settings-interface/': 8, '/settings-operational/': 9, '/settings-security/': 7, '/settings-integrations/': 13, '/settings-system/': 13 }
    for (const [prefix, count] of Object.entries(counts)) expect(settingsConfigs.filter((page) => page.path.startsWith(prefix))).toHaveLength(count)
    for (const page of settingsConfigs) {
      expect(getPageConfigByRoute(page.path)).toBe(page)
      const statistic = page.statistics?.[0]
      if (statistic?.type === 'statistic') expect(statistic.icon).toBe('Circle')
    }
  })

  it('provides details and valid CRUD/API contracts', () => {
    const readOnlyIds = new Set(['settings-general-system-information', 'settings-integrations-integration-logs', 'settings-system-system-health', 'settings-system-service-status', 'settings-system-database-status', 'settings-system-cache-status', 'settings-system-error-logs', 'settings-system-application-logs', 'settings-system-storage-usage'])
    for (const page of settingsConfigs) {
      expect(page.api.endpoints.item?.path).toBe(`${page.path}/{id}`)
      expect(page.sub_pages?.some((child) => child.type === 'details')).toBe(true)
      expect(page.sub_pages?.some((child) => child.type === 'create')).toBe(!readOnlyIds.has(page.id))
      expect(page.sub_pages?.some((child) => child.type === 'edit')).toBe(!readOnlyIds.has(page.id))
    }
  })
})
