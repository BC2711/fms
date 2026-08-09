import type { ReactNode } from 'react'

import { ActionGenerator } from '@/framework/generators/ActionGenerator'
import type { ActionConfig } from '@/types/configuration.types'

interface WidgetWrapperProps {
  title: string
  actions?: ActionConfig[]
  isLoading?: boolean
  error?: Error | null
  isEmpty?: boolean
  children: ReactNode
}

export function WidgetWrapper({ title, actions = [], isLoading, error, isEmpty, children }: WidgetWrapperProps) {
  return <section className="relative h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"><header className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800"><h2 className="font-semibold">{title}</h2>{actions.length > 0 && <div className="flex gap-1">{actions.map((action) => <ActionGenerator key={action.id} action={action} />)}</div>}</header><div className="p-4">{error ? <div role="alert" className="text-sm text-red-600">{error.message}</div> : isEmpty ? <p className="py-8 text-center text-sm text-gray-500">No data available.</p> : children}</div>{isLoading && <div className="absolute inset-0 grid place-items-center bg-white/60 text-sm text-gray-500 backdrop-blur-sm dark:bg-gray-900/60">Loading…</div>}</section>
}
