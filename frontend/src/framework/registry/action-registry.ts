import type { QueryClient } from '@tanstack/react-query'

import { deleteRequest } from '@/services/api-client'
import type { ActionConfig } from '@/types/configuration.types'

export interface ActionContext<T = unknown> {
  data?: T
  params?: Record<string, string | number>
  navigate?: (to: string | number) => void
  queryClient?: QueryClient
  refetch?: () => unknown | Promise<unknown>
  queryKey?: readonly unknown[]
}

export interface ActionResult<T = unknown> { success: boolean; data?: T; error?: unknown }
export type ActionHandler = (action: ActionConfig, context: ActionContext) => Promise<unknown>

const handlers = new Map<string, ActionHandler>()

export function registerAction(key: string, handler: ActionHandler): void { handlers.set(key, handler) }

registerAction('navigate', async (action, context) => {
  if (!action.path) throw new Error(`Navigate action "${action.id}" requires a path.`)
  context.navigate?.(action.path)
  return action.path
})
registerAction('create', handlers.get('navigate')!)
registerAction('edit', handlers.get('navigate')!)
registerAction('refresh', async (_action, context) => {
  if (context.queryKey) await context.queryClient?.invalidateQueries({ queryKey: [...context.queryKey] })
  else await context.queryClient?.invalidateQueries()
  return await context.refetch?.()
})
registerAction('delete', async (action, context) => {
  if (!action.endpoint) throw new Error(`Delete action "${action.id}" requires an endpoint.`)
  const absolute = /^https?:\/\//.test(action.endpoint) ? new URL(action.endpoint) : undefined
  const usesConfiguredBackend = absolute?.hostname === 'api.example.com'
  const data = await deleteRequest<unknown>(absolute ? `${absolute.pathname}${absolute.search}` : action.endpoint, absolute ? { baseURL: usesConfiguredBackend ? '/api' : absolute.origin } : undefined)
  if (context.queryKey) await context.queryClient?.invalidateQueries({ queryKey: [...context.queryKey] })
  else await context.queryClient?.invalidateQueries()
  return data
})
registerAction('export', async (action, context) => {
  const blob = new Blob([JSON.stringify(context.data ?? {}, null, 2)], { type: 'application/json' })
  if (typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `${action.id}.${action.format ?? 'json'}`; anchor.click()
    URL.revokeObjectURL(url)
  }
  return blob
})

export async function executeAction<T = unknown>(action: ActionConfig, context: ActionContext = {}): Promise<ActionResult<T>> {
  const handler = handlers.get(action.type)
  if (!handler) return { success: false, error: new Error(`No handler registered for action "${action.type}".`) }
  try { return { success: true, data: await handler(action, context) as T } }
  catch (error) { return { success: false, error } }
}
