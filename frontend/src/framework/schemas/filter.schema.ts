import { z } from 'zod'

const base = {
  id: z.string({ required_error: 'Filter id is required' }).min(1, 'Filter id cannot be empty'),
  label: z.string({ required_error: 'Filter label is required' }).min(1, 'Filter label cannot be empty'),
}

const optionSchema = z.object({ label: z.string().min(1, 'Option label cannot be empty'), value: z.union([z.string(), z.number()]) }).strict('Filter option contains an unknown property')

export const filterConfigSchema = z.discriminatedUnion('type', [
  z.object({ ...base, type: z.literal('search'), field: z.string().min(1, 'Search field is required'), query_parameter: z.string().min(1, 'Search query parameter cannot be empty').optional(), placeholder: z.string().optional() }).strict('Search filter contains an unknown property'),
  z.object({ ...base, type: z.literal('select'), field: z.string().min(1, 'Select field is required'), query_parameter: z.string().min(1, 'Select query parameter cannot be empty').optional(), options: z.array(optionSchema) }).strict('Select filter contains an unknown property'),
  z.object({ ...base, type: z.literal('date_range'), fromField: z.string().min(1, 'Date range from field is required'), toField: z.string().min(1, 'Date range to field is required'), from_query_parameter: z.string().min(1, 'From query parameter cannot be empty').optional(), to_query_parameter: z.string().min(1, 'To query parameter cannot be empty').optional() }).strict('Date range filter contains an unknown property'),
])

export type FilterConfigSchemaType = z.infer<typeof filterConfigSchema>
