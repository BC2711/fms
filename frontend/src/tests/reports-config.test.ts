import { describe, expect, it } from 'vitest'

import { getPageConfigByRoute } from '@/config/page-registry'
import { reportsConfigs } from '@/config/modules/reports/reports.config'

const slugs = ['reports-dashboard', 'sales-reports', 'transaction-reports', 'fuel-consumption-reports', 'inventory-reports', 'station-reports', 'customer-reports', 'omc-reports', 'vehicle-reports', 'driver-reports', 'card-reports', 'pos-reports', 'delivery-reports', 'payment-reports', 'financial-reports', 'reconciliation-reports', 'variance-reports', 'compliance-reports', 'audit-reports', 'performance-analytics', 'forecasting', 'kpi-dashboard', 'custom-report-builder', 'scheduled-reports', 'download-centre']

describe('reports configuration', () => {
  it('registers every Reports menu API route and icon', () => {
    expect(reportsConfigs).toHaveLength(25)
    for (const slug of slugs) expect(getPageConfigByRoute(`/reports/${slug}`), slug).toBeDefined()
    for (const page of reportsConfigs) {
      const statistic = page.statistics?.[0]
      if (statistic?.type === 'statistic') expect(statistic.icon).toBe('Circle')
    }
  })

  it('keeps report views read-only except builder and schedules', () => {
    const editable = new Set(['custom-report-builder', 'scheduled-reports'])
    for (const page of reportsConfigs) {
      expect(page.api.endpoints.item?.path).toBe(`${page.path}/{id}`)
      expect(page.sub_pages?.some((child) => child.type === 'details')).toBe(true)
      const slug = page.id.replace('reports-', '')
      expect(page.sub_pages?.some((child) => child.type === 'create')).toBe(editable.has(slug))
      expect(page.sub_pages?.some((child) => child.type === 'edit')).toBe(editable.has(slug))
    }
  })
})
