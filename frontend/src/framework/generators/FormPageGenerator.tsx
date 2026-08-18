import { Check, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { Params } from 'react-router-dom'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { FormSkeleton } from '@/components/forms/FormSkeleton'
import { PageHeader } from '@/components/navigation/PageHeader'
import { BreadcrumbGenerator } from '@/framework/generators/BreadcrumbGenerator'
import { FormGenerator, type FormValues } from '@/framework/generators/FormGenerator'
import { useDynamicMutation } from '@/hooks/useDynamicMutation'
import { useDynamicQuery } from '@/hooks/useDynamicQuery'
import type { CreatePageConfig, EditPageConfig } from '@/types/configuration.types'
import { authenticate } from '@/services/auth-service'
import { useAuthStore } from '@/auth/auth.store'

interface FormPageGeneratorProps {
  config: CreatePageConfig | EditPageConfig
  mode: 'create' | 'edit'
  routeParams: Readonly<Params<string>>
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

async function serializeFiles(values: FormValues): Promise<FormValues> {
  const entries = await Promise.all(Object.entries(values).map(async ([key, value]) => [key, value instanceof FileList ? (value.length ? await readFile(value[0]) : undefined) : value] as const))
  return Object.fromEntries(entries)
}

export function FormPageGenerator({ config, mode, routeParams }: FormPageGeneratorProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [authenticationError, setAuthenticationError] = useState<string>()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const id = routeParams[config.type === 'edit' ? config.recordIdParam : 'id']
  const itemQuery = useDynamicQuery<FormValues>({
    pageConfig: config,
    endpointKey: 'item',
    routeParams: id ? { id } : {},
    dataMapping: { type: 'item', item: config.api.endpoints.item?.responseMappingPath ?? 'data' },
    enabled: mode === 'edit' && Boolean(id),
  })
  const mutation = useDynamicMutation<unknown, FormValues>(config.api, {
    endpointKey: mode === 'create' ? 'create' : 'update',
    pageKey: config.parentId ?? config.id,
    routeParams: id ? { id } : {},
    successMessage: mode === 'create' ? 'Record created successfully.' : 'Record updated successfully.',
  })
  const submit = async (values: FormValues) => {
    if (config.id === 'login') {
      setAuthenticationError(undefined)
      setIsAuthenticating(true)
      try {
        const { token, user } = await authenticate(String(values.email ?? ''), String(values.password ?? ''))
        useAuthStore.getState().login(token, user)
        const requestedPath = (location.state as { from?: unknown } | null)?.from
        const destination = typeof requestedPath === 'string' && requestedPath.startsWith('/') && requestedPath !== '/login'
          ? requestedPath
          : (config.form.successPath ?? '/dashboard')
        navigate(destination, { replace: true })
      } catch (error) {
        setAuthenticationError(error instanceof Error ? error.message : 'Unable to sign in.')
      } finally {
        setIsAuthenticating(false)
      }
      return
    }
    await mutation.mutateAsync({ data: await serializeFiles(values) })
    navigate(config.form.successPath ?? config.form.cancelPath ?? config.path.split('/:')[0])
  }

  const form = <FormGenerator formConfig={config.form} mode={mode} initialData={itemQuery.data} onSubmit={submit} isSubmitting={mutation.isPending || isAuthenticating} serverError={authenticationError ?? mutation.error?.message} />
  const content = mode === 'edit' && itemQuery.isLoading
    ? <FormSkeleton fields={config.form.fields.length} />
    : mode === 'edit' && itemQuery.isError
      ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{itemQuery.error?.message}<button type="button" onClick={() => { void itemQuery.refetch() }} className="ml-3 underline">Retry</button></div>
      : form

  if (config.id === 'login' && isAuthenticated) return <Navigate to={config.form.successPath ?? '/dashboard'} replace />

  if (config.layout === 'standalone') {
    return (
      <main className="relative min-h-dvh overflow-hidden bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-700/20" />
          <div className="absolute -bottom-48 -right-32 h-[30rem] w-[30rem] rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-700/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0,transparent_65%)] opacity-70 dark:opacity-0" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl items-center justify-center">
          <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/20" />
              <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="mb-10 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25"><ShieldCheck size={24} /></span>
                  <span className="text-xl font-bold tracking-tight">FMS</span>
                </div>
                <p className="max-w-sm text-4xl font-bold leading-tight tracking-tight">Financial operations, made beautifully simple.</p>
                <p className="mt-5 max-w-sm text-base leading-7 text-blue-100">One secure workspace for managing accounts, institutions, and the financial relationships that matter.</p>
              </div>
              <div className="relative space-y-3 text-sm text-blue-50">
                {['Secure access controls', 'Clear financial oversight', 'Built for focused teams'].map((item) => <div key={item} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/15"><Check size={14} /></span>{item}</div>)}
              </div>
            </aside>

            <section className="p-6 sm:p-10 lg:p-14">
              <div className="mx-auto max-w-md">
                <div className="mb-8 flex items-center gap-3 lg:hidden">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"><ShieldCheck size={22} /></span>
                  <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">FMS</span>
                </div>
                <div className="mb-8">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Secure access</p>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{config.page_title ?? config.title}</h1>
                  {config.description && <p className="mt-3 leading-6 text-slate-600 dark:text-slate-300">{config.description}</p>}
                </div>
                {content}
                {config.id === 'login' && <div className="mt-6 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row"><Link className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400" to="/forgot-password">Forgot password?</Link><span className="text-slate-500 dark:text-slate-400">New to FMS? <Link className="font-semibold text-blue-600 hover:underline dark:text-blue-400" to="/register">Create an account</Link></span></div>}
                {config.id === 'register' && <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">Already have an account? <Link className="font-semibold text-blue-600 hover:underline dark:text-blue-400" to="/login">Sign in</Link></p>}
                {config.id === 'forgot-password' && <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">Remembered your password? <Link className="font-semibold text-blue-600 hover:underline dark:text-blue-400" to="/login">Back to sign in</Link></p>}
                <p className="mt-8 text-center text-xs leading-5 text-slate-400">Protected by enterprise-grade security. By continuing, you agree to the FMS terms of service.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    )
  }

  return <section className="space-y-5"><BreadcrumbGenerator config={config} /><p className="text-sm capitalize text-gray-500">{mode} mode</p><PageHeader page_title={config.page_title ?? config.title} description={config.description} page_actions={config.page_actions ?? config.actions} />{id && <p>Record: {id}</p>}{content}</section>
}
