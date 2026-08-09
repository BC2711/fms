import { z } from 'zod'

import type { MenuItem } from '@/types/configuration.types'

import { permissionConfigSchema } from './common.schema'

export const menuItemSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z
    .object({
      id: z.string({ required_error: 'Menu item id is required' }).min(1, 'Menu item id cannot be empty'),
      label: z.string({ required_error: 'Menu item label is required' }).min(1, 'Menu item label cannot be empty'),
      path: z.string().min(1, 'Menu item path cannot be empty').optional(),
      route: z.string().min(1, 'Menu item route cannot be empty').optional(),
      icon: z.string().min(1, 'Menu item icon cannot be empty').optional(),
      badge: z.union([z.string(), z.number()]).optional(),
      type: z.enum(['item', 'divider', 'group']).optional(),
      is_visible: z.boolean().optional(),
      disabled: z.boolean().optional(),
      external: z.boolean().optional(),
      permissions: permissionConfigSchema.optional(),
      children: z.array(menuItemSchema).optional(),
    })
    .strict('Menu item contains an unknown property'),
)

export const layoutConfigSchema = z
  .object({
    navbar: z.object({ enabled: z.boolean({ required_error: 'Navbar enabled flag is required' }), fixed: z.boolean().optional(), logo: z.string().min(1, 'Navbar logo cannot be empty').optional(), showThemeToggle: z.boolean().optional(), showUserMenu: z.boolean().optional() }).strict('Navbar config contains an unknown property'),
    sidebar: z.object({ enabled: z.boolean({ required_error: 'Sidebar enabled flag is required' }), collapsible: z.boolean().optional(), defaultCollapsed: z.boolean().optional(), width: z.number().positive('Sidebar width must be positive').optional(), items: z.array(menuItemSchema, { required_error: 'Sidebar menu items are required' }) }).strict('Sidebar config contains an unknown property'),
  })
  .strict('Layout config contains an unknown property')

export type MenuItemSchemaType = z.infer<typeof menuItemSchema>
export type LayoutConfigSchemaType = z.infer<typeof layoutConfigSchema>
