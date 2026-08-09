import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SearchFilterProps {
  label: string
  value: string
  placeholder?: string
  onValueChange: (value: string) => void
  debounceMs?: number
}

export function SearchFilter({ label, value, placeholder, onValueChange, debounceMs = 300 }: SearchFilterProps) {
  const [draft, setDraft] = useState(value)
  const lastEmitted = useRef(value)

  useEffect(() => { setDraft(value); lastEmitted.current = value }, [value])
  useEffect(() => {
    if (draft === lastEmitted.current) return
    const timeout = window.setTimeout(() => { lastEmitted.current = draft; onValueChange(draft) }, debounceMs)
    return () => window.clearTimeout(timeout)
  }, [debounceMs, draft, onValueChange])

  const clear = () => { setDraft(''); lastEmitted.current = ''; onValueChange('') }
  return <label className="min-w-56 flex-1 text-sm sm:max-w-xs"><span className="sr-only">{label}</span><span className="relative block"><Search aria-hidden="true" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input aria-label={label} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={placeholder ?? label} className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 dark:border-gray-700 dark:bg-gray-900" />{draft && <button type="button" aria-label={`Clear ${label}`} onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-700"><X size={15} /></button>}</span></label>
}
