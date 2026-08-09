import type { DashboardPageConfig } from '@/types/configuration.types'

export const dashboardConfig = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'dashboard',
  page_type: 'dashboard',
  path: '/dashboard',
  route: '/dashboard',
  authentication: { required: true },
  api: {
    baseUrl: '/api',
    endpoints: { summary: { path: '/dashboard', method: 'GET' } },
    data_mapping: { type: 'item', item: 'data' },
  },
  widgets: [
    { id: 'items', type: 'statistic', title: 'Test Items', dataPath: 'summary.items', endpointKey: 'summary', icon: 'FlaskConical', format: 'number' },
    { id: 'accounts', type: 'statistic', title: 'Accounts', dataPath: 'summary.accounts', endpointKey: 'summary', icon: 'Users', format: 'number' },
    { id: 'stations', type: 'statistic', title: 'Stations', dataPath: 'summary.stations', endpointKey: 'summary', icon: 'Fuel', format: 'number' },
    { id: 'records', type: 'statistic', title: 'Operational Records', dataPath: 'summary.generated_records', endpointKey: 'summary', icon: 'Database', format: 'number' },
  ],
} satisfies DashboardPageConfig
