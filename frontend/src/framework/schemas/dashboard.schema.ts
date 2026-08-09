import { z } from 'zod'

import { actionConfigSchema } from './common.schema'
import { tableConfigSchema } from './table.schema'

const widgetBase = {
  id: z.string({ required_error: 'Widget id is required' }).min(1, 'Widget id cannot be empty'),
  title: z.string({ required_error: 'Widget title is required' }).min(1, 'Widget title cannot be empty'),
  dataPath: z.string({ required_error: 'Widget data path is required' }).min(1, 'Widget data path cannot be empty'),
}

const gridSchema = z.object({ columns: z.number().int().min(1).max(12) }).strict('Widget grid contains an unknown property')
const widgetFeatures = { endpointKey: z.string().min(1).optional(), grid: gridSchema.optional(), actions: z.array(actionConfigSchema).optional() }
const statisticSchema = z.object({ id: z.string().min(1), label: z.string().min(1), value_field: z.string().min(1), icon: z.string().min(1).optional(), trend_field: z.string().min(1).optional(), trend_label: z.string().optional(), variant: z.enum(['blue', 'green', 'red', 'yellow', 'purple']).optional(), format: z.enum(['number', 'currency', 'percent']).optional() }).strict('Statistic contains an unknown property')

export const dashboardWidgetConfigSchema = z.discriminatedUnion('type', [
  z.object({ ...widgetBase, ...widgetFeatures, type: z.literal('statistic'), icon: z.string().min(1, 'Widget icon cannot be empty').optional(), format: z.enum(['number', 'currency', 'percent']).optional(), statistics: z.array(statisticSchema).optional() }).strict('Statistic widget contains an unknown property'),
  z.object({ ...widgetBase, ...widgetFeatures, type: z.literal('chart'), chartType: z.enum(['line', 'bar', 'pie', 'area'], { invalid_type_error: 'Chart type must be line, bar, pie, or area' }), categoryPath: z.string().min(1, 'Chart category path is required'), valuePaths: z.array(z.string().min(1, 'Chart value path cannot be empty')).min(1, 'Chart requires at least one value path') }).strict('Chart widget contains an unknown property'),
  z.object({ id: z.string().min(1), type: z.enum(['line_chart', 'bar_chart']), title: z.string().min(1), dataPath: z.string().min(1).optional(), ...widgetFeatures }).strict('Simple chart widget contains an unknown property'),
  z.object({ id: z.string().min(1), type: z.literal('table'), title: z.string().min(1), table: tableConfigSchema, dataPath: z.string().min(1), ...widgetFeatures }).strict('Table widget contains an unknown property'),
  z.object({ id: z.string().min(1), type: z.literal('list'), title: z.string().min(1), dataPath: z.string().min(1), labelPath: z.string().min(1), ...widgetFeatures }).strict('List widget contains an unknown property'),
  z.object({ id: z.string().min(1), type: z.literal('custom'), title: z.string().min(1), componentKey: z.string().min(1), dataPath: z.string().min(1).optional(), ...widgetFeatures }).strict('Custom widget contains an unknown property'),
])

export type DashboardWidgetConfigSchemaType = z.infer<typeof dashboardWidgetConfigSchema>
