import { z } from 'zod'

const optionSchema = z
  .object({
    label: z.string({ required_error: 'Option label is required' }).min(1, 'Option label cannot be empty'),
    value: z.union([z.string(), z.number()], { invalid_type_error: 'Option value must be a string or number' }),
  })
  .strict('Select option contains an unknown property')

const validationRuleSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    min_length: z.number().int().nonnegative().optional(),
    max_length: z.number().int().nonnegative().optional(),
    pattern: z.string().min(1, 'Validation pattern cannot be empty').optional(),
    message: z.string().min(1, 'Validation message cannot be empty').optional(),
  })
  .strict('Field validation contains an unknown property')

export const formFieldConfigSchema = z
  .object({
    name: z.string({ required_error: 'Field name is required' }).min(1, 'Field name cannot be empty'),
    type: z.enum(['text', 'email', 'password', 'url', 'number', 'select', 'textarea', 'date', 'datetime', 'checkbox', 'radio', 'hidden', 'currency', 'time', 'file'], {
      required_error: 'Field type is required',
      invalid_type_error: 'Field type is not supported',
    }),
    label: z.string({ required_error: 'Field label is required' }).min(1, 'Field label cannot be empty'),
    placeholder: z.string().optional(),
    description: z.string().optional(),
    required: z.boolean().optional(),
    disabled: z.boolean().optional(),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    default_value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    section: z.string().min(1, 'Section label cannot be empty').optional(),
    rows: z.number().int().positive('Textarea rows must be positive').optional(),
    grid: z.object({ columns: z.number().int().min(1, 'Grid columns must be at least 1').max(12, 'Grid columns cannot exceed 12') }).strict('Field grid contains an unknown property').optional(),
    options: z.array(optionSchema).optional(),
    validation: validationRuleSchema.optional(),
  })
  .strict('Form field contains an unknown property')
  .superRefine((field, context) => {
    if (field.type === 'radio' && !field.options?.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: `${field.type} fields require options` })
    }
  })

export const formConfigSchema = z
  .object({
    fields: z.array(formFieldConfigSchema, { required_error: 'Form fields are required' }).min(1, 'Form must contain at least one field'),
    layout: z.discriminatedUnion('type', [
      z.object({ type: z.literal('rows') }).strict('Rows layout contains an unknown property'),
      z.object({ type: z.literal('columns'), columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]) }).strict('Columns layout contains an unknown property'),
    ]).optional(),
    submitLabel: z.string().min(1, 'Submit label cannot be empty').optional(),
    successPath: z.string().min(1, 'Success path cannot be empty').optional(),
    cancelPath: z.string().min(1, 'Cancel path cannot be empty').optional(),
    cancelEnabled: z.boolean().optional(),
    resetEnabled: z.boolean().optional(),
    cancelLabel: z.string().min(1, 'Cancel label cannot be empty').optional(),
    resetLabel: z.string().min(1, 'Reset label cannot be empty').optional(),
  })
  .strict('Form config contains an unknown property')

export type SelectOptionConfigSchemaType = z.infer<typeof optionSchema>
export type FormFieldConfigSchemaType = z.infer<typeof formFieldConfigSchema>
export type FormConfigSchemaType = z.infer<typeof formConfigSchema>
