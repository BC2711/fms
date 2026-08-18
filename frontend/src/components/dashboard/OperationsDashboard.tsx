import { ArrowUpRight, CircleCheck, Clock3, Command, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuthStore } from '@/auth/auth.store'
import { ActivityLineChart, DistributionChart, ModuleBarChart, type ChartPoint } from '@/components/dashboard/DashboardCharts'
import { DynamicIcon } from '@/framework/runtime/DynamicIcon'
import { useDynamicQuery } from '@/hooks/useDynamicQuery'
import type { DashboardPageConfig, MenuItem } from '@/types/configuration.types'

interface DashboardData {
  summary?: { items?: number; accounts?: number; stations?: number; generated_records?: number }
  charts?: { monthly_activity?: ChartPoint[]; module_activity?: ChartPoint[]; status_distribution?: ChartPoint[]; account_mix?: ChartPoint[]; category_mix?: ChartPoint[] }
}

const accents = [
  { icon: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300', bar: 'bg-cyan-500' },
  { icon: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300', bar: 'bg-amber-500' },
  { icon: 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300', bar: 'bg-rose-500' },
  { icon: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300', bar: 'bg-emerald-500' },
  { icon: 'bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300', bar: 'bg-violet-500' },
]

function visibleChildren(item: MenuItem) {
  return (item.children ?? []).filter((child) => child.is_visible !== false && !child.disabled)
}

function firstPath(item: MenuItem): string | undefined {
  if (item.path && item.path !== '#') return item.path
  for (const child of visibleChildren(item)) {
    const path = firstPath(child)
    if (path) return path
  }
}

function leafCount(item: MenuItem): number {
  const children = visibleChildren(item)
  return children.length ? children.reduce((total, child) => total + leafCount(child), 0) : Number(Boolean(firstPath(item)))
}

function Metric({ label, value, icon, loading }: { label: string; value: number; icon: string; loading: boolean }) {
  return (
    <div className="min-w-0 border-b border-slate-200 p-5 last:border-b-0 dark:border-white/10 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          {loading ? <div className="mt-3 h-9 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" /> : <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value.toLocaleString()}</p>}
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"><DynamicIcon iconKey={icon} size={19} /></span>
      </div>
    </div>
  )
}

export function OperationsDashboard({ config }: { config: DashboardPageConfig }) {
  const user = useAuthStore((state) => state.user)
  const query = useDynamicQuery<DashboardData>({ pageConfig: config, endpointKey: 'summary' })
  const modules = (user?.menus ?? []).filter((item) => item.is_visible !== false && item.id !== 'dashboard' && Boolean(firstPath(item)))
  const summary = query.data?.summary ?? {}
  const totalDestinations = modules.reduce((total, item) => total + leafCount(item), 0)
  const workflowCoverage = modules.slice(0, 7).map((module) => ({ label: module.label, value: leafCount(module) }))
  const subject = (config.page_title ?? config.title).replace(/ Dashboard$/i, '').replace(/ Performance$/i, '')
  const usesAccountMix = ['dashboard', 'dashboard-executive-dashboard', 'dashboard-sales-dashboard', 'my-account-my-dashboard'].includes(config.id)
  const maxLeaves = Math.max(...modules.map(leafCount), 1)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return (
    <section className="space-y-6" aria-labelledby="dashboard-heading">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">{greeting}, {user?.name?.split(' ')[0] ?? 'Operator'} <span className="text-slate-400">/ {today}</span></p>
          <h1 id="dashboard-heading" className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">{config.page_title ?? config.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{config.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"><CircleCheck size={15} /> Systems operational</span>
          <button type="button" onClick={() => query.refetch()} aria-label="Refresh dashboard" title="Refresh dashboard" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"><RefreshCw size={16} /></button>
        </div>
      </header>

      {query.isError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">Live totals are temporarily unavailable. Navigation remains operational.</div>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Managed accounts" value={summary.accounts ?? 0} icon="Users" loading={query.isLoading} />
          <Metric label="Active stations" value={summary.stations ?? 0} icon="Fuel" loading={query.isLoading} />
          <Metric label="Operational records" value={summary.generated_records ?? 0} icon="Database" loading={query.isLoading} />
          <Metric label="Available workflows" value={totalDestinations} icon="LayoutDashboard" loading={false} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-6">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 2xl:col-span-3"><div><h2 className="text-sm font-bold text-slate-950 dark:text-white">{subject} trend</h2><p className="mt-1 text-xs text-slate-500">Database activity over the last six months</p></div>{query.isLoading ? <div className="mt-5 h-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /> : <ActivityLineChart data={query.data?.charts?.monthly_activity ?? []} />}</article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 2xl:col-span-3"><div><h2 className="text-sm font-bold text-slate-950 dark:text-white">{subject} volume</h2><p className="mt-1 text-xs text-slate-500">Highest-volume database resource areas</p></div>{query.isLoading ? <div className="mt-5 h-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /> : <ModuleBarChart data={query.data?.charts?.category_mix ?? []} ariaLabel={`${subject} volume chart`} />}</article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 2xl:col-span-2"><div><h2 className="text-sm font-bold text-slate-950 dark:text-white">{subject} status</h2><p className="mt-1 text-xs text-slate-500">Current scoped record distribution</p></div>{query.isLoading ? <div className="mt-5 h-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /> : <DistributionChart data={query.data?.charts?.status_distribution ?? []} ariaLabel={`${subject} status chart`} />}</article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 2xl:col-span-2"><div><h2 className="text-sm font-bold text-slate-950 dark:text-white">{usesAccountMix ? 'Account portfolio' : `${subject} composition`}</h2><p className="mt-1 text-xs text-slate-500">{usesAccountMix ? 'Accounts by customer category' : 'Records by domain category'}</p></div>{query.isLoading ? <div className="mt-5 h-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /> : <DistributionChart data={(usesAccountMix ? query.data?.charts?.account_mix : query.data?.charts?.category_mix) ?? []} ariaLabel={`${subject} composition chart`} />}</article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 2xl:col-span-2"><div><h2 className="text-sm font-bold text-slate-950 dark:text-white">Workflow coverage</h2><p className="mt-1 text-xs text-slate-500">Authorized destinations by module</p></div><ModuleBarChart data={workflowCoverage} ariaLabel="Authorized workflow coverage chart" /></article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div><h2 className="text-base font-bold text-slate-950 dark:text-white">Operations workspace</h2><p className="mt-1 text-sm text-slate-500">Modules available for your access profile</p></div>
            <span className="text-xs font-semibold text-slate-400">{modules.length} modules</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {modules.map((module, index) => {
              const path = firstPath(module)!
              const count = leafCount(module)
              const accent = accents[index % accents.length]
              return <Link key={module.id} to={path} className="group min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:hover:border-white/20">
                <div className="flex items-start gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${accent.icon}`}><DynamicIcon iconKey={module.icon ?? 'FolderTree'} size={19} /></span>
                  <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{module.label}</h3><p className="mt-1 text-xs text-slate-500">{count} {count === 1 ? 'workflow' : 'workflows'}</p></div>
                  <ArrowUpRight size={16} className="shrink-0 text-slate-300 transition group-hover:text-slate-700 dark:group-hover:text-white" />
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded bg-slate-100 dark:bg-white/10"><div className={`h-full rounded ${accent.bar}`} style={{ width: `${Math.max(14, (count / maxLeaves) * 100)}%` }} /></div>
              </Link>
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg bg-slate-950 p-5 text-white shadow-lg dark:bg-slate-900 dark:ring-1 dark:ring-white/10">
            <div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-400 text-slate-950"><Command size={18} /></span><span className="text-xs font-semibold text-slate-400">CONTROL CENTRE</span></div>
            <p className="mt-6 text-4xl font-bold">{totalDestinations}</p><p className="mt-1 text-sm text-slate-400">authorized destinations across your workspace</p>
            <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-400"><Clock3 size={14} /><span>Updated from your current access profile</span></div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white">Module coverage</h2>
            <div className="mt-4 space-y-3">{modules.slice(0, 6).map((module, index) => <div key={module.id} className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-sm ${accents[index % accents.length].bar}`} /><span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600 dark:text-slate-300">{module.label}</span><span className="text-xs font-bold text-slate-900 dark:text-white">{leafCount(module)}</span></div>)}</div>
          </div>
        </aside>
      </div>
    </section>
  )
}
