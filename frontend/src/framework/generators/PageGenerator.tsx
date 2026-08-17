import { useParams, type Params } from 'react-router-dom'

import { canAccessPage } from '@/auth/permissions'
import { useAuthStore } from '@/auth/auth.store'
import { getPageConfig } from '@/config/page-registry'
import { BreadcrumbGenerator } from '@/framework/generators/BreadcrumbGenerator'
import { DashboardGenerator } from '@/framework/generators/DashboardGenerator'
import { DetailsGenerator } from '@/framework/generators/DetailsGenerator'
import { FormPageGenerator } from '@/framework/generators/FormPageGenerator'
import { ListPageGenerator } from '@/framework/generators/ListPageGenerator'
import { ConfigErrorBoundary } from '@/framework/runtime/ConfigErrorBoundary'
import { pageConfigSchema } from '@/framework/schemas/page.schema'
import { validateConfig } from '@/framework/schemas/validation'
import type { PageConfig } from '@/types/configuration.types'
// import { AccountsListPage } from '@/features/accounts/AccountsListPage'
// import { OilMarketingCompaniesPage } from '@/features/accounts/OilMarketingCompaniesPage'

export interface PageGeneratorProps {
  pageKey: string
}

function renderPage(config: PageConfig, routeParams: Readonly<Params<string>>) {
  // if (config.id === 'accounts') return <AccountsListPage />
  // if (config.id === 'accounts-oil-marketing-companies') return <OilMarketingCompaniesPage />
  // if(config.id ==='corporate-companies') return <AccountsListPage />
  switch (config.page_type ?? config.type) {
    case 'dashboard': return <><BreadcrumbGenerator config={config} /><DashboardGenerator dashboardConfig={config as Extract<PageConfig, { type: 'dashboard' }>} /></>
    case 'list': return <ListPageGenerator config={config as Extract<PageConfig, { type: 'list' }>} routeParams={routeParams} />
    case 'create': return <FormPageGenerator config={config as Extract<PageConfig, { type: 'create' }>} mode="create" routeParams={routeParams} />
    case 'edit': return <FormPageGenerator config={config as Extract<PageConfig, { type: 'edit' }>} mode="edit" routeParams={routeParams} />
    case 'details': return <DetailsGenerator pageConfig={config as Extract<PageConfig, { type: 'details' }>} />
  }
}

function GeneratedPage({ pageKey }: PageGeneratorProps) {
  const auth = useAuthStore()
  const routeParams = useParams<string>()
  const registeredConfig = getPageConfig(pageKey)
  if (!registeredConfig) throw new Error(`Page configuration "${pageKey}" is not registered.`)
  const config = import.meta.env.DEV ? validateConfig(pageKey, pageConfigSchema, registeredConfig) : registeredConfig

  if (auth.isLoading) return <div role="status" className="p-8 text-center text-gray-500">Checking authentication…</div>
  if (config.authentication?.required && !auth.isAuthenticated) return <section><h1 className="text-3xl font-bold">Unauthorized</h1></section>
  if (config.permissions && !canAccessPage(auth.user, config)) return <section><h1 className="text-3xl font-bold">Unauthorized</h1></section>
  return renderPage(config, routeParams)
}

export function PageGenerator(props: PageGeneratorProps) {
  return <ConfigErrorBoundary><GeneratedPage {...props} /></ConfigErrorBoundary>
}
