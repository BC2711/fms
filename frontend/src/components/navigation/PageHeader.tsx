import { ActionGenerator } from '@/framework/generators/ActionGenerator'
import type { ActionConfig } from '@/types/configuration.types'

interface PageHeaderProps {
  page_title: string
  description?: string
  page_actions?: ActionConfig[]
}

export function PageHeader({ page_title, description, page_actions = [] }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><h1 className="text-3xl font-bold tracking-tight">{page_title}</h1>{description && <p className="mt-1 text-gray-600 dark:text-gray-300">{description}</p>}</div>
      {page_actions.length > 0 && <div className="flex flex-wrap gap-2">{page_actions.map((action) => <ActionGenerator key={action.id} action={action} />)}</div>}
    </header>
  )
}
