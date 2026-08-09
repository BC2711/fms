import type { ComponentType, ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ComponentType<{ size?: number; className?: string }>
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, message, action }: EmptyStateProps) {
  return <div className="flex flex-col items-center justify-center px-6 py-14 text-center"><Icon size={42} className="text-gray-400" /><h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{title}</h3><p className="mt-1 max-w-md text-sm text-gray-500">{message}</p>{action && <div className="mt-5">{action}</div>}</div>
}
