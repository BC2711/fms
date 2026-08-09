import axios, { type AxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/auth/auth.store'
import { getToken } from '@/services/token-manager'

const DEFAULT_TIMEOUT = 30_000

export interface ApiClientOptions {
  baseURL?: string
  timeout?: number
}

type UnauthorizedHandler = () => void | Promise<void>

let unauthorizedHandler: UnauthorizedHandler = () => {
  useAuthStore.getState().logout()
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler
}

export function createApiClient(options: ApiClientOptions = {}) {
  const client = axios.create({
    baseURL: options.baseURL ?? import.meta.env.VITE_API_URL ?? '/api',
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
  })

  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token ?? getToken()
    if (token) config.headers.set('Authorization', `Bearer ${token}`)
    config.headers.set('Content-Type', 'application/json')
    return config
  })

  client.interceptors.response.use(
    (response) => response.data,
    async (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) await unauthorizedHandler()
      return Promise.reject(error)
    },
  )

  return client
}

export const apiClient = createApiClient()

export type RequestOptions = Omit<AxiosRequestConfig, 'url' | 'method' | 'data'> & {
  signal?: AbortSignal
}

export async function get<T>(url: string, config?: RequestOptions): Promise<T> {
  return await apiClient.get<T>(url, config) as unknown as T
}

export async function post<TResponse, TBody = unknown>(url: string, body?: TBody, config?: RequestOptions): Promise<TResponse> {
  return await apiClient.post<TResponse, never, TBody>(url, body, config) as unknown as TResponse
}

export async function put<TResponse, TBody = unknown>(url: string, body?: TBody, config?: RequestOptions): Promise<TResponse> {
  return await apiClient.put<TResponse, never, TBody>(url, body, config) as unknown as TResponse
}

export async function patch<TResponse, TBody = unknown>(url: string, body?: TBody, config?: RequestOptions): Promise<TResponse> {
  return await apiClient.patch<TResponse, never, TBody>(url, body, config) as unknown as TResponse
}

export async function deleteRequest<T>(url: string, config?: RequestOptions): Promise<T> {
  return await apiClient.delete<T>(url, config) as unknown as T
}

export { deleteRequest as delete }
