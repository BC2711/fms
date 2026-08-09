export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return <div aria-label="Loading form" className="grid animate-pulse grid-cols-1 gap-5 md:grid-cols-12">{Array.from({ length: fields }, (_, index) => <div key={index} className="md:col-span-6"><div className="mb-2 h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700" /></div>)}</div>
}
