import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { DashboardGenerator } from '@/framework/generators/DashboardGenerator'
import { StatisticsGenerator } from '@/framework/generators/StatisticsGenerator'
import { registerComponent } from '@/framework/registry/component-registry'
import type { DashboardPageConfig, StatisticConfig } from '@/types/configuration.types'

const statistics: StatisticConfig[] = [
  { id: 'revenue', label: 'Revenue', value_field: 'summary.revenue', icon: 'CreditCard', variant: 'green', trend_field: 'summary.trend', trend_label: 'from last month' },
  { id: 'empty', label: 'Empty value', value_field: 'summary.empty', icon: 'Inbox', variant: 'blue' },
]

describe('StatisticsGenerator', () => {
  it('renders mapped values, zero values, trends, and a responsive grid', () => {
    render(<StatisticsGenerator statistics={statistics} data={{ summary: { revenue: 1234, empty: 0, trend: 8 } }} isLoading={false} />)
    const grid = screen.getByRole('region', { name: 'Statistics' })
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-4')
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/8% from last month/)).toHaveClass('text-green-600')
  })

  it('shows pulsing statistic skeleton cards', () => {
    render(<StatisticsGenerator statistics={statistics} data={{}} isLoading />)
    expect(screen.getByLabelText('Loading Revenue')).toHaveClass('animate-pulse')
    expect(screen.getByLabelText('Loading Empty value')).toHaveClass('animate-pulse')
  })
})

describe('DashboardGenerator', () => {
  it('renders configured statistic, chart, table, list, and custom widgets', () => {
    registerComponent('dashboard-note', ({ data }: { data: Record<string, unknown> }) => <p>Custom widget {Object.keys(data).length}</p>)
    const dashboard: DashboardPageConfig = {
      id: 'dashboard-test', title: 'Operations Dashboard', type: 'dashboard', path: '/dashboard-test',
      widgets: [
        { id: 'stats', type: 'statistic', title: 'Key metrics', dataPath: 'summary.total', statistics, grid: { columns: 12 } },
        { id: 'line', type: 'line_chart', title: 'Monthly trend', grid: { columns: 6 } },
        { id: 'bar', type: 'bar_chart', title: 'Status totals', grid: { columns: 6 } },
        { id: 'table', type: 'table', title: 'Latest records', dataPath: 'items', grid: { columns: 8 }, table: { rowKey: 'id', columns: [{ id: 'name', type: 'text', header: 'Name', accessor: 'name' }] } },
        { id: 'list', type: 'list', title: 'Recent items', dataPath: 'items', labelPath: 'name', grid: { columns: 4 } },
        { id: 'custom', type: 'custom', title: 'Custom note', componentKey: 'dashboard-note', grid: { columns: 12 } },
      ],
    }
    render(<MemoryRouter><DashboardGenerator dashboardConfig={dashboard} /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Operations Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Chart: Monthly trend')).toBeInTheDocument()
    expect(screen.getByText('Chart: Status totals')).toBeInTheDocument()
    expect(screen.getByText('No records found')).toBeInTheDocument()
    expect(screen.getByText('No data available.')).toBeInTheDocument()
    expect(screen.getByText('Custom widget 0')).toBeInTheDocument()
    expect(document.querySelector('[data-widget-type="statistic"]')).toHaveAttribute('data-grid-columns', '12')
  })
})
