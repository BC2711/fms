import { describe, expect, it } from 'vitest'

import { myAccountConfigs } from '@/config/modules/my-account/my-account.config'
import { getPageConfigByRoute } from '@/config/page-registry'

const slugs = ['my-dashboard', 'my-profile', 'my-organization', 'my-vehicles', 'my-drivers', 'my-fuel-cards', 'my-fuel-requests', 'my-orders', 'my-deliveries', 'my-transactions', 'my-payments', 'my-invoices', 'my-statements', 'my-documents', 'my-notifications', 'my-support-tickets', 'change-password', 'security-settings', 'logout']

describe('my account configuration', () => {
  it('registers every My Account menu API route and icon', () => {
    expect(myAccountConfigs).toHaveLength(19)
    for (const slug of slugs) expect(getPageConfigByRoute(`/my-account/${slug}`), slug).toBeDefined()
    for (const page of myAccountConfigs) {
      const statistic = page.statistics?.[0]
      if (statistic?.type === 'statistic') expect(statistic.icon).toBe('Circle')
    }
  })

  it('provides valid details and self-service CRUD contracts', () => {
    const editable = new Set(['my-profile', 'my-vehicles', 'my-drivers', 'my-fuel-requests', 'my-documents', 'my-support-tickets', 'change-password', 'security-settings'])
    for (const page of myAccountConfigs) {
      expect(page.api.endpoints.item?.path).toBe(`${page.path}/{id}`)
      expect(page.sub_pages?.some((child) => child.type === 'details')).toBe(true)
      const slug = page.id.replace('my-account-', '')
      expect(page.sub_pages?.some((child) => child.type === 'create')).toBe(editable.has(slug))
      expect(page.sub_pages?.some((child) => child.type === 'edit')).toBe(editable.has(slug))
    }
  })
})
