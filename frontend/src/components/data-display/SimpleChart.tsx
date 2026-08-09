export function SimpleChart({ title, type = 'chart' }: { title: string; type?: string }) {
  return <div data-chart-type={type} className="grid min-h-48 place-items-center rounded-lg bg-gray-50 text-sm text-gray-500 dark:bg-gray-800/60">Chart: {title}</div>
}
