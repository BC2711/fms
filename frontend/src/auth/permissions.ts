import type { User } from '@/auth/auth.types'
import type { ActionConfig, PageConfig, PermissionConfig } from '@/types/configuration.types'

function isSuperAdmin(user: User | null | undefined): boolean {
  return user?.role === 'super_admin'
}

export function hasPermission(user: User | null | undefined, permission: string): boolean {
  if (isSuperAdmin(user)) return true
  return Boolean(user && (user.permissions.includes(permission) || user.permissions.includes('*')))
}

export function hasAnyPermission(user: User | null | undefined, permissions: string[]): boolean {
  if (isSuperAdmin(user)) return true
  return permissions.some((permission) => hasPermission(user, permission))
}

export function hasRole(user: User | null | undefined, role: string): boolean {
  if (isSuperAdmin(user)) return true
  return user?.role === role
}

export function hasAnyRole(user: User | null | undefined, roles: string[]): boolean {
  if (isSuperAdmin(user)) return true
  return roles.some((role) => hasRole(user, role))
}

function satisfiesPermissions(user: User | null | undefined, config?: PermissionConfig): boolean {
  if (isSuperAdmin(user)) return true
  if (!config) return true
  if (!user) return false
  if (config.all?.some((permission) => !hasPermission(user, permission))) return false
  if (config.any?.length && !hasAnyPermission(user, config.any)) return false
  if (config.roles?.length && !hasAnyRole(user, config.roles)) return false
  return true
}

export function canAccessPage(user: User | null | undefined, pageConfig: PageConfig): boolean {
  if (isSuperAdmin(user)) return true
  if (pageConfig.authentication?.required && !user) return false
  return satisfiesPermissions(user, pageConfig.permissions)
}

export function canExecuteAction(user: User | null | undefined, actionConfig: ActionConfig): boolean {
  return satisfiesPermissions(user, actionConfig.permission)
}
