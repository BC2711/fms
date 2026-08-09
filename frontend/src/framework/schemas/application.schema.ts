import { z } from 'zod'

import { layoutConfigSchema } from './layout.schema'
import { pageConfigSchema } from './page.schema'

export const applicationConfigSchema = z
  .object({
    name: z.string({ required_error: 'Application name is required', invalid_type_error: 'Application name must be a string' }).min(1, 'Application name cannot be empty'),
    title: z.string({ required_error: 'Application title is required', invalid_type_error: 'Application title must be a string' }).min(1, 'Application title cannot be empty'),
    description: z.string().optional(),
    version: z.string().min(1, 'Application version cannot be empty').optional(),
    basePath: z.string().min(1, 'Application base path cannot be empty').optional(),
    defaultRoute: z.string({ required_error: 'Default route is required', invalid_type_error: 'Default route must be a string' }).min(1, 'Default route cannot be empty'),
    layout: layoutConfigSchema,
    pages: z.array(pageConfigSchema, { required_error: 'Application pages are required' }).min(1, 'Application must define at least one page'),
  })
  .strict('Application config contains an unknown property')

export type ApplicationConfigSchemaType = z.infer<typeof applicationConfigSchema>
