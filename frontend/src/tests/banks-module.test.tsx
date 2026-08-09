import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/auth/auth.store'
import { banksListConfig } from '@/config/modules/banks.config'
import { getPageConfigByRoute, pageRegistry } from '@/config/page-registry'
import { PageGenerator } from '@/framework/generators/PageGenerator'
import { apiClient } from '@/services/api-client'
import { installMockApi, type Bank } from '@/services/mock-api'

let restore: (() => void) | undefined
describe('banks reusable module', () => {
  beforeEach(() => {
    restore = installMockApi(apiClient, { minDelay: 5, maxDelay: 5, errorRate: 0 })
    useAuthStore.setState({ user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'super_admin', permissions: [] }, token: 'token', isAuthenticated: true, isLoading: false })
  })
  afterEach(() => restore?.())

  it('registers list and sub-pages using the shared page generators', () => {
    expect(Object.keys(pageRegistry)).toEqual(expect.arrayContaining(['banks', 'banks-create', 'banks-details', 'banks-edit']))
    expect(getPageConfigByRoute('/banks')?.id).toBe('banks')
    expect(getPageConfigByRoute('/banks/create')?.id).toBe('banks-create')
    expect(getPageConfigByRoute('/banks/4')?.id).toBe('banks-details')
    expect(getPageConfigByRoute('/banks/4/edit')?.id).toBe('banks-edit')
    expect(banksListConfig.sub_pages).toHaveLength(3)
  })

  it('renders the configured list, statistics, filters, columns, and actions', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/banks']}><Routes><Route path="/banks" element={<PageGenerator pageKey="banks" />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(await screen.findByRole('heading', { name: 'Banks' })).toBeInTheDocument()
    expect(await screen.findAllByText('Zanaco')).not.toHaveLength(0)
    expect(screen.getByText('Total Banks')).toBeInTheDocument()
    expect(screen.getByText('Active Banks')).toBeInTheDocument()
    expect(screen.getByText('Inactive Banks')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getAllByRole('combobox', { name: /Status|Country/ })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Add Bank' })).toBeInTheDocument()
    for (const heading of ['ID', 'Name', 'Code', 'Country', 'Status', 'Created', 'Actions']) expect(screen.getByRole('columnheader', { name: heading })).toBeInTheDocument()
  })

  it('supports bank CRUD through the shared mock API contract', async () => {
    const list = await apiClient.get('/banks', { baseURL: 'https://api.example.com', params: { page: 1, pageSize: 20 } }) as unknown as { data: { items: Bank[]; total: number } }
    expect(list.data.total).toBe(15)
    const created = await apiClient.post('/banks', { name: 'Copperbelt Community Bank', code: 'CCB', country: 'Zambia', status: 'active', address: 'Kitwe' }, { baseURL: 'https://api.example.com' }) as unknown as { data: Bank }
    expect(created.data.id).toBe(16)
    const updated = await apiClient.put(`/banks/${created.data.id}`, { name: 'Copperbelt Bank', status: 'inactive' }, { baseURL: 'https://api.example.com' }) as unknown as { data: Bank }
    expect(updated.data).toMatchObject({ name: 'Copperbelt Bank', status: 'inactive' })
    await expect(apiClient.get(`/banks/${created.data.id}`, { baseURL: 'https://api.example.com' })).resolves.toMatchObject({ data: { id: created.data.id } })
    await expect(apiClient.delete(`/banks/${created.data.id}`, { baseURL: 'https://api.example.com' })).resolves.toEqual({ success: true })
  })
})
