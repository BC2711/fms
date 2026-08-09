import type { ReactNode } from 'react'

import { hasAnyPermission, hasAnyRole, hasPermission } from '@/auth/permissions'
import { useAuthStore } from '@/auth/auth.store'
import { usePermissions } from '@/hooks/useAuth'
import type { PermissionConfig } from '@/types/configuration.types'

export interface PermissionGuardProps {
  children: ReactNode
  permission?: string
  role?: string
  permissions?: PermissionConfig
  fallback?: ReactNode
}

export function PermissionGuard({ children, permission, role, permissions: rules, fallback = null }: PermissionGuardProps) {
  const permissions = usePermissions()
  const user = useAuthStore((state) => state.user)
  const permitted = (!permission || permissions.hasPermission(permission))
    && (!role || permissions.hasRole(role))
    && (!rules?.all?.some((required) => !hasPermission(user, required)))
    && (!rules?.any?.length || hasAnyPermission(user, rules.any))
    && (!rules?.roles?.length || hasAnyRole(user, rules.roles))

  return permitted ? children : fallback
}
