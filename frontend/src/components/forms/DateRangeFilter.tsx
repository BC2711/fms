import { useState } from 'react'

interface DateRangeFilterProps {
  label: string
  from: string
  to: string
  onValueChange: (range: { from: string; to: string }) => void
}

export function DateRangeFilter({ label, from, to, onValueChange }: DateRangeFilterProps) {
  const [error, setError] = useState<string | null>(null)
  const update = (next: { from: string; to: string }) => {
    if (next.from && next.to && next.from > next.to) { setError('Start date must be before or equal to end date.'); return }
    setError(null)
    onValueChange(next)
  }
  return <div className="min-w-64"><div className="flex gap-2"><label className="text-xs text-gray-500">{label} from<input aria-label={`${label} from`} type="date" value={from} onChange={(event) => update({ from: event.target.value, to })} className="mt-1 block rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" /></label><label className="text-xs text-gray-500">{label} to<input aria-label={`${label} to`} type="date" value={to} onChange={(event) => update({ from, to: event.target.value })} className="mt-1 block rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" /></label></div>{error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}</div>
}
