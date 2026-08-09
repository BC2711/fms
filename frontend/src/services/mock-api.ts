import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

export type TestItemStatus = 'active' | 'inactive' | 'draft'

export interface TestItem {
  id: number
  name: string
  description: string
  status: TestItemStatus
  created_at: string
  updated_at: string
}

export interface Bank { id: number; name: string; code: string; country: string; status: 'active' | 'inactive'; address: string; created_at: string; updated_at: string }

function createSampleBanks(): Bank[] {
  const names = ['Zanaco', 'Stanbic Bank Zambia', 'Absa Bank Zambia', 'First National Bank', 'Indo Zambia Bank', 'Access Bank Zambia', 'Ecobank Zambia', 'First Capital Bank', 'United Bank for Africa', 'Bank of China Zambia', 'Standard Chartered Bank', 'Nedbank', 'Equity Bank', 'KCB Bank', 'Citibank']
  const countries = ['Zambia', 'Zambia', 'Zambia', 'South Africa', 'Zambia', 'Nigeria', 'Kenya', 'Zambia', 'Nigeria', 'Zambia', 'United Kingdom', 'South Africa', 'Kenya', 'Kenya', 'United States']
  return names.map((name, index) => ({ id: index + 1, name, code: name.split(/\s+/).map((word) => word[0]).join('').slice(0, 5).toUpperCase(), country: countries[index], status: index % 4 === 3 ? 'inactive' : 'active', address: `${index + 1} Financial Avenue, ${countries[index]}`, created_at: `2025-${String((index % 12) + 1).padStart(2, '0')}-01T08:00:00.000Z`, updated_at: `2025-${String((index % 12) + 1).padStart(2, '0')}-01T08:00:00.000Z` }))
}

export interface MockApiOptions {
  minDelay?: number
  maxDelay?: number
  errorRate?: number
  random?: () => number
}

function createSampleItems(): TestItem[] {
  const statuses: TestItemStatus[] = ['active', 'inactive', 'draft']
  return Array.from({ length: 25 }, (_, index) => {
    const day = String((index % 28) + 1).padStart(2, '0')
    const timestamp = `2026-01-${day}T09:00:00.000Z`
    return {
      id: index + 1,
      name: `Test Item ${index + 1}`,
      description: `Description for test item ${index + 1}`,
      status: statuses[index % statuses.length],
      created_at: timestamp,
      updated_at: timestamp,
    }
  })
}

function wait(milliseconds: number, signal?: InternalAxiosRequestConfig['signal']): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AxiosError('Request canceled', AxiosError.ERR_CANCELED))
      return
    }
    const timeout = setTimeout(resolve, milliseconds)
    signal?.addEventListener?.('abort', () => {
      clearTimeout(timeout)
      reject(new AxiosError('Request canceled', AxiosError.ERR_CANCELED))
    }, { once: true })
  })
}

function response<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status < 300 ? 'OK' : 'Error',
    headers: new AxiosHeaders({ 'content-type': 'application/json' }),
    config,
  }
}

function parseBody(data: unknown): Record<string, unknown> {
  if (typeof data === 'string') return JSON.parse(data) as Record<string, unknown>
  if (data !== null && typeof data === 'object') return data as Record<string, unknown>
  return {}
}

function notFound(config: InternalAxiosRequestConfig): never {
  const result = response(config, { message: 'Test item not found' }, 404)
  throw new AxiosError('Test item not found', AxiosError.ERR_BAD_REQUEST, config, undefined, result)
}

