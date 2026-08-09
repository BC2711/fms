import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { PageConfig } from '@/types/configuration.types'

const raw: PageConfig = {
  id: 'register',
  layout: 'standalone',
  title: 'Create account',
  page_title: 'Create your account',
  description: 'Register for access to FMS.',
  type: 'create',
  page_type: 'create',
  path: '/register',
  route: '/register',
  api: {
    baseUrl: '/api',
    endpoints: {
      create: { path: '/auth/register', method: 'POST' },
    },
  },
  form: {
    submitLabel: 'Create account',
    successPath: '/login',
    cancelEnabled: false,
    fields: [
      { name: 'name', type: 'text', label: 'Full name', required: true, validation: { min_length: 2, max_length: 100 } },
      { name: 'email', type: 'email', label: 'Email address', placeholder: 'you@example.com', required: true },
      { name: 'password', type: 'password', label: 'Password', required: true, validation: { min_length: 8 } },
      { name: 'password_confirmation', type: 'password', label: 'Confirm password', required: true, validation: { min_length: 8 } },
    ],
  },
}

export const registerConfig = validateConfig('register page', pageConfigSchema, raw)
