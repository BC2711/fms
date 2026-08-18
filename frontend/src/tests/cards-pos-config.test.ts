import { describe, expect, it } from 'vitest'

import { cardsPosConfigs } from '@/config/modules/cards-and-pos/cards-pos.config'
import { getPageConfigByRoute } from '@/config/page-registry'

const paths = {
  '/cards-pos-fuel-cards': ['card-dashboard', 'card-stock', 'issue-card', 'issued-cards', 'unassigned-cards', 'vehicle-cards', 'driver-cards', 'customer-cards', 'card-limits', 'card-restrictions', 'card-pin-management', 'activate-cards', 'blocked-cards', 'expired-cards', 'lost-or-stolen-cards', 'card-replacements', 'card-transactions', 'card-reconciliation'],
  '/cards-pos-devices': ['pos-dashboard', 'pos-devices', 'add-pos-device', 'pos-inventory', 'pos-assignments', 'assign-device', 'unassign-device', 'station-pos-devices', 'attendant-pos-devices', 'pos-transactions', 'pos-settlements', 'pos-reconciliation', 'pos-device-health', 'pos-maintenance', 'lost-or-damaged-devices'],
  '/cards-pos-attendants': ['all-attendants', 'pending-activation', 'active-attendants', 'suspended-attendants', 'station-assignments', 'pump-assignments', 'shift-assignments', 'pos-assignments', 'attendant-transactions', 'attendant-performance', 'attendant-reconciliation'],
}

describe('cards and POS configuration', () => {
  it('registers all 44 leaf menu API routes with matching icons', () => {
    expect(cardsPosConfigs).toHaveLength(41)
    const menuPaths = Object.entries(paths).flatMap(([root, slugs]) => slugs.map((slug) => `${root}/${slug}`))
    expect(menuPaths).toHaveLength(44)
    for (const path of menuPaths) expect(getPageConfigByRoute(path), path).toBeDefined()
    for (const page of cardsPosConfigs) {
      const statistic = page.statistics?.[0]
      if (statistic?.type === 'statistic') expect(statistic.icon).toBe('Circle')
    }
  })

  it('uses dedicated menu create routes and valid backend placeholders', () => {
    const createPaths = cardsPosConfigs.flatMap((page) => page.sub_pages?.filter((child) => child.type === 'create').map((child) => child.path) ?? [])
    expect(createPaths).toContain('/cards-pos-fuel-cards/issue-card')
    expect(createPaths).toContain('/cards-pos-devices/add-pos-device')
    expect(createPaths).toContain('/cards-pos-devices/assign-device')
    expect(cardsPosConfigs.find((page) => page.id === 'cards-pos-fuel-cards-card-stock')?.api.endpoints.create?.path).toBe('/cards-pos-fuel-cards/card-stock')
    expect(cardsPosConfigs.find((page) => page.id === 'cards-pos-devices-pos-devices')?.api.endpoints.create?.path).toBe('/cards-pos-devices/pos-devices')
    expect(cardsPosConfigs.find((page) => page.id === 'cards-pos-devices-pos-assignments')?.api.endpoints.create?.path).toBe('/cards-pos-devices/pos-assignments')
    for (const page of cardsPosConfigs) {
      expect(page.api.endpoints.item?.path).toBe(`${page.path}/{id}`)
      expect(page.sub_pages?.some((child) => child.type === 'details')).toBe(true)
    }
  })
})
