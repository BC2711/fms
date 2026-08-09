import type { PropsWithChildren } from 'react'

export function DetailSection({ title, children }: PropsWithChildren<{ title: string }>) {
  return <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"><h2 className="border-b border-gray-100 pb-3 font-semibold dark:border-gray-800">{title}</h2><dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">{children}</dl></section>
}
