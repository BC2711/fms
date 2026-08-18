import { describe, expect, it } from 'vitest'

import { financeConfigs } from '@/config/modules/finance/finance.config'
import { getPageConfigByRoute } from '@/config/page-registry'
import { dashboardConfigIds } from '@/config/pages/dashboard.config'

describe('finance configuration', () => {
  it('registers all 50 Finance menu leaves with menu icons', () => {
    expect(financeConfigs).toHaveLength(49)
    expect(getPageConfigByRoute('/banks')).toBeDefined()
    expect(financeConfigs.length + 1).toBe(50)
    for (const page of financeConfigs) {
      const registered = getPageConfigByRoute(page.path)
      if (dashboardConfigIds.has(page.id)) expect(registered?.type).toBe('dashboard')
      else expect(registered).toBe(page)
      const statistic = page.statistics?.[0]
      if (statistic?.type === 'statistic') expect(statistic.icon).toBe('Circle')
    }
  })

  it('provides details and valid API placeholders for every Finance resource', () => {
    for (const page of financeConfigs) {
      expect(page.path).toMatch(/^\/finance-(transactions|funding|payments|banking)\//)
      expect(page.api.endpoints.item?.path).toBe(`${page.path}/{id}`)
      expect(page.sub_pages?.some((child) => child.type === 'details')).toBe(true)
    }
  })
})
