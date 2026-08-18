import { describe, expect, it } from 'vitest'

import { fuelOperationConfigs } from '@/config/modules/fuel-operation/fuel-operations.config'
import { getPageConfigByRoute } from '@/config/page-registry'

describe('fuel operations configuration', () => {
  it('registers every fuel operations menu resource', () => {
    expect(fuelOperationConfigs).toHaveLength(19)
    for (const page of fuelOperationConfigs) expect(getPageConfigByRoute(page.path)).toBe(page)
  })

  it('uses the icon supplied by the menu API for each child resource', () => {
    for (const page of fuelOperationConfigs) {
      const statistic = page.statistics?.[0]
      expect(statistic?.type).toBe('statistic')
      if (statistic?.type === 'statistic') expect(statistic.icon).toBe('Circle')
    }
  })

  it('provides the required CRUD sub-pages and API contracts', () => {
    for (const page of fuelOperationConfigs) {
      expect(page.api.endpoints.list.path).toBe(page.path)
      expect(page.api.endpoints.item?.path).toBe(`${page.path}/{id}`)
      expect(page.sub_pages?.some((child) => child.type === 'details')).toBe(true)

      const readOnly = page.id === 'fuel-operations-inventory-overview' || page.id === 'fuel-operations-inventory-valuation'
      expect(page.sub_pages?.some((child) => child.type === 'create')).toBe(!readOnly)
      expect(page.sub_pages?.some((child) => child.type === 'edit')).toBe(!readOnly)
    }
  })
})
