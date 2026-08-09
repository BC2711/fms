import { Link, useLocation } from 'react-router-dom'

import { generateBreadcrumbTrail } from '@/app/router/route-utils'
import { getAllPageConfigs } from '@/config/page-registry'
import type { PageConfig } from '@/types/configuration.types'

export function BreadcrumbGenerator({ config }: { config: PageConfig }) {
  const location = useLocation()
  const configured = config.breadcrumbs
  const automatic = generateBreadcrumbTrail(location.pathname, getAllPageConfigs())
  const crumbs = configured?.length ? configured : automatic
  const trail = [{ label: 'Home', path: '/dashboard' }, ...crumbs.filter((crumb) => !(crumb.path === '/dashboard' && crumb.label === 'Home'))]

  return (
    <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">{trail.map((crumb, index) => <li key={`${crumb.path}-${index}`} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true">›</span>}{index === trail.length - 1 ? <span aria-current="page" className="font-medium text-gray-900 dark:text-white">{crumb.label}</span> : <Link to={crumb.path} className="hover:text-blue-600">{crumb.label}</Link>}</li>)}</ol></nav>
  )
}
