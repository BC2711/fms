import { TrendingDown, TrendingUp } from 'lucide-react'

import { DynamicIcon } from '@/framework/runtime/DynamicIcon'
import type { StatisticVariant } from '@/types/configuration.types'

const accents: Record<StatisticVariant, string> = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300',
  green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300',
  yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300',
}

interface StatCardProps {
  icon?: string
  label: string
  value: string | number
  isLoading: boolean
  variant?: StatisticVariant
  trend?: number
  trendLabel?: string
}

export function StatCard({ icon = 'Database', label, value, isLoading, variant = 'blue', trend, trendLabel }: StatCardProps) {
  return <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">{isLoading ? <div aria-label={`Loading ${label}`} className="animate-pulse"><div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" /><div className="mt-4 h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" /><div className="mt-3 h-8 w-20 rounded bg-gray-200 dark:bg-gray-700" /></div> : <><div className={`grid h-10 w-10 place-items-center rounded-full ${accents[variant]}`}><DynamicIcon iconKey={icon} size={20} /></div><p className="mt-3 text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">{value === '' || value === null || value === undefined ? 0 : value}</p>{trend !== undefined && <p className={`mt-2 flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>{trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{Math.abs(trend)}% {trendLabel}</p>}</>}</article>
}
