const env = import.meta.env

export const API_BASE_URL = env.VITE_API_URL || '/api'

const backendRoutes = [
  ['/accounts/oil-marketing-companies', env.VITE_API_ROUTE_OIL_MARKETING_COMPANIES],
  ['/accounts/corporate-companies', env.VITE_API_ROUTE_CORPORATE_COMPANIES],
  ['/accounts/government-institutions', env.VITE_API_ROUTE_GOVERNMENT_INSTITUTIONS],
  ['/accounts/individuals', env.VITE_API_ROUTE_INDIVIDUALS],
  ['/accounts/aggregators', env.VITE_API_ROUTE_AGGREGATORS],
  ['/accounts/ngos', env.VITE_API_ROUTE_NGOS],
  ['/stations/station-price-boards', env.VITE_API_ROUTE_STATION_PRICE_BOARDS],
  ['/stations/station-inspections', env.VITE_API_ROUTE_STATION_INSPECTIONS],
  ['/stations/station-performance', env.VITE_API_ROUTE_STATION_PERFORMANCE],
  ['/stations/station-documents', env.VITE_API_ROUTE_STATION_DOCUMENTS],
  ['/stations/station-groups', env.VITE_API_ROUTE_STATION_GROUPS],
  ['/stations/station-types', env.VITE_API_ROUTE_STATION_TYPES],
  ['/administration', env.VITE_API_ROUTE_ADMINISTRATION],
  ['/test-items', env.VITE_API_ROUTE_TEST_ITEMS],
  ['/dashboard', env.VITE_API_ROUTE_DASHBOARD],
  ['/stations', env.VITE_API_ROUTE_STATIONS],
  ['/accounts', env.VITE_API_ROUTE_ACCOUNTS],
  ['/banks', env.VITE_API_ROUTE_BANKS],
  ['/auth', env.VITE_API_ROUTE_AUTH],
] as const

export function resolveBackendPath(path: string): string {
  if (!path.startsWith('/')) return path

  const match = backendRoutes.find(([configuredPath]) =>
    path === configuredPath || path.startsWith(`${configuredPath}/`) || path.startsWith(`${configuredPath}?`),
  )
  if (!match) return path

  const [configuredPath, environmentPath] = match
  return `${environmentPath || configuredPath}${path.slice(configuredPath.length)}`
}

export function resolveBackendBaseUrl(configuredBaseUrl?: string): string | undefined {
  return !configuredBaseUrl || configuredBaseUrl === '/api' ? API_BASE_URL : configuredBaseUrl
}
