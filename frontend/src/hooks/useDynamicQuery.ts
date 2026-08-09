import { useQuery } from '@tanstack/react-query'

import { get } from '@/services/api-client'
import { resolveEndpoint, type EndpointParams } from '@/services/endpoint-resolver'
import { mapItemResponse, mapListResponse, mapPaginatedResponse } from '@/services/response-mapper'
import type { DataMappingConfig, PageConfig } from '@/types/configuration.types'

export interface DynamicPagination {
  page: number
  pageSize: number
}

export interface DynamicSorting {
  field: string
  direction: 'asc' | 'desc'
}

export interface UseDynamicQueryOptions {
  pageConfig: PageConfig
  endpointKey?: string
  routeParams?: EndpointParams
  filters?: Record<string, unknown>
  pagination?: DynamicPagination
  sorting?: DynamicSorting
  dataMapping?: DataMappingConfig
  enabled?: boolean
}

function mapResponse<T>(response: unknown, mapping: DataMappingConfig | undefined, fallbackPath?: string): T {
  const type = mapping?.type ?? (fallbackPath?.endsWith('items') ? 'list' : 'item')
  if (type === 'paginated') return mapPaginatedResponse(response, mapping) as T
  if (type === 'list') return mapListResponse(response, mapping?.items ?? fallbackPath ?? 'data.items') as T
  return mapItemResponse(response, mapping?.item ?? fallbackPath ?? 'data') as T
}

export function useDynamicQuery<TData = unknown>({
  pageConfig,
  endpointKey = 'list',
  routeParams = {},
  filters = {},
  pagination,
  sorting,
  dataMapping,
  enabled = true,
}: UseDynamicQueryOptions) {
  const api = pageConfig.api
  if (!api) throw new Error(`Page "${pageConfig.id}" does not define an API configuration.`)
  const endpoint = api.endpoints[endpointKey]
  if (!endpoint && enabled) throw new Error(`API endpoint "${endpointKey}" is not configured for page "${pageConfig.id}".`)

  const query = useQuery<TData, Error>({
    queryKey: [pageConfig.id, filters, pagination, sorting],
    enabled: enabled && Boolean(endpoint),
    queryFn: async ({ signal }) => {
      if (!endpoint) throw new Error(`API endpoint "${endpointKey}" is not configured for page "${pageConfig.id}".`)
      const url = resolveEndpoint(endpoint.path, routeParams)
      const response = await get<unknown>(url, {
        baseURL: api.baseUrl,
        headers: { ...api.headers, ...endpoint.headers },
        params: {
          ...filters,
          ...(pagination ? { page: pagination.page, pageSize: pagination.pageSize } : {}),
          ...(sorting ? { sortBy: sorting.field, sortDirection: sorting.direction } : {}),
        },
        signal,
      })
      return mapResponse<TData>(response, dataMapping ?? api.data_mapping, endpoint.responseMappingPath)
    },
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
