import { StatCard } from '@/components/data-display/StatCard'
import type { StatisticConfig } from '@/types/configuration.types'

interface StatisticsGeneratorProps {
  statistics: StatisticConfig[]
  data: Record<string, unknown>
  isLoading: boolean
}

function formatValue(value: unknown, format?: StatisticConfig['format']): string | number {
  const number = Number(value ?? 0)
  if (format === 'currency') return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(number)
  if (format === 'percent') return new Intl.NumberFormat(undefined, { style: 'percent' }).format(number)
  if (typeof value === 'number') return new Intl.NumberFormat().format(value)
  return value === undefined || value === null || value === '' ? '0' : String(value)
}

function readPath(data: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, segment) => value && typeof value === 'object' ? (value as Record<string, unknown>)[segment] : undefined, data)
}

export function StatisticsGenerator({ statistics, data, isLoading }: StatisticsGeneratorProps) {
  return <section aria-label="Statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{statistics.map((statistic) => {
    const value = readPath(data, statistic.value_field)
    const trendValue = statistic.trend_field ? Number(readPath(data, statistic.trend_field)) : undefined
    return <StatCard key={statistic.id} icon={statistic.icon} label={statistic.label} value={formatValue(value, statistic.format)} isLoading={isLoading} variant={statistic.variant} trend={Number.isFinite(trendValue) ? trendValue : undefined} trendLabel={statistic.trend_label} />
  })}</section>
}
