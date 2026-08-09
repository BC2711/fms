import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { PageConfig } from '@/types/configuration.types'

const raw: PageConfig = {
  id: 'forgot-password',
  layout: 'standalone',
  title: 'Forgot password',
  page_title: 'Reset your password',
  description: 'Enter your email address and we will send you reset instructions.',
  type: 'create',
  page_type: 'create',
  path: '/forgot-password',
  route: '/forgot-password',
  api: {
    baseUrl: '/api',
    endpoints: {
      create: { path: '/auth/forgot-password', method: 'POST' },
    },
  },
  form: {
    submitLabel: 'Send reset instructions',
    successPath: '/login',
    cancelEnabled: false,
    fields: [
      { name: 'email', type: 'email', label: 'Email address', placeholder: 'you@example.com', required: true },
    ],
  },
}

export const forgetPasswordConfig = validateConfig('forgot password page', pageConfigSchema, raw)
