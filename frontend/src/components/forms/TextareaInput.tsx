import { forwardRef, type TextareaHTMLAttributes } from 'react'

export const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextareaInput(props, ref) {
  return <textarea ref={ref} {...props} className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 ${props.className ?? ''}`} />
})
