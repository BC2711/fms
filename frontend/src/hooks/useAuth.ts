import { useCallback } from 'react'

import {
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
} from '@/auth/permissions'
import { useAuthStore } from '@/auth/auth.store'

export function useAuth() {
  return useAuthStore()
}

export function usePermissions() {
  const user = useAuthStore((state) => state.user)

  return {
    hasPermission: useCallback((permission: string) => hasPermission(user, permission), [user]),
    hasAnyPermission: useCallback((permissions: string[]) => hasAnyPermission(user, permissions), [user]),
    hasRole: useCallback((role: string) => hasRole(user, role), [user]),
    hasAnyRole: useCallback((roles: string[]) => hasAnyRole(user, roles), [user]),
  }
}
