import { forwardRef, type SelectHTMLAttributes } from 'react'

import type { SelectOptionConfig } from '@/types/configuration.types'

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOptionConfig[]
  placeholder?: string
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput({ options, placeholder, ...props }, ref) {
  return <select ref={ref} {...props} className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 ${props.className ?? ''}`}><option value="">{placeholder ?? 'Select an option'}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
})
