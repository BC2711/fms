import type { z } from 'zod'

import { ConfigurationError } from '@/utils/errors'

export function validateConfig<TSchema extends z.ZodTypeAny>(
  configurationName: string,
  schema: TSchema,
  input: unknown,
): z.infer<TSchema> {
  const result = schema.safeParse(input)
  if (!result.success) throw new ConfigurationError(configurationName, result.error, input)
  return result.data
}
