import { describe, expect, it } from 'vitest'

import { applicationConfigSchema, validateConfig } from '@/framework/schemas'
import type { ApplicationConfig } from '@/types/configuration.types'
import { ConfigurationError } from '@/utils/errors'

const validConfig = {
  name: 'fms',
  title: 'Financial Management System',
  defaultRoute: '/dashboard',
  layout: {
    navbar: { enabled: true, showThemeToggle: true },
    sidebar: {
      enabled: true,
      collapsible: true,
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          path: '/dashboard',
          icon: 'LayoutDashboard',
          permissions: { any: ['dashboard.read'] },
          children: [{ id: 'overview', label: 'Overview', path: '/dashboard' }],
        },
      ],
    },
  },
  pages: [
    {
      id: 'dashboard',
      type: 'dashboard',
      title: 'Dashboard',
      path: '/dashboard',
      widgets: [
        { id: 'revenue', type: 'statistic', title: 'Revenue', dataPath: 'summary.revenue', format: 'currency' },
        { id: 'trend', type: 'chart', title: 'Trend', chartType: 'line', dataPath: 'trend', categoryPath: 'month', valuePaths: ['revenue'] },
      ],
      actions: [{ id: 'refresh', type: 'refresh', label: 'Refresh' }],
      state: { empty: { title: 'No dashboard data' } },
    },
  ],
} satisfies ApplicationConfig

describe('configuration validation', () => {
  it('returns a typed valid configuration', () => {
    const result: ApplicationConfig = validateConfig('application', applicationConfigSchema, validConfig)
    expect(result).toEqual(validConfig)
  })

  it('throws a descriptive ConfigurationError for invalid values', () => {
    const invalidConfig = { ...validConfig, title: 42 }

    expect(() => validateConfig('application', applicationConfigSchema, invalidConfig)).toThrow(ConfigurationError)

    try {
      validateConfig('application', applicationConfigSchema, invalidConfig)
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError)
      const configurationError = error as ConfigurationError
      expect(configurationError.configurationName).toBe('application')
      expect(configurationError.details[0]).toMatchObject({
        path: 'title',
        invalidValue: 42,
        expected: 'string',
        suggestion: 'Application title must be a string',
      })
      expect(configurationError.message).toContain('[application] title: invalid value 42; expected string')
      expect(configurationError.message).toContain('Suggestion: Application title must be a string')
    }
  })

  it('rejects unknown properties in nested config objects', () => {
    const invalidConfig = {
      ...validConfig,
      layout: { ...validConfig.layout, navbar: { ...validConfig.layout.navbar, unsupported: true } },
    }

    expect(() => validateConfig('application', applicationConfigSchema, invalidConfig)).toThrow(
      /layout\.navbar.*unknown property/i,
    )
  })
})
