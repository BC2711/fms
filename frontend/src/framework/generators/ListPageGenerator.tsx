import { useSearchParams } from 'react-router-dom'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'

import { useAuthStore } from '@/auth/auth.store'
import { PageHeader } from '@/components/navigation/PageHeader'
import { BreadcrumbGenerator } from '@/framework/generators/BreadcrumbGenerator'
import { FilterGenerator } from '@/framework/generators/FilterGenerator'
import { StatisticsGenerator } from '@/framework/generators/StatisticsGenerator'
import { TableGenerator } from '@/framework/generators/TableGenerator'
import type { ListPageConfig } from '@/types/configuration.types'
import { useDynamicQuery } from '@/hooks/useDynamicQuery'
import type { PaginatedResponse } from '@/services/response-mapper'

export function ListPageGenerator({ config }: { config: ListPageConfig }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.max(1, Number(searchParams.get('pageSize') ?? config.table.pagination?.pageSize ?? 10))
  const sort = searchParams.get('sort') ?? undefined
  const direction: 'asc' | 'desc' = searchParams.get('direction') === 'desc' ? 'desc' : 'asc'
  const authReady = useAuthStore((state) => !state.isLoading && state.isAuthenticated)
  const keys = useMemo(() => config.filters?.flatMap((filter) => filter.type === 'date_range' ? [filter.from_query_parameter ?? filter.fromField, filter.to_query_parameter ?? filter.toField] : [filter.query_parameter ?? filter.field]) ?? [], [config.filters])
  const readFilters = () => Object.fromEntries(keys.map((key) => [key, searchParams.get(key) ?? '']))
  const [filterValues, setFilterValues] = useState<Record<string, string>>(readFilters)
  useEffect(() => setFilterValues(readFilters()), [searchParams, keys])
  const activeFilters = useMemo(() => Object.fromEntries(Object.entries(filterValues).filter(([, value]) => value !== '')), [filterValues])
  const query = useDynamicQuery<PaginatedResponse<Record<string, unknown>>>({ pageConfig: config, filters: activeFilters, pagination: { page, pageSize }, sorting: sort ? { field: sort, direction } : undefined, enabled: authReady })

  return (
    <section className="space-y-5">
      <BreadcrumbGenerator config={config} />
      <PageHeader page_title={config.page_title ?? config.title} description={config.description} page_actions={config.page_actions ?? config.actions} />
      {config.statistics?.length && <StatisticsGenerator statistics={config.statistics.map((statistic) => statistic.type === 'statistic' ? (statistic.statistics?.[0] ?? { id: statistic.id, label: statistic.title, value_field: statistic.dataPath, icon: statistic.icon, format: statistic.format }) : { id: statistic.id, label: statistic.title, value_field: ('dataPath' in statistic && statistic.dataPath) ? statistic.dataPath : statistic.id })} data={(query.data ?? {}) as unknown as Record<string, unknown>} isLoading={query.isLoading} />}
      {config.filters?.length && <FilterGenerator filters={config.filters} values={filterValues} onChange={(changes) => setFilterValues((current) => ({ ...current, ...changes }))} />}
      <TableGenerator
        tableConfig={config.table}
        data={query.data?.items ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => { void query.refetch() }}
        pagination={{ pageIndex: page - 1, pageSize, total: query.data?.total }}
        sorting={sort ? [{ id: sort, desc: direction === 'desc' }] : []}
        onPaginationChange={(next: PaginationState) => {
          setSearchParams((current) => { const params = new URLSearchParams(current); params.set('page', String(next.pageIndex + 1)); params.set('pageSize', String(next.pageSize)); return params })
        }}
        onSortingChange={(next: SortingState) => {
          setSearchParams((current) => { const params = new URLSearchParams(current); if (next[0]) { params.set('sort', next[0].id); params.set('direction', next[0].desc ? 'desc' : 'asc') } else { params.delete('sort'); params.delete('direction') } params.set('page', '1'); return params })
        }}
      />
    </section>
  )
}
