import type { DashboardPageConfig } from '@/types/configuration.types'

export const dashboardConfig = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'dashboard',
  page_type: 'dashboard',
  path: '/dashboard',
  route: '/dashboard',
  authentication: { required: true },
  widgets: [
    { id: 'items', type: 'statistic', title: 'Test Items', dataPath: 'summary.items', icon: 'FlaskConical', format: 'number' },
  ],
} satisfies DashboardPageConfig
