import { forwardRef, type InputHTMLAttributes } from 'react'

export const DateInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function DateInput(props, ref) {
  return <input ref={ref} type="date" {...props} className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 ${props.className ?? ''}`} />
})
