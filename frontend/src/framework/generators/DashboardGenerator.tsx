import { useState } from 'react'

import { OperationsDashboard } from '@/components/dashboard/OperationsDashboard'
import { SimpleChart } from '@/components/data-display/SimpleChart'
import { WidgetWrapper } from '@/components/data-display/WidgetWrapper'
import { DynamicComponent } from '@/framework/runtime/DynamicComponent'
import { StatisticsGenerator } from '@/framework/generators/StatisticsGenerator'
import { TableGenerator } from '@/framework/generators/TableGenerator'
import { useDynamicQuery } from '@/hooks/useDynamicQuery'
import type { DashboardPageConfig, DashboardWidgetConfig, StatisticConfig, TableDashboardWidgetConfig } from '@/types/configuration.types'

const gridSpans: Record<number, string> = {
  1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4', 5: 'lg:col-span-5', 6: 'lg:col-span-6',
  7: 'lg:col-span-7', 8: 'lg:col-span-8', 9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12',
}

function readPath<T>(data: Record<string, unknown>, path: string): T | undefined {
  return path.split('.').reduce<unknown>((value, segment) => value && typeof value === 'object' ? (value as Record<string, unknown>)[segment] : undefined, data) as T | undefined
}

function MiniTable({ widget, data, isLoading, error }: { widget: TableDashboardWidgetConfig; data: Record<string, unknown>; isLoading: boolean; error?: Error | null }) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: widget.table.pagination?.pageSize ?? 5 })
  const [sorting, setSorting] = useState<import('@tanstack/react-table').SortingState>([])
  const rows = readPath<Record<string, unknown>[]>(data, widget.dataPath) ?? []
  return <TableGenerator tableConfig={widget.table} data={rows} isLoading={isLoading} isError={Boolean(error)} error={error} pagination={pagination} onPaginationChange={setPagination} sorting={sorting} onSortingChange={setSorting} />
}

function WidgetContent({ widget, data, isLoading, error }: { widget: DashboardWidgetConfig; data: Record<string, unknown>; isLoading: boolean; error?: Error | null }) {
  if (widget.type === 'statistic') {
    const statistics: StatisticConfig[] = widget.statistics ?? [{ id: widget.id, label: widget.title, value_field: widget.dataPath, icon: widget.icon, format: widget.format }]
    return <WidgetWrapper title={widget.title} actions={widget.actions} error={error}><StatisticsGenerator statistics={statistics} data={data} isLoading={isLoading} /></WidgetWrapper>
  }
  if (widget.type === 'chart' || widget.type === 'line_chart' || widget.type === 'bar_chart') return <WidgetWrapper title={widget.title} actions={widget.actions} isLoading={isLoading} error={error}><SimpleChart title={widget.title} type={widget.type === 'chart' ? widget.chartType : widget.type} /></WidgetWrapper>
  if (widget.type === 'table') return <WidgetWrapper title={widget.title} actions={widget.actions} error={error}><MiniTable widget={widget} data={data} isLoading={isLoading} error={error} /></WidgetWrapper>
  if (widget.type === 'list') {
    const items = readPath<Record<string, unknown>[]>(data, widget.dataPath) ?? []
    return <WidgetWrapper title={widget.title} actions={widget.actions} isLoading={isLoading} error={error} isEmpty={!isLoading && items.length === 0}><ul className="divide-y divide-gray-100 dark:divide-gray-800">{items.map((item, index) => <li key={index} className="py-2 text-sm">{String(readPath(item, widget.labelPath) ?? '')}</li>)}</ul></WidgetWrapper>
  }
  if (widget.type === 'custom') return <WidgetWrapper title={widget.title} actions={widget.actions} isLoading={isLoading} error={error}><DynamicComponent<{ data: Record<string, unknown> }> componentKey={widget.componentKey} data={data} /></WidgetWrapper>
  return <WidgetWrapper title={widget.title} actions={widget.actions} error={error}><SimpleChart title={widget.title} /></WidgetWrapper>
}

function FetchedWidget({ dashboardConfig, widget }: { dashboardConfig: DashboardPageConfig; widget: DashboardWidgetConfig }) {
  const query = useDynamicQuery<Record<string, unknown>>({ pageConfig: dashboardConfig, endpointKey: widget.endpointKey, dataMapping: { type: 'item', item: 'data' } })
  return <WidgetContent widget={widget} data={query.data ?? {}} isLoading={query.isLoading} error={query.error} />
}

export function DashboardGenerator({ dashboardConfig }: { dashboardConfig: DashboardPageConfig }) {
  if (dashboardConfig.id === 'dashboard') return <OperationsDashboard config={dashboardConfig} />
  return <section className="space-y-5"><h1 className="text-3xl font-bold">{dashboardConfig.page_title ?? dashboardConfig.title}</h1>{dashboardConfig.description && <p className="text-gray-500">{dashboardConfig.description}</p>}<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">{dashboardConfig.widgets.map((widget) => {
    const canFetch = Boolean(dashboardConfig.api && widget.endpointKey && dashboardConfig.api.endpoints[widget.endpointKey])
    return <div key={widget.id} data-widget-type={widget.type} data-grid-columns={widget.grid?.columns ?? 6} className={`md:col-span-2 ${gridSpans[widget.grid?.columns ?? 6]}`}>{canFetch ? <FetchedWidget dashboardConfig={dashboardConfig} widget={widget} /> : <WidgetContent widget={widget} data={{}} isLoading={false} />}</div>
  })}</div></section>
}
