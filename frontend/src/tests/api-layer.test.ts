import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from '@/services/api-client'
import { resolveEndpoint } from '@/services/endpoint-resolver'
import { installMockApi, type TestItem } from '@/services/mock-api'
import { getValueByPath, mapItemResponse, mapListResponse, mapPaginatedResponse } from '@/services/response-mapper'

describe('API layer', () => {
  it('resolves endpoint parameters and reports missing parameters', () => {
    expect(resolveEndpoint('/api/test-items/{id}', { id: 12 })).toBe('/api/test-items/12')
    expect(resolveEndpoint('/users/{user}/files/{name}', { user: 'a b', name: 'report.pdf' }))
      .toBe('/users/a%20b/files/report.pdf')
    expect(() => resolveEndpoint('/api/test-items/{id}', {})).toThrow(/missing parameter\(s\) id/i)
  })

  it('maps list, item, and pagination paths safely', () => {
    const payload = { data: { items: [{ id: 1 }], total: 1, page: 2, pageSize: 10, selected: { id: 1 } } }
    expect(getValueByPath(payload, 'data.total')).toBe(1)
    expect(mapListResponse<{ id: number }>(payload)).toEqual([{ id: 1 }])
    expect(mapItemResponse<{ id: number }>(payload, 'data.selected')).toEqual({ id: 1 })
    expect(mapPaginatedResponse<{ id: number }>(payload)).toEqual({ items: [{ id: 1 }], total: 1, page: 2, pageSize: 10 })

    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    expect(getValueByPath(payload, 'data.missing.value')).toBeUndefined()
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('data.missing.value'))
    warning.mockRestore()
  })

  it('supports paginated mock CRUD requests with filtering and sorting', async () => {
    const client = createApiClient({ baseURL: 'https://api.example.com', timeout: 1_000 })
    installMockApi(client, { minDelay: 0, maxDelay: 0, errorRate: 0 })

    const list = await client.get('/test-items', {
      params: { status: 'active', search: 'Test Item', sortBy: 'id', sortDirection: 'desc', page: 1, pageSize: 3 },
    }) as unknown as { data: { items: TestItem[]; total: number; page: number; pageSize: number } }
    expect(list.data.items).toHaveLength(3)
    expect(list.data.items.every((item) => item.status === 'active')).toBe(true)
    expect(list.data.items[0].id).toBeGreaterThan(list.data.items[1].id)

    const created = await client.post('/test-items', {
      name: 'Created Item', description: 'Created by test', status: 'draft',
    }) as unknown as { data: TestItem }
    expect(created.data).toMatchObject({ id: 26, name: 'Created Item', status: 'draft' })

    const fetched = await client.get(`/test-items/${created.data.id}`) as unknown as { data: TestItem }
    expect(fetched.data.name).toBe('Created Item')

    const updated = await client.put(`/test-items/${created.data.id}`, {
      name: 'Updated Item', status: 'active',
    }) as unknown as { data: TestItem }
    expect(updated.data).toMatchObject({ id: 26, name: 'Updated Item', status: 'active' })

    const deleted = await client.delete(`/test-items/${created.data.id}`) as unknown as { success: boolean }
    expect(deleted.success).toBe(true)
    await expect(client.get(`/test-items/${created.data.id}`)).rejects.toMatchObject({ response: { status: 404 } })
  })
})
