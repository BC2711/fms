import type { SelectOptionConfig } from '@/types/configuration.types'

interface SelectFilterProps {
  label: string
  value: string
  options: SelectOptionConfig[]
  onValueChange: (value: string) => void
}

export function SelectFilter({ label, value, options, onValueChange }: SelectFilterProps) {
  return <label className="min-w-40 text-sm"><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={(event) => onValueChange(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900"><option value="">All {label}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
}
