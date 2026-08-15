import { Navigate, useLocation } from 'react-router-dom'

import { getGeneratedRootPageByRoute } from '@/config/page-registry'
import { DetailsGenerator } from '@/framework/generators/DetailsGenerator'
import { FormPageGenerator } from '@/framework/generators/FormPageGenerator'
import { ListPageGenerator } from '@/framework/generators/ListPageGenerator'
import { NotFoundPage } from '@/framework/generators/RouteGenerator'
import { useAuthStore } from '@/auth/auth.store'
import { createGeneratedResourcePage } from '@/config/generated-page-factory'
import type { MenuItem } from '@/types/configuration.types'

function findMenu(items: MenuItem[], path: string): MenuItem | undefined {
  for (const item of items) {
    if (item.path && (item.path === path || path.startsWith(`${item.path}/`))) return item
    const nested = findMenu(item.children ?? [], path)
    if (nested) return nested
  }
}

export function GeneratedMenuPage() {
  const location = useLocation()
  const { pathname } = location
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const configured = getGeneratedRootPageByRoute(pathname)
  const menu = findMenu(user?.menus ?? [], pathname)
  const config = configured ?? (menu?.path ? createGeneratedResourcePage(menu.path, menu.label) : undefined)
  if (!config) return <NotFoundPage />
  if (isLoading) return <div role="status" className="p-8 text-center text-sm text-slate-500">Restoring your session…</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname, reason: 'authentication' }} replace />

  const suffix = pathname.slice(config.path.length)
  if (!suffix || suffix === '/') return <ListPageGenerator config={config} />

  const createConfig = config.sub_pages?.find((page) => page.type === 'create')
  if (suffix === '/create' && createConfig?.type === 'create') return <FormPageGenerator config={createConfig} mode="create" routeParams={{}} />

  const editMatch = suffix.match(/^\/([^/]+)\/edit\/?$/)
  const editConfig = config.sub_pages?.find((page) => page.type === 'edit')
  if (editMatch && editConfig?.type === 'edit') return <FormPageGenerator config={editConfig} mode="edit" routeParams={{ [editConfig.recordIdParam]: editMatch[1] }} />

  const detailsMatch = suffix.match(/^\/([^/]+)\/?$/)
  const detailsConfig = config.sub_pages?.find((page) => page.type === 'details')
  if (detailsMatch && detailsConfig?.type === 'details') return <DetailsGenerator pageConfig={detailsConfig} routeParams={{ [detailsConfig.recordIdParam]: detailsMatch[1] }} />

  return <NotFoundPage />
}
