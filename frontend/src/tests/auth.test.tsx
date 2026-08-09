import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  canAccessPage,
  canExecuteAction,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
} from '@/auth/permissions'
import { useAuthStore } from '@/auth/auth.store'
import type { User } from '@/auth/auth.types'
import { PermissionGuard } from '@/framework/runtime/PermissionGuard'
import type { ActionConfig, PageConfig } from '@/types/configuration.types'

const user: User = {
  id: '1',
  name: 'Manager',
  email: 'manager@example.com',
  role: 'manager',
  permissions: ['banks.read', 'banks.edit'],
}

const page: PageConfig = {
  id: 'banks',
  type: 'dashboard',
  title: 'Banks',
  path: '/banks',
  authentication: { required: true },
  permissions: { all: ['banks.read'], roles: ['manager'] },
  widgets: [],
}

const action: ActionConfig = {
  id: 'edit-bank',
  type: 'edit',
  label: 'Edit',
  permission: { all: ['banks.edit'] },
}

describe('authentication and authorization', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
    localStorage.clear()
  })

  it('checks permissions, roles, pages, and actions', () => {
    expect(hasPermission(user, 'banks.read')).toBe(true)
    expect(hasPermission(user, 'banks.delete')).toBe(false)
    expect(hasAnyPermission(user, ['banks.delete', 'banks.edit'])).toBe(true)
    expect(hasRole(user, 'manager')).toBe(true)
    expect(hasAnyRole(user, ['auditor', 'manager'])).toBe(true)
    expect(canAccessPage(user, page)).toBe(true)
    expect(canAccessPage(null, page)).toBe(false)
    expect(canExecuteAction(user, action)).toBe(true)
    expect(canExecuteAction({ ...user, permissions: [] }, action)).toBe(false)
  })

  it('persists and removes the token through store actions', () => {
    useAuthStore.getState().login('access-token', user)
    expect(useAuthStore.getState()).toMatchObject({ token: 'access-token', user, isAuthenticated: true })
    expect(localStorage.getItem('fms.access_token')).toBe('access-token')

    useAuthStore.getState().logout()
    expect(useAuthStore.getState()).toMatchObject({ token: null, user: null, isAuthenticated: false })
    expect(localStorage.getItem('fms.access_token')).toBeNull()
  })

  it('shows or hides guarded content and supports a fallback', () => {
    useAuthStore.setState({ user, token: 'token', isAuthenticated: true, isLoading: false })
    const { rerender } = render(
      <PermissionGuard permission="banks.read" role="manager"><span>Allowed</span></PermissionGuard>,
    )
    expect(screen.getByText('Allowed')).toBeInTheDocument()

    rerender(
      <PermissionGuard permission="banks.delete" fallback={<span>Denied</span>}>
        <span>Hidden</span>
      </PermissionGuard>,
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
    expect(screen.getByText('Denied')).toBeInTheDocument()
  })

  it('lets a super admin bypass every authorization check', () => {
    const superAdmin: User = { ...user, role: 'super_admin', permissions: [] }
    expect(hasPermission(superAdmin, 'anything')).toBe(true)
    expect(hasAnyPermission(superAdmin, [])).toBe(true)
    expect(hasRole(superAdmin, 'any-role')).toBe(true)
    expect(hasAnyRole(superAdmin, [])).toBe(true)
    expect(canAccessPage(superAdmin, { ...page, permissions: { all: ['missing'] } })).toBe(true)
    expect(canExecuteAction(superAdmin, { ...action, permission: { all: ['missing'] } })).toBe(true)

    useAuthStore.setState({ user: superAdmin, token: 'token', isAuthenticated: true, isLoading: false })
    render(<PermissionGuard permission="missing" role="missing"><span>Super access</span></PermissionGuard>)
    expect(screen.getByText('Super access')).toBeInTheDocument()
  })
})
