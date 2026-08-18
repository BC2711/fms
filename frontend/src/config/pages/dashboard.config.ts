import type { DashboardPageConfig } from '@/types/configuration.types'

interface DashboardDefinition { id: string; title: string; path: string; description: string }

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'
const definitions: DashboardDefinition[] = [
  { id: 'dashboard', title: 'Operations Overview', path: '/dashboard', description: 'Live platform activity and authorized operational workflows.' },
  { id: 'dashboard-executive-dashboard', title: 'Executive Dashboard', path: '/dashboard/executive-dashboard', description: 'Enterprise performance, network coverage, and operational scale.' },
  { id: 'dashboard-operations-dashboard', title: 'Operations Dashboard', path: '/dashboard/operations-dashboard', description: 'Daily fuel operations, logistics, requests, and service activity.' },
  { id: 'dashboard-sales-dashboard', title: 'Sales Dashboard', path: '/dashboard/sales-dashboard', description: 'Sales activity, customer accounts, transactions, and channel performance.' },
  { id: 'dashboard-inventory-dashboard', title: 'Inventory Dashboard', path: '/dashboard/inventory-dashboard', description: 'Fuel stock, depot inventory, movement, and replenishment visibility.' },
  { id: 'dashboard-finance-dashboard', title: 'Finance Dashboard', path: '/dashboard/finance-dashboard', description: 'Financial activity, account funding, settlement, and reconciliation.' },
  { id: 'dashboard-fleet-dashboard', title: 'Fleet Dashboard', path: '/dashboard/fleet-dashboard', description: 'Vehicles, drivers, utilization, tracking, and fleet performance.' },
  { id: 'dashboard-station-performance', title: 'Station Performance', path: '/dashboard/station-performance', description: 'Station network health, throughput, inspections, and performance.' },
  { id: 'logistics-logistics-dashboard', title: 'Logistics Dashboard', path: '/logistics/logistics-dashboard', description: 'Dispatch, delivery, route, depot, and transporter operations.' },
  { id: 'cards-pos-fuel-cards-card-dashboard', title: 'Card Dashboard', path: '/cards-pos-fuel-cards/card-dashboard', description: 'Fuel card issuance, usage, controls, and lifecycle activity.' },
  { id: 'cards-pos-devices-pos-dashboard', title: 'POS Dashboard', path: '/cards-pos-devices/pos-dashboard', description: 'POS estate health, assignments, transactions, and terminal activity.' },
  { id: 'finance-transactions-transaction-dashboard', title: 'Transaction Dashboard', path: '/finance-transactions/transaction-dashboard', description: 'Transaction volumes, processing state, exceptions, and trends.' },
  { id: 'finance-funding-funding-dashboard', title: 'Funding Dashboard', path: '/finance-funding/funding-dashboard', description: 'Funding requests, deposits, allocations, and account balances.' },
  { id: 'compliance-compliance-dashboard', title: 'Compliance Dashboard', path: '/compliance/compliance-dashboard', description: 'Compliance posture, reviews, incidents, and regulatory activity.' },
  { id: 'reports-reports-dashboard', title: 'Reports Dashboard', path: '/reports/reports-dashboard', description: 'Operational reporting coverage and frequently used report areas.' },
  { id: 'reports-kpi-dashboard', title: 'KPI Dashboard', path: '/reports/kpi-dashboard', description: 'Key performance indicators across the fuel management network.' },
  { id: 'my-account-my-dashboard', title: 'My Dashboard', path: '/my-account/my-dashboard', description: 'Your account activity, access profile, and available workflows.' },
]

function createDashboard(definition: DashboardDefinition): DashboardPageConfig {
  return {
    ...definition, page_title: definition.title, type: 'dashboard', page_type: 'dashboard', route: definition.path,
    authentication: { required: true },
    api: { baseUrl: apiBaseUrl, endpoints: { summary: { path: '/dashboard', method: 'GET' } }, data_mapping: { type: 'item', item: 'data' } },
    widgets: [
      { id: `${definition.id}-accounts`, type: 'statistic', title: 'Accounts', dataPath: 'summary.accounts', endpointKey: 'summary', icon: 'Users', format: 'number' },
      { id: `${definition.id}-stations`, type: 'statistic', title: 'Stations', dataPath: 'summary.stations', endpointKey: 'summary', icon: 'Fuel', format: 'number' },
      { id: `${definition.id}-records`, type: 'statistic', title: 'Operational Records', dataPath: 'summary.generated_records', endpointKey: 'summary', icon: 'Database', format: 'number' },
    ],
  }
}

export const dashboardConfigs = definitions.map(createDashboard)
export const dashboardConfig = dashboardConfigs[0]
export const dashboardPageRegistry: Record<string, DashboardPageConfig> = Object.fromEntries(dashboardConfigs.map((config) => [config.id, config]))
export const dashboardConfigIds = new Set(dashboardConfigs.map((config) => config.id))
