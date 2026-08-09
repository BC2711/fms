import type { PageConfig } from '@/types/configuration.types'

export interface BreadcrumbItem {
  label: string
  path: string
}

function joinRoute(parent: string, child: string): string {
  if (child.startsWith('/')) return child
  return `${parent.replace(/\/$/, '')}/${child.replace(/^\//, '')}`
}

function flattenRoutes(configs: PageConfig[], parent = ''): Array<{ config: PageConfig; route: string }> {
  return configs.flatMap((config) => {
    const route = parent ? joinRoute(parent, config.route ?? config.path) : config.route ?? config.path
    return [{ config, route }, ...flattenRoutes(config.sub_pages ?? [], route)]
  })
}

export function findDuplicateRoutes(configs: PageConfig[]): string[] {
  const counts = new Map<string, number>()
  flattenRoutes(configs).forEach(({ route }) => counts.set(route, (counts.get(route) ?? 0) + 1))
  return [...counts].filter(([, count]) => count > 1).map(([route]) => route)
}

export function hasDuplicateRoutes(configs: PageConfig[]): boolean {
  return findDuplicateRoutes(configs).length > 0
}

export function interpolateRoute(template: string, params: Record<string, string | number>): string {
  return template
    .replace(/\{([^{}]+)\}/g, (match, key: string) => key in params ? encodeURIComponent(String(params[key])) : match)
    .replace(/:([A-Za-z0-9_]+)/g, (match, key: string) => key in params ? encodeURIComponent(String(params[key])) : match)
}

function matches(pattern: string, pathname: string): boolean {
  const expression = `^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:[A-Za-z0-9_]+/g, '[^/]+')}$`
  return new RegExp(expression).test(pathname)
}

export function generateBreadcrumbTrail(pathname: string, configs: PageConfig[]): BreadcrumbItem[] {
  const flattened = flattenRoutes(configs)
  const segments = pathname.split('/').filter(Boolean)
  const trail: BreadcrumbItem[] = []
  for (let index = 1; index <= segments.length; index += 1) {
    const currentPath = `/${segments.slice(0, index).join('/')}`
    const match = flattened.find(({ route }) => matches(route, currentPath))
    if (match) trail.push({ label: match.config.title, path: currentPath })
  }
  return trail
}
