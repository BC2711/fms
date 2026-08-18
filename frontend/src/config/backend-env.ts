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
  ['/fuel-operations', env.VITE_API_ROUTE_FUEL_OPERATIONS],
  ['/requests-orders', env.VITE_API_ROUTE_REQUESTS_ORDERS],
  ['/logistics', env.VITE_API_ROUTE_LOGISTICS],
  ['/fleet', env.VITE_API_ROUTE_FLEET],
  ['/cards-pos-fuel-cards', env.VITE_API_ROUTE_CARDS_POS_FUEL_CARDS],
  ['/cards-pos-devices', env.VITE_API_ROUTE_CARDS_POS_DEVICES],
  ['/cards-pos-attendants', env.VITE_API_ROUTE_CARDS_POS_ATTENDANTS],
  ['/finance-transactions', env.VITE_API_ROUTE_FINANCE_TRANSACTIONS],
  ['/finance-funding', env.VITE_API_ROUTE_FINANCE_FUNDING],
  ['/finance-payments', env.VITE_API_ROUTE_FINANCE_PAYMENTS],
  ['/finance-banking', env.VITE_API_ROUTE_FINANCE_BANKING],
  ['/compliance', env.VITE_API_ROUTE_COMPLIANCE],
  ['/reports', env.VITE_API_ROUTE_REPORTS],
  ['/my-account', env.VITE_API_ROUTE_MY_ACCOUNT],
  ['/settings-general', env.VITE_API_ROUTE_SETTINGS_GENERAL],
  ['/settings-interface', env.VITE_API_ROUTE_SETTINGS_INTERFACE],
  ['/settings-operational', env.VITE_API_ROUTE_SETTINGS_OPERATIONAL],
  ['/settings-security', env.VITE_API_ROUTE_SETTINGS_SECURITY],
  ['/settings-integrations', env.VITE_API_ROUTE_SETTINGS_INTEGRATIONS],
  ['/settings-system', env.VITE_API_ROUTE_SETTINGS_SYSTEM],
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
