import { describe, expect, it } from 'vitest'

import { getPageConfigByRoute } from '@/config/page-registry'
import { logisticsConfigs } from '@/config/modules/logistics/logistics.config'

const slugs = [
  'logistics-dashboard', 'depots', 'warehouses', 'delivery-requests', 'delivery-orders', 'dispatch-planning', 'delivery-schedule',
  'active-deliveries', 'delivery-routes', 'tanker-trucks', 'delivery-drivers', 'loading-records', 'offloading-records',
  'delivery-tracking', 'proof-of-delivery', 'delivery-exceptions', 'failed-deliveries', 'completed-deliveries', 'delivery-reconciliation',
]

describe('logistics configuration', () => {
  it('registers every logistics menu API route and icon', () => {
    expect(logisticsConfigs).toHaveLength(slugs.length)
    for (const slug of slugs) expect(getPageConfigByRoute(`/logistics/${slug}`), slug).toBeDefined()
    for (const page of logisticsConfigs) {
      const statistic = page.statistics?.[0]
      if (statistic?.type === 'statistic') expect(statistic.icon).toBe('Circle')
    }
  })

  it('provides details for every resource and CRUD for editable resources', () => {
    const readOnly = new Set(['logistics-dashboard', 'delivery-schedule', 'active-deliveries', 'delivery-tracking', 'failed-deliveries', 'completed-deliveries', 'delivery-reconciliation'])
    for (const page of logisticsConfigs) {
      expect(page.api.endpoints.item?.path).toBe(`${page.path}/{id}`)
      expect(page.sub_pages?.some((child) => child.type === 'details')).toBe(true)
      expect(page.sub_pages?.some((child) => child.type === 'create')).toBe(!readOnly.has(page.id.replace('logistics-', '')))
      expect(page.sub_pages?.some((child) => child.type === 'edit')).toBe(!readOnly.has(page.id.replace('logistics-', '')))
    }
  })
})
