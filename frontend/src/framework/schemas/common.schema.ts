import { z } from 'zod'

const requiredString = (field: string) =>
  z.string({ required_error: `${field} is required`, invalid_type_error: `${field} must be a string` }).min(1, `${field} cannot be empty`)

export const permissionConfigSchema = z
  .object({
    all: z.array(requiredString('Permission')).optional(),
    any: z.array(requiredString('Permission')).optional(),
    roles: z.array(requiredString('Role')).optional(),
  })
  .strict('Permission config contains an unknown property')

export const actionConfigSchema = z
  .object({
    id: requiredString('Action id'),
    type: z.enum(['create', 'edit', 'delete', 'export', 'refresh', 'navigate'], {
      required_error: 'Action type is required',
      invalid_type_error: 'Action type must be create, edit, delete, export, refresh, or navigate',
    }),
    label: requiredString('Action label'),
    icon: z.string().min(1, 'Action icon cannot be empty').optional(),
    permission: permissionConfigSchema.optional(),
    endpoint: z.string().min(1, 'Action endpoint cannot be empty').optional(),
    path: z.string().min(1, 'Action path cannot be empty').optional(),
    confirmation: z.string().min(1, 'Confirmation message cannot be empty').optional(),
    format: z.enum(['csv', 'xlsx', 'json'], { invalid_type_error: 'Export format must be csv, xlsx, or json' }).optional(),
    variant: z.enum(['primary', 'secondary', 'danger', 'ghost'], { invalid_type_error: 'Action variant must be primary, secondary, danger, or ghost' }).optional(),
    requires_confirmation: z.boolean({ invalid_type_error: 'Action confirmation flag must be a boolean' }).optional(),
    confirmation_title: z.string().min(1, 'Confirmation title cannot be empty').optional(),
    success_message: z.string().min(1, 'Success message cannot be empty').optional(),
    error_message: z.string().min(1, 'Error message cannot be empty').optional(),
    redirect_after_success: z.string().min(1, 'Redirect path cannot be empty').optional(),
    disabled: z.boolean({ invalid_type_error: 'Action disabled flag must be a boolean' }).optional(),
  })
  .strict('Action config contains an unknown property')

export const stateMessageConfigSchema = z
  .object({
    title: requiredString('State title'),
    description: z.string().optional(),
    icon: z.string().min(1, 'State icon cannot be empty').optional(),
  })
  .strict('State message config contains an unknown property')

export const stateConfigSchema = z
  .object({
    loading: stateMessageConfigSchema.optional(),
    empty: stateMessageConfigSchema.optional(),
    error: stateMessageConfigSchema.optional(),
  })
  .strict('State config contains an unknown property')

export const paginationConfigSchema = z
  .object({
    enabled: z.boolean({ required_error: 'Pagination enabled flag is required' }),
    pageSize: z.number({ required_error: 'Pagination page size is required' }).int('Page size must be an integer').positive('Page size must be positive'),
    pageSizeOptions: z.array(z.number().int().positive('Page size options must be positive integers')).min(1, 'At least one page size option is required').optional(),
  })
  .strict('Pagination config contains an unknown property')

export const sortingConfigSchema = z
  .object({
    enabled: z.boolean({ required_error: 'Sorting enabled flag is required' }),
    defaultColumn: z.string().min(1, 'Default sort column cannot be empty').optional(),
    defaultDirection: z.enum(['asc', 'desc'], { invalid_type_error: 'Sort direction must be asc or desc' }).optional(),
  })
  .strict('Sorting config contains an unknown property')

export type PermissionConfigSchemaType = z.infer<typeof permissionConfigSchema>
export type ActionConfigSchemaType = z.infer<typeof actionConfigSchema>
export type StateConfigSchemaType = z.infer<typeof stateConfigSchema>
export type PaginationConfigSchemaType = z.infer<typeof paginationConfigSchema>
export type SortingConfigSchemaType = z.infer<typeof sortingConfigSchema>
