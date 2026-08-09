export function getValueByPath<T = unknown>(object: unknown, path: string): T | undefined {
  if (!path) return object as T

  let value: unknown = object
  for (const segment of path.split('.')) {
    if (value === null || typeof value !== 'object' || !(segment in value)) {
      console.warn(`Response mapping path "${path}" could not be resolved at "${segment}".`)
      return undefined
    }
    value = (value as Record<string, unknown>)[segment]
  }
  return value as T
}

export function mapListResponse<T>(response: unknown, itemsPath = 'data.items'): T[] {
  return getValueByPath<T[]>(response, itemsPath) ?? []
}

export function mapItemResponse<T>(response: unknown, itemPath = 'data'): T | undefined {
  return getValueByPath<T>(response, itemPath)
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  [key: string]: unknown
}

export interface PaginationMappingPaths {
  items?: string
  total?: string
  page?: string
  pageSize?: string
}

export function mapPaginatedResponse<T>(response: unknown, paths: PaginationMappingPaths = {}): PaginatedResponse<T> {
  return {
    ...(getValueByPath<Record<string, unknown>>(response, 'data') ?? {}),
    items: getValueByPath<T[]>(response, paths.items ?? 'data.items') ?? [],
    total: getValueByPath<number>(response, paths.total ?? 'data.total') ?? 0,
    page: getValueByPath<number>(response, paths.page ?? 'data.page') ?? 1,
    pageSize: getValueByPath<number>(response, paths.pageSize ?? 'data.pageSize') ?? 0,
  }
}
