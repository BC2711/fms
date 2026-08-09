export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info'

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
}

export function Badge({ label, variant = 'info' }: { label: string; variant?: BadgeVariant }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>{label}</span>
}
