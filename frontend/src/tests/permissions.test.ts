import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { hasPermission, hasRole } from '@/auth/permissions'
import { useAuthStore } from '@/auth/auth.store'
import type { User } from '@/auth/auth.types'
import { ActionGenerator } from '@/framework/generators/ActionGenerator'
import { PermissionGuard } from '@/framework/runtime/PermissionGuard'

const user: User = { id: '1', name: 'Viewer', email: 'viewer@example.com', role: 'viewer', permissions: ['banks.view'] }
describe('permissions', () => {
  beforeEach(() => useAuthStore.setState({ user, token: 'token', isAuthenticated: true, isLoading: false }))
  it('checks permissions and roles', () => { expect(hasPermission(user, 'banks.view')).toBe(true); expect(hasPermission(user, 'banks.delete')).toBe(false); expect(hasRole(user, 'viewer')).toBe(true); expect(hasRole(user, 'admin')).toBe(false) })
  it('PermissionGuard renders allowed children and hides denied children', () => { render(createElement('div', null, createElement(PermissionGuard, { permission: 'banks.view', children: 'Visible' }), createElement(PermissionGuard, { permission: 'banks.delete', children: 'Hidden' }))); expect(screen.getByText('Visible')).toBeInTheDocument(); expect(screen.queryByText('Hidden')).not.toBeInTheDocument() })
  it('action visibility respects permissions', () => { render(createElement(QueryClientProvider, { client: new QueryClient() }, createElement(MemoryRouter, null, createElement(ActionGenerator, { actions: [{ id: 'view', type: 'navigate', label: 'View', path: '/banks', permission: { any: ['banks.view'] } }, { id: 'delete', type: 'delete', label: 'Delete', endpoint: '/banks/1', permission: { any: ['banks.delete'] } }] })))); expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument(); expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument() })
})
