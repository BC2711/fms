import { describe, expect, it } from 'vitest'

import { dashboardConfigs } from '@/config/pages/dashboard.config'
import { getPageConfigByRoute } from '@/config/page-registry'

const dashboardRoutes = [
  '/dashboard', '/dashboard/executive-dashboard', '/dashboard/operations-dashboard', '/dashboard/sales-dashboard',
  '/dashboard/inventory-dashboard', '/dashboard/finance-dashboard', '/dashboard/fleet-dashboard', '/dashboard/station-performance',
  '/logistics/logistics-dashboard', '/cards-pos-fuel-cards/card-dashboard', '/cards-pos-devices/pos-dashboard',
  '/finance-transactions/transaction-dashboard', '/finance-funding/funding-dashboard', '/compliance/compliance-dashboard',
  '/reports/reports-dashboard', '/reports/kpi-dashboard', '/my-account/my-dashboard',
]

describe('dashboard page configuration', () => {
  it('registers every dashboard route from the menu API as a dashboard page', () => {
    expect(dashboardConfigs.map((config) => config.path)).toEqual(dashboardRoutes)
    for (const route of dashboardRoutes) {
      const config = getPageConfigByRoute(route)
      expect(config?.type, route).toBe('dashboard')
      expect(config?.api?.endpoints.summary?.path, route).toBe(route === '/dashboard' ? '/dashboard' : `/dashboard/${config?.id}`)
    }
  })
})
