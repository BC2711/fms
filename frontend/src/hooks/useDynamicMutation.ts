import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteRequest, patch, post, put } from '@/services/api-client'
import { resolveEndpoint, type EndpointParams } from '@/services/endpoint-resolver'
import { showErrorNotification, showSuccessNotification } from '@/services/notifications'
import type { ApiConfig } from '@/types/configuration.types'

export interface DynamicMutationVariables<TBody> {
  data?: TBody
  params?: EndpointParams
}

export interface DynamicMutationConfig {
  endpointKey: string
  pageKey: string
  routeParams?: EndpointParams
  invalidatePageKeys?: string[]
  successMessage?: string
  errorMessage?: string
}

export function useDynamicMutation<TResponse = unknown, TBody = unknown>(
  apiConfig: ApiConfig,
  mutationConfig: DynamicMutationConfig,
) {
  const queryClient = useQueryClient()
  const endpoint = apiConfig.endpoints[mutationConfig.endpointKey]
  if (!endpoint) throw new Error(`API endpoint "${mutationConfig.endpointKey}" is not configured.`)

  return useMutation<TResponse, Error, DynamicMutationVariables<TBody>>({
    mutationFn: async ({ data, params = {} }) => {
      const url = resolveEndpoint(endpoint.path, { ...mutationConfig.routeParams, ...params })
      const requestConfig = { baseURL: apiConfig.baseUrl, headers: { ...apiConfig.headers, ...endpoint.headers } }
      switch (endpoint.method) {
        case 'POST': return post<TResponse, TBody>(url, data, requestConfig)
        case 'PUT': return put<TResponse, TBody>(url, data, requestConfig)
        case 'PATCH': return patch<TResponse, TBody>(url, data, requestConfig)
        case 'DELETE': return deleteRequest<TResponse>(url, requestConfig)
        default: throw new Error(`HTTP method ${endpoint.method} cannot be used for a mutation.`)
      }
    },
    onSuccess: async () => {
      const keys = mutationConfig.invalidatePageKeys ?? [mutationConfig.pageKey]
      await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })))
      showSuccessNotification(mutationConfig.successMessage ?? 'Operation completed successfully.')
    },
    onError: (error) => {
      showErrorNotification(mutationConfig.errorMessage ?? error.message ?? 'Operation failed.')
    },
  })
}
