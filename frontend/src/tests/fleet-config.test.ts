import { describe, expect, it } from 'vitest'

import { fleetConfigs } from '@/config/modules/fleet/fleet.config'
import { getPageConfigByRoute } from '@/config/page-registry'

const menuSlugs = [
  'all-vehicles', 'add-vehicle', 'vehicle-categories', 'vehicle-groups', 'customer-vehicles', 'delivery-vehicles', 'tanker-trucks',
  'vehicle-documents', 'vehicle-fuel-limits', 'vehicle-allocations', 'vehicle-transactions', 'vehicle-maintenance', 'vehicle-inspections',
  'vehicle-tracking', 'all-drivers', 'driver-documents', 'driver-licences', 'driver-assignments', 'driver-fuel-limits',
  'driver-restrictions', 'driver-pin-management', 'driver-performance',
]

describe('fleet configuration', () => {
  it('registers every fleet menu API route and icon', () => {
    expect(fleetConfigs).toHaveLength(21)
    for (const slug of menuSlugs) expect(getPageConfigByRoute(`/fleet/${slug}`), slug).toBeDefined()
    for (const page of fleetConfigs) {
      const statistic = page.statistics?.[0]
      if (statistic?.type === 'statistic') expect(statistic.icon).toBe('Circle')
    }
  })

  it('uses the dedicated add route and appropriate sub-pages', () => {
    const vehicles = fleetConfigs.find((page) => page.id === 'fleet-all-vehicles')
    expect(vehicles?.sub_pages?.find((page) => page.type === 'create')?.path).toBe('/fleet/add-vehicle')
    const readOnly = new Set(['customer-vehicles', 'delivery-vehicles', 'tanker-trucks', 'vehicle-transactions', 'vehicle-tracking', 'driver-performance'])
    for (const page of fleetConfigs) {
      expect(page.api.endpoints.item?.path).toBe(`${page.path}/{id}`)
      expect(page.sub_pages?.some((child) => child.type === 'details')).toBe(true)
      const slug = page.id.replace('fleet-', '')
      expect(page.sub_pages?.some((child) => child.type === 'create')).toBe(!readOnly.has(slug))
      expect(page.sub_pages?.some((child) => child.type === 'edit')).toBe(!readOnly.has(slug))
    }
  })
})
