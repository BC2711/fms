export function DetailSkeleton({ fieldCount = 6 }: { fieldCount?: number }) {
  return <div aria-label="Loading details" className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"><div className="h-5 w-36 rounded bg-gray-200 dark:bg-gray-700" /><div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">{Array.from({ length: fieldCount }, (_, index) => <div key={index}><div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" /><div className="mt-2 h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700" /></div>)}</div></div>
}
