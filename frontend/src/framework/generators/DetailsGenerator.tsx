import { useNavigate, useParams, type Params } from 'react-router-dom'

import { DetailField } from '@/components/data-display/DetailField'
import { DetailSection } from '@/components/data-display/DetailSection'
import { DetailSkeleton } from '@/components/data-display/DetailSkeleton'
import { PageHeader } from '@/components/navigation/PageHeader'
import { BreadcrumbGenerator } from '@/framework/generators/BreadcrumbGenerator'
import { useDynamicQuery } from '@/hooks/useDynamicQuery'
import { resolveEndpoint } from '@/services/endpoint-resolver'
import type { DetailSectionConfig, DetailsPageConfig } from '@/types/configuration.types'

export interface DetailsGeneratorProps {
  pageConfig: DetailsPageConfig
  data?: Record<string, unknown>
  isLoading?: boolean
  isError?: boolean
  error?: Error | null
  routeParams?: Readonly<Params<string>>
}

function readPath(data: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, segment) => value && typeof value === 'object' ? (value as Record<string, unknown>)[segment] : undefined, data)
}

export function DetailsGenerator({ pageConfig, data, isLoading, isError, error, routeParams }: DetailsGeneratorProps) {
  const navigate = useNavigate()
  const matchedParams = useParams<string>()
  const params = routeParams ?? matchedParams
  const id = params[pageConfig.recordIdParam]
  const query = useDynamicQuery<Record<string, unknown>>({
    pageConfig,
    endpointKey: 'item',
    routeParams: id ? { [pageConfig.recordIdParam]: id, id } : {},
    dataMapping: { type: 'item', item: pageConfig.api.endpoints.item?.responseMappingPath ?? 'data' },
    enabled: data === undefined && Boolean(id),
  })
  const item = data ?? query.data ?? {}
  const loading = isLoading ?? (data === undefined && query.isLoading)
  const failed = isError ?? query.isError
  const failure = error ?? query.error
  const sections: DetailSectionConfig[] = pageConfig.sections ?? [{ id: 'details', title: 'Details', fields: pageConfig.fields.map((key) => ({ key, label: key.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), type: 'text' })) }]
  const actions = (pageConfig.page_actions ?? pageConfig.actions ?? []).map((action) => ({ ...action, path: action.path && id ? resolveEndpoint(action.path, { id }) : action.path, endpoint: action.endpoint && id ? resolveEndpoint(action.endpoint, { id }) : action.endpoint }))

  return <section className="space-y-5"><BreadcrumbGenerator config={pageConfig} /><PageHeader page_title={pageConfig.page_title ?? pageConfig.title} description={pageConfig.description} page_actions={actions} />{id && <p className="text-sm text-gray-500">Record: {id}</p>}{loading ? <DetailSkeleton fieldCount={sections.reduce((count, section) => count + section.fields.length, 0)} /> : failed ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700 dark:border-red-900 dark:bg-red-950"><h2 className="text-lg font-semibold">Item not found</h2><p className="mt-1 text-sm">{failure?.message ?? 'The requested item could not be loaded.'}</p><button type="button" onClick={() => navigate(-1)} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Back</button></div> : <>{sections.map((section) => <DetailSection key={section.id} title={section.title}>{section.fields.map((field) => <DetailField key={field.key} field={field} value={readPath(item, field.key)} />)}</DetailSection>)}<DetailSection title="Related records"><p className="col-span-full text-sm text-gray-500">Related records will appear here.</p></DetailSection></>}</section>
}