export function installMockApi(client: AxiosInstance, options: MockApiOptions = {}): () => void {
  const originalAdapter = axios.getAdapter(client.defaults.adapter)
  const random = options.random ?? Math.random
  const minDelay = options.minDelay ?? 200
  const maxDelay = options.maxDelay ?? 500
  const errorRate = options.errorRate ?? 0.05
  let items = createSampleItems()
  let nextId = 26
  let banks = createSampleBanks()
  let nextBankId = 16

  const mockAdapter: AxiosAdapter = async (config) => {
    const url = new URL(config.url ?? '', config.baseURL)
    if (url.hostname !== 'api.example.com') return originalAdapter(config)

    const delay = minDelay + Math.floor(random() * (Math.max(maxDelay, minDelay) - minDelay + 1))
    await wait(delay, config.signal)

    if (random() < errorRate) {
      const result = response(config, { message: 'Simulated server error' }, 500)
      throw new AxiosError('Simulated server error', AxiosError.ERR_BAD_RESPONSE, config, undefined, result)
    }

    const path = url.pathname.replace(/\/$/, '')
    const collectionPath = /\/test-items$/
    const itemMatch = path.match(/\/test-items\/(\d+)$/)
    const method = config.method?.toUpperCase() ?? 'GET'
    const bankCollection = /\/banks$/
    const bankMatch = path.match(/\/banks\/(\d+)$/)

    if (bankCollection.test(path) && method === 'GET') {
      const query = { ...Object.fromEntries(url.searchParams), ...(config.params as Record<string, string> | undefined) }
      const page = Math.max(1, Number(query.page ?? 1)), pageSize = Math.max(1, Number(query.pageSize ?? 10))
      const search = String(query.search ?? '').toLowerCase(), status = String(query.status ?? ''), country = String(query.country ?? '')
      const sortBy = String(query.sortBy ?? 'id') as keyof Bank, direction = String(query.sortDirection ?? 'asc') === 'desc' ? -1 : 1
      let filtered = banks.filter((bank) => (!search || bank.name.toLowerCase().includes(search) || bank.code.toLowerCase().includes(search)) && (!status || bank.status === status) && (!country || bank.country === country))
      filtered = [...filtered].sort((left, right) => String(left[sortBy]).localeCompare(String(right[sortBy]), undefined, { numeric: true }) * direction)
      const start = (page - 1) * pageSize
      return response(config, { data: { items: filtered.slice(start, start + pageSize), total: filtered.length, active: filtered.filter((bank) => bank.status === 'active').length, inactive: filtered.filter((bank) => bank.status === 'inactive').length, page, pageSize } })
    }
    if (bankMatch && method === 'GET') { const bank = banks.find((item) => item.id === Number(bankMatch[1])); if (!bank) return notFound(config); return response(config, { data: bank }) }
    if (bankCollection.test(path) && method === 'POST') { const body = parseBody(config.data), now = new Date().toISOString(); const bank = { id: nextBankId++, name: String(body.name ?? ''), code: String(body.code ?? ''), country: String(body.country ?? ''), status: body.status === 'inactive' ? 'inactive' as const : 'active' as const, address: String(body.address ?? ''), created_at: now, updated_at: now }; banks = [...banks, bank]; return response(config, { data: bank }, 201) }
    if (bankMatch && method === 'PUT') { const index = banks.findIndex((bank) => bank.id === Number(bankMatch[1])); if (index < 0) return notFound(config); const updated = { ...banks[index], ...parseBody(config.data), id: banks[index].id, updated_at: new Date().toISOString() } as Bank; banks = banks.map((bank, itemIndex) => itemIndex === index ? updated : bank); return response(config, { data: updated }) }
    if (bankMatch && method === 'DELETE') { const id = Number(bankMatch[1]); if (!banks.some((bank) => bank.id === id)) return notFound(config); banks = banks.filter((bank) => bank.id !== id); return response(config, { success: true }) }

    if (collectionPath.test(path) && method === 'GET') {
      const query = { ...Object.fromEntries(url.searchParams), ...(config.params as Record<string, string> | undefined) }
      const page = Math.max(1, Number(query.page ?? 1))
      const pageSize = Math.max(1, Number(query.pageSize ?? query.limit ?? 10))
      const search = String(query.search ?? query.q ?? '').toLowerCase()
      const status = query.status as TestItemStatus | undefined
      const sortBy = String(query.sortBy ?? query.sort ?? 'id') as keyof TestItem
      const direction = String(query.sortDirection ?? query.order ?? 'asc') === 'desc' ? -1 : 1

      let filtered = items.filter((item) => (!status || item.status === status)
        && (!search || item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search)))
      filtered = [...filtered].sort((left, right) => String(left[sortBy]).localeCompare(String(right[sortBy]), undefined, { numeric: true }) * direction)
      const start = (page - 1) * pageSize
      return response(config, { data: { items: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize } })
    }

    if (itemMatch && method === 'GET') {
      const item = items.find((candidate) => candidate.id === Number(itemMatch[1]))
      if (!item) return notFound(config)
      return response(config, { data: item })
    }

    if (collectionPath.test(path) && method === 'POST') {
      const body = parseBody(config.data)
      const timestamp = new Date().toISOString()
      const item: TestItem = {
        id: nextId++,
        name: String(body.name ?? ''),
        description: String(body.description ?? ''),
        status: (body.status as TestItemStatus | undefined) ?? 'draft',
        created_at: timestamp,
        updated_at: timestamp,
      }
      items = [...items, item]
      return response(config, { data: item }, 201)
    }

    if (itemMatch && method === 'PUT') {
      const index = items.findIndex((candidate) => candidate.id === Number(itemMatch[1]))
      if (index < 0) return notFound(config)
      const body = parseBody(config.data)
      const updated: TestItem = { ...items[index], ...body, id: items[index].id, updated_at: new Date().toISOString() } as TestItem
      items = items.map((item, itemIndex) => itemIndex === index ? updated : item)
      return response(config, { data: updated })
    }

    if (itemMatch && method === 'DELETE') {
      const id = Number(itemMatch[1])
      if (!items.some((candidate) => candidate.id === id)) return notFound(config)
      items = items.filter((candidate) => candidate.id !== id)
      return response(config, { success: true })
    }

    return notFound(config)
  }

  client.defaults.adapter = mockAdapter
  return () => { client.defaults.adapter = originalAdapter }
}
