import type { ZodError, ZodIssue } from 'zod'

export interface ConfigurationErrorDetail {
  path: string
  invalidValue: unknown
  expected: string
  suggestion: string
}

function valueAtPath(input: unknown, path: (string | number)[]): unknown {
  return path.reduce<unknown>((value, segment) => {
    if (value !== null && typeof value === 'object') return (value as Record<string | number, unknown>)[segment]
    return undefined
  }, input)
}

function expectedFromIssue(issue: ZodIssue): string {
  switch (issue.code) {
    case 'invalid_type': return issue.expected
    case 'invalid_enum_value': return `one of: ${issue.options.join(', ')}`
    case 'invalid_literal': return JSON.stringify(issue.expected)
    case 'unrecognized_keys': return 'known properties only'
    case 'too_small': return `${issue.type} meeting the minimum constraint`
    case 'too_big': return `${issue.type} meeting the maximum constraint`
    case 'invalid_union_discriminator': return `one of: ${issue.options.join(', ')}`
    default: return 'a valid configuration value'
  }
}

function displayValue(value: unknown): string {
  if (value === undefined) return 'undefined'
  try { return JSON.stringify(value) } catch { return String(value) }
}

export class ConfigurationError extends Error {
  readonly configurationName: string
  readonly details: ConfigurationErrorDetail[]

  constructor(configurationName: string, error: ZodError, input: unknown) {
    const details = error.issues.map((issue) => {
      const path = issue.path.length ? issue.path.join('.') : '<root>'
      return {
        path,
        invalidValue: valueAtPath(input, issue.path),
        expected: expectedFromIssue(issue),
        suggestion: issue.message,
      }
    })
    const formatted = details.map((detail) =>
      `[${configurationName}] ${detail.path}: invalid value ${displayValue(detail.invalidValue)}; expected ${detail.expected}. Suggestion: ${detail.suggestion}`,
    )
    super(`Invalid configuration "${configurationName}":\n${formatted.join('\n')}`)
    this.name = 'ConfigurationError'
    this.configurationName = configurationName
    this.details = details
  }
}
