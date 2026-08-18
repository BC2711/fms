import { describe, expect, it } from 'vitest'

import { complianceConfigs } from '@/config/modules/compliance/compliance.config'
import { getPageConfigByRoute } from '@/config/page-registry'

const slugs = ['compliance-dashboard', 'kyc-verification', 'kyb-verification', 'customer-risk-profiles', 'transaction-monitoring', 'suspicious-transactions', 'fuel-variance-investigations', 'regulatory-reports', 'licence-management', 'insurance-management', 'risk-register', 'compliance-inspections', 'compliance-incidents', 'fraud-reports', 'audit-logs', 'user-activity-logs', 'security-events', 'login-attempts']

describe('compliance configuration', () => {
  it('registers every Compliance menu API route and icon', () => {
    expect(complianceConfigs).toHaveLength(18)
    for (const slug of slugs) expect(getPageConfigByRoute(`/compliance/${slug}`), slug).toBeDefined()
    for (const page of complianceConfigs) {
      const statistic = page.statistics?.[0]
      if (statistic?.type === 'statistic') expect(statistic.icon).toBe('Circle')
    }
  })

  it('provides valid details and CRUD contracts', () => {
    const readOnly = new Set(['compliance-dashboard', 'transaction-monitoring', 'regulatory-reports', 'audit-logs', 'user-activity-logs', 'security-events', 'login-attempts'])
    for (const page of complianceConfigs) {
      expect(page.api.endpoints.item?.path).toBe(`${page.path}/{id}`)
      expect(page.sub_pages?.some((child) => child.type === 'details')).toBe(true)
      const slug = page.id.replace('compliance-', '')
      expect(page.sub_pages?.some((child) => child.type === 'create')).toBe(!readOnly.has(slug))
      expect(page.sub_pages?.some((child) => child.type === 'edit')).toBe(!readOnly.has(slug))
    }
  })
})
