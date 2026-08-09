import type { PropsWithChildren } from 'react'

export function DataTable({ children, stickyHeader = false }: PropsWithChildren<{ stickyHeader?: boolean }>) {
  return <div data-sticky-header={stickyHeader || undefined} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"><div className="overflow-x-auto">{children}</div></div>
}
