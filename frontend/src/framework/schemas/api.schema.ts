import { z } from 'zod'

const endpointSchema = z
  .object({
    path: z.string({ required_error: 'Endpoint path is required' }).min(1, 'Endpoint path cannot be empty'),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], {
      required_error: 'HTTP method is required',
      invalid_type_error: 'HTTP method must be GET, POST, PUT, PATCH, or DELETE',
    }),
    headers: z.record(z.string(), z.string({ invalid_type_error: 'Header values must be strings' })).optional(),
    requestMappingPath: z.string().min(1, 'Request mapping path cannot be empty').optional(),
    responseMappingPath: z.string().min(1, 'Response mapping path cannot be empty').optional(),
  })
  .strict('API endpoint contains an unknown property')

export const apiConfigSchema = z
  .object({
    baseUrl: z.string().min(1, 'API base URL cannot be empty').optional(),
    headers: z.record(z.string(), z.string({ invalid_type_error: 'Header values must be strings' })).optional(),
    endpoints: z.record(z.string(), endpointSchema, { required_error: 'API endpoints are required' }),
    data_mapping: z.object({
      type: z.enum(['list', 'item', 'paginated']),
      items: z.string().min(1, 'Items mapping path cannot be empty').optional(),
      item: z.string().min(1, 'Item mapping path cannot be empty').optional(),
      total: z.string().min(1, 'Total mapping path cannot be empty').optional(),
      page: z.string().min(1, 'Page mapping path cannot be empty').optional(),
      pageSize: z.string().min(1, 'Page size mapping path cannot be empty').optional(),
    }).strict('Data mapping contains an unknown property').optional(),
  })
  .strict('API config contains an unknown property')

export type ApiEndpointConfigSchemaType = z.infer<typeof endpointSchema>
export type ApiConfigSchemaType = z.infer<typeof apiConfigSchema>
