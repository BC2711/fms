import { MoreHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import { DynamicIcon } from '@/framework/runtime/DynamicIcon'
import type { MenuItem } from '@/types/configuration.types'

function navigable(items: MenuItem[]): MenuItem[] {
  return items.filter((item) => item.is_visible !== false && item.type !== 'divider' && item.type !== 'group' && !item.disabled).flatMap((item) => item.path || item.route ? [item] : navigable(item.children ?? []))
}

export function MobileNavigation({ items }: { items: MenuItem[] }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const links = navigable(items), primary = links.slice(0, 4), overflow = links.slice(4)
  const link = (item: MenuItem, close = false) => <NavLink key={item.id} to={item.path ?? item.route ?? '/'} onClick={() => close && setMoreOpen(false)} className={({ isActive }) => `relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}><DynamicIcon iconKey={item.icon ?? 'CircleCheck'} size={19} /><span className="max-w-16 truncate">{item.label}</span></NavLink>
  return <>
    {moreOpen && <div id="mobile-more-navigation" role="dialog" aria-label="More navigation" className="fixed inset-x-3 bottom-20 z-50 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900 md:hidden"><div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">More</h2><button type="button" aria-label="Close more navigation" onClick={() => setMoreOpen(false)} className="rounded-lg p-2"><X size={18} /></button></div><div className="grid grid-cols-4 gap-2">{overflow.map((item) => link(item, true))}</div></div>}
    <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-40 flex min-h-16 items-center rounded-2xl border border-slate-200/80 bg-white/95 px-2 py-1 shadow-[0_16px_40px_-16px_rgba(15,23,42,.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 md:hidden">{primary.map((item) => link(item))}{overflow.length > 0 && <button type="button" aria-expanded={moreOpen} aria-controls="mobile-more-navigation" onClick={() => setMoreOpen((value) => !value)} className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium text-slate-500"><MoreHorizontal size={19} /><span>More</span></button>}</nav>
  </>
}
