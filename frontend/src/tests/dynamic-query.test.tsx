import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { PropsWithChildren } from 'react'

import { testItemsListConfig } from '@/config/pages/test-items.config'
import { useDynamicMutation } from '@/hooks/useDynamicMutation'
import { useDynamicQuery } from '@/hooks/useDynamicQuery'
import { usePageConfig } from '@/hooks/usePageConfig'
import { apiClient } from '@/services/api-client'
import { installMockApi, type TestItem } from '@/services/mock-api'
import type { PaginatedResponse } from '@/services/response-mapper'

let restoreMock: (() => void) | undefined

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } })
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

afterEach(() => restoreMock?.())

describe('dynamic query hooks', () => {
  it('shows loading and then renders mapped mock items', async () => {
    restoreMock = installMockApi(apiClient, { minDelay: 20, maxDelay: 20, errorRate: 0 })
    function QueryView() {
      const query = useDynamicQuery<PaginatedResponse<TestItem>>({
        pageConfig: testItemsListConfig,
        filters: { status: 'active' },
        pagination: { page: 1, pageSize: 5 },
        sorting: { field: 'id', direction: 'desc' },
      })
      if (query.isLoading) return <div>Loading items</div>
      if (query.isError) return <div>Error: {query.error?.message}</div>
      return <div>Items: {query.data?.items.length}; first: {query.data?.items[0]?.name}</div>
    }

    render(<QueryView />, { wrapper: createWrapper() })
    expect(screen.getByText('Loading items')).toBeInTheDocument()
    expect(await screen.findByText(/Items: 5; first: Test Item/)).toBeInTheDocument()
  })

  it('returns an error state when the mock forces a failure', async () => {
    restoreMock = installMockApi(apiClient, { minDelay: 0, maxDelay: 0, errorRate: 1 })
    const { result } = renderHook(() => useDynamicQuery({ pageConfig: testItemsListConfig }), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toMatch(/simulated server error/i)
  })

  it('creates, updates, and deletes mock items and emits notifications', async () => {
    restoreMock = installMockApi(apiClient, { minDelay: 0, maxDelay: 0, errorRate: 0 })
    const notifications: string[] = []
    const listener = (event: Event) => notifications.push((event as CustomEvent<{ message: string }>).detail.message)
    window.addEventListener('fms:notification', listener)
    const wrapper = createWrapper()

    const createdHook = renderHook(() => useDynamicMutation<{ data: TestItem }, Partial<TestItem>>(
      testItemsListConfig.api,
      { endpointKey: 'create', pageKey: 'test-items', successMessage: 'Item created' },
    ), { wrapper })
    let created!: { data: TestItem }
    await act(async () => { created = await createdHook.result.current.mutateAsync({ data: { name: 'Hook Item', description: 'Created', status: 'draft' } }) })
    expect(created.data).toMatchObject({ id: 26, name: 'Hook Item' })

    const updatedHook = renderHook(() => useDynamicMutation<{ data: TestItem }, Partial<TestItem>>(
      testItemsListConfig.api,
      { endpointKey: 'update', pageKey: 'test-items', routeParams: { id: created.data.id }, successMessage: 'Item updated' },
    ), { wrapper })
    let updated!: { data: TestItem }
    await act(async () => { updated = await updatedHook.result.current.mutateAsync({ data: { name: 'Updated Hook Item', status: 'active' } }) })
    expect(updated.data).toMatchObject({ id: 26, name: 'Updated Hook Item', status: 'active' })

    const deletedHook = renderHook(() => useDynamicMutation<{ success: boolean }>(
      testItemsListConfig.api,
      { endpointKey: 'delete', pageKey: 'test-items', routeParams: { id: created.data.id }, successMessage: 'Item deleted' },
    ), { wrapper })
    let deleted!: { success: boolean }
    await act(async () => { deleted = await deletedHook.result.current.mutateAsync({}) })
    expect(deleted.success).toBe(true)
    expect(notifications).toEqual(['Item created', 'Item updated', 'Item deleted'])
    window.removeEventListener('fms:notification', listener)
  })

  it('returns validated registry configuration and throws for missing keys', () => {
    const valid = renderHook(() => usePageConfig('test-items'))
    expect(valid.result.current.id).toBe('test-items')
    expect(() => renderHook(() => usePageConfig('missing-page'))).toThrow(/not registered/i)
  })
})
