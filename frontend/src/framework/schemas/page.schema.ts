import { z } from 'zod'

import { apiConfigSchema } from './api.schema'
import { actionConfigSchema, permissionConfigSchema, stateConfigSchema } from './common.schema'
import { dashboardWidgetConfigSchema } from './dashboard.schema'
import { filterConfigSchema } from './filter.schema'
import { formConfigSchema } from './form.schema'
import { tableConfigSchema } from './table.schema'

const pageBase = {
  id: z.string({ required_error: 'Page id is required' }).min(1, 'Page id cannot be empty'),
  parentId: z.string().min(1, 'Parent page id cannot be empty').optional(),
  order: z.number().int('Page order must be an integer').optional(),
  layout: z.enum(['application', 'standalone']).optional(),
  title: z.string({ required_error: 'Page title is required' }).min(1, 'Page title cannot be empty'),
  page_title: z.string().min(1, 'Page display title cannot be empty').optional(),
  description: z.string().optional(),
  path: z.string({ required_error: 'Page path is required' }).min(1, 'Page path cannot be empty'),
  route: z.string().min(1, 'Page route cannot be empty').optional(),
  page_type: z.enum(['dashboard', 'list', 'create', 'edit', 'details']).optional(),
  authentication: z.object({ required: z.boolean({ required_error: 'Authentication required flag is required' }) }).strict('Authentication config contains an unknown property').optional(),
  permissions: permissionConfigSchema.optional(),
  actions: z.array(actionConfigSchema).optional(),
  page_actions: z.array(actionConfigSchema).optional(),
  breadcrumbs: z.array(z.object({ label: z.string().min(1, 'Breadcrumb label cannot be empty'), path: z.string().min(1, 'Breadcrumb path cannot be empty') }).strict('Breadcrumb contains an unknown property')).optional(),
  state: stateConfigSchema.optional(),
}

export const pageConfigSchema: z.ZodType<import('@/types/configuration.types').PageConfig> = z.lazy(() => {
  const nested = { sub_pages: z.array(pageConfigSchema).optional() }
  return z.discriminatedUnion('type', [
    z.object({ ...pageBase, ...nested, type: z.literal('dashboard'), api: apiConfigSchema.optional(), widgets: z.array(dashboardWidgetConfigSchema, { required_error: 'Dashboard widgets are required' }) }).strict('Dashboard page contains an unknown property'),
    z.object({ ...pageBase, ...nested, type: z.literal('list'), api: apiConfigSchema, table: tableConfigSchema, filters: z.array(filterConfigSchema).optional(), statistics: z.array(dashboardWidgetConfigSchema).optional() }).strict('List page contains an unknown property'),
    z.object({ ...pageBase, ...nested, type: z.literal('create'), api: apiConfigSchema, form: formConfigSchema }).strict('Create page contains an unknown property'),
    z.object({ ...pageBase, ...nested, type: z.literal('edit'), api: apiConfigSchema, form: formConfigSchema, recordIdParam: z.string().min(1, 'Edit page record id parameter is required') }).strict('Edit page contains an unknown property'),
    z.object({ ...pageBase, ...nested, type: z.literal('details'), api: apiConfigSchema, recordIdParam: z.string().min(1, 'Details page record id parameter is required'), fields: z.array(z.string().min(1, 'Details field cannot be empty')).min(1, 'Details page requires at least one field'), sections: z.array(z.object({ id: z.string().min(1), title: z.string().min(1), fields: z.array(z.object({ key: z.string().min(1), label: z.string().min(1), type: z.enum(['text', 'number', 'date', 'email', 'url', 'datetime', 'badge', 'boolean', 'image', 'file']), sensitive: z.boolean().optional(), copyable: z.boolean().optional(), badgeVariants: z.record(z.string(), z.enum(['success', 'danger', 'warning', 'info'])).optional() }).strict('Detail field contains an unknown property')).min(1) }).strict('Detail section contains an unknown property')).optional() }).strict('Details page contains an unknown property'),
  ])
})

export type PageConfigSchemaType = z.infer<typeof pageConfigSchema>
