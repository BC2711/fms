import type { PropsWithChildren } from 'react'

interface FormFieldProps {
  name: string
  label: string
  required?: boolean
  error?: string
  description?: string
}

export function FormField({ name, label, required, error, description, children }: PropsWithChildren<FormFieldProps>) {
  return <div><label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">{label}{required && <span aria-hidden="true" className="ml-1 text-red-500">*</span>}</label>{children}{description && <p className="mt-1 text-xs text-gray-500">{description}</p>}{error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}</div>
}
