import { z } from 'zod'

import { actionConfigSchema, paginationConfigSchema, sortingConfigSchema } from './common.schema'

const columnBase = {
  id: z.string({ required_error: 'Column id is required' }).min(1, 'Column id cannot be empty'),
  header: z.string({ required_error: 'Column header is required' }).min(1, 'Column header cannot be empty'),
}

const columnFeatures = { sortable: z.boolean().optional(), searchable: z.boolean().optional(), visible: z.boolean().optional() }

export const tableColumnConfigSchema = z.discriminatedUnion('type', [
  z.object({ ...columnBase, ...columnFeatures, type: z.literal('text'), accessor: z.string().min(1, 'Text column accessor is required') }).strict('Text column contains an unknown property'),
  z.object({ ...columnBase, ...columnFeatures, type: z.literal('number'), accessor: z.string().min(1, 'Number column accessor is required'), format: z.enum(['decimal', 'currency', 'percent']).optional(), currency: z.string().min(3, 'Currency must be an ISO currency code').optional() }).strict('Number column contains an unknown property'),
  z.object({ ...columnBase, ...columnFeatures, type: z.literal('badge'), accessor: z.string().min(1, 'Badge column accessor is required'), variants: z.record(z.string(), z.string()).optional(), options: z.record(z.string(), z.enum(['success', 'danger', 'warning', 'info'])).optional() }).strict('Badge column contains an unknown property'),
  z.object({ ...columnBase, ...columnFeatures, type: z.literal('datetime'), accessor: z.string().min(1, 'Datetime column accessor is required'), format: z.string().min(1, 'Datetime format cannot be empty').optional() }).strict('Datetime column contains an unknown property'),
  z.object({ ...columnBase, type: z.literal('actions'), actions: z.array(actionConfigSchema).min(1, 'Actions column must contain at least one action'), visible: z.boolean().optional() }).strict('Actions column contains an unknown property'),
])

export const tableConfigSchema = z
  .object({
    columns: z.array(tableColumnConfigSchema, { required_error: 'Table columns are required' }).min(1, 'Table must contain at least one column'),
    rowKey: z.string({ required_error: 'Table row key is required' }).min(1, 'Table row key cannot be empty'),
    pagination: paginationConfigSchema.optional(),
    sorting: sortingConfigSchema.optional(),
    selectable: z.boolean().optional(),
    stickyHeader: z.boolean().optional(),
    striped: z.boolean().optional(),
  })
  .strict('Table config contains an unknown property')

export type TableColumnConfigSchemaType = z.infer<typeof tableColumnConfigSchema>
export type TableConfigSchemaType = z.infer<typeof tableConfigSchema>
