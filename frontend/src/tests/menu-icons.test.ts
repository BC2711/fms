import { describe, expect, it } from 'vitest'
import { HelpCircle } from 'lucide-react'

import { getIcon } from '@/framework/registry/icon-registry'

const menuApiIcons = ['Car', 'ChartNoAxesCombined', 'Circle', 'CircleUserRound', 'CreditCard', 'Droplets', 'FolderTree', 'Fuel', 'Landmark', 'LayoutDashboard', 'Settings', 'ShieldCheck', 'ShoppingCart', 'SlidersHorizontal', 'Truck', 'Users']

describe('menu API icons', () => {
  it('registers every icon key returned by the menu API', () => {
    for (const icon of menuApiIcons) expect(getIcon(icon), icon).not.toBe(HelpCircle)
  })
})
