import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { PageConfig } from '@/types/configuration.types'

const raw: PageConfig = {
  id: 'login',
  layout: 'standalone',
  title: 'Sign in',
  page_title: 'Sign in to your account',
  description: 'Enter your credentials to continue to FMS.',
  type: 'create',
  page_type: 'create',
  path: '/login',
  route: '/login',
  api: {
    baseUrl: '/api',
    endpoints: {
      create: { path: '/auth/login', method: 'POST' },
    },
  },
  form: {
    submitLabel: 'Sign in',
    successPath: '/dashboard',
    cancelEnabled: false,
    fields: [
      { name: 'email', type: 'email', label: 'Email address', placeholder: 'you@example.com', required: true },
      { name: 'password', type: 'password', label: 'Password', required: true, validation: { min_length: 8 } },
    ],
  },
}

export const loginConfig = validateConfig('login page', pageConfigSchema, raw)
