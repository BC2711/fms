import { describe, expect, it } from 'vitest'

import { getPageConfigByRoute } from '@/config/page-registry'
import { requestOrderConfigs } from '@/config/modules/request-and-orders/request-orders.config'

const menuPaths = [
  'all-fuel-requests', 'create-fuel-request', 'draft-requests', 'pending-requests', 'approved-requests', 'rejected-requests', 'fulfilled-requests',
  'all-orders', 'create-order', 'pending-orders', 'processing-orders', 'dispatched-orders', 'delivered-orders', 'cancelled-orders',
  'order-approvals', 'fuel-allocations', 'allocation-balances', 'allocation-usage',
].map((slug) => `/requests-orders/${slug}`)

describe('requests and orders configuration', () => {
  it('registers every menu API route with the menu icon contract', () => {
    expect(requestOrderConfigs).toHaveLength(16)
    for (const path of menuPaths) expect(getPageConfigByRoute(path), path).toBeDefined()
    for (const page of requestOrderConfigs) {
      const statistic = page.statistics?.[0]
      if (statistic?.type === 'statistic') expect(statistic.icon).toBe('Circle')
    }
  })

  it('uses dedicated create routes and valid API placeholders', () => {
    const requests = requestOrderConfigs.find((page) => page.id === 'requests-orders-all-fuel-requests')
    const orders = requestOrderConfigs.find((page) => page.id === 'requests-orders-all-orders')
    expect(requests?.sub_pages?.find((page) => page.type === 'create')?.path).toBe('/requests-orders/create-fuel-request')
    expect(orders?.sub_pages?.find((page) => page.type === 'create')?.path).toBe('/requests-orders/create-order')
    for (const page of requestOrderConfigs) expect(page.api.endpoints.item?.path).toBe(`${page.path}/{id}`)
  })
})
