import { RotateCcw } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { DateRangeFilter } from '@/components/forms/DateRangeFilter'
import { SearchFilter } from '@/components/forms/SearchFilter'
import { SelectFilter } from '@/components/forms/SelectFilter'
import type { FilterConfig } from '@/types/configuration.types'

export type FilterValues = Record<string, string>

export interface FilterGeneratorProps {
  filters: FilterConfig[]
  values: FilterValues
  onChange: (changes: FilterValues) => void
  className?: string
}

function filterKeys(filters: FilterConfig[]): string[] {
  return filters.flatMap((filter) => filter.type === 'date_range'
    ? [filter.from_query_parameter ?? filter.fromField, filter.to_query_parameter ?? filter.toField]
    : [filter.query_parameter ?? filter.field])
}

export function FilterGenerator({ filters, values, onChange, className = '' }: FilterGeneratorProps) {
  const [, setSearchParams] = useSearchParams()
  const apply = (changes: FilterValues) => {
    onChange(changes)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(changes).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key) })
      next.set('page', '1')
      return next
    })
  }
  const reset = () => apply(Object.fromEntries(filterKeys(filters).map((key) => [key, ''])))

  return (
    <section aria-label="Filters" className={`flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:flex-wrap sm:items-end ${className}`}>
      {filters.map((filter) => {
        if (filter.type === 'search') {
          const key = filter.query_parameter ?? filter.field
          return <SearchFilter key={filter.id} label={filter.label} value={values[key] ?? ''} placeholder={filter.placeholder} onValueChange={(value) => apply({ [key]: value })} />
        }
        if (filter.type === 'select') {
          const key = filter.query_parameter ?? filter.field
          return <SelectFilter key={filter.id} label={filter.label} value={values[key] ?? ''} options={filter.options} onValueChange={(value) => apply({ [key]: value })} />
        }
        const fromKey = filter.from_query_parameter ?? filter.fromField
        const toKey = filter.to_query_parameter ?? filter.toField
        return <DateRangeFilter key={filter.id} label={filter.label} from={values[fromKey] ?? ''} to={values[toKey] ?? ''} onValueChange={(range) => apply({ [fromKey]: range.from, [toKey]: range.to })} />
      })}
      <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"><RotateCcw size={15} />Reset</button>
    </section>
  )
}
