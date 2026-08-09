import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState, type PropsWithChildren } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { testItemsListConfig } from '@/config/pages/test-items.config'
import { FilterGenerator, type FilterValues } from '@/framework/generators/FilterGenerator'
import { useDynamicQuery } from '@/hooks/useDynamicQuery'
import { apiClient } from '@/services/api-client'
import { installMockApi, type TestItem } from '@/services/mock-api'
import type { PaginatedResponse } from '@/services/response-mapper'
import type { FilterConfig } from '@/types/configuration.types'

let restoreMock: (() => void) | undefined
afterEach(() => { restoreMock?.(); restoreMock = undefined })

const filters: FilterConfig[] = [
  { id: 'search', type: 'search', label: 'Search', field: 'name', query_parameter: 'q', placeholder: 'Search items' },
  { id: 'status', type: 'select', label: 'Status', field: 'status', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] },
  { id: 'empty', type: 'select', label: 'Category', field: 'category', options: [] },
  { id: 'dates', type: 'date_range', label: 'Created', fromField: 'created_from', toField: 'created_to' },
]

function FilterHarness({ onChange = () => undefined }: { onChange?: (changes: FilterValues) => void }) {
  const [values, setValues] = useState<FilterValues>({ status: 'active' })
  const location = useLocation()
  return <><FilterGenerator filters={filters} values={values} onChange={(changes) => { setValues((current) => ({ ...current, ...changes })); onChange(changes) }} /><output aria-label="filter values">{JSON.stringify(values)}</output><output aria-label="location search">{location.search}</output></>
}

function queryWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: PropsWithChildren) { return <QueryClientProvider client={client}><MemoryRouter>{children}</MemoryRouter></QueryClientProvider> }
}

describe('FilterGenerator', () => {
  it('debounces search before changing query state', async () => {
    const onChange = vi.fn()
    render(<MemoryRouter><FilterHarness onChange={onChange} /></MemoryRouter>)
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'banks' } })
    expect(onChange).not.toHaveBeenCalledWith({ q: 'banks' })
    await waitFor(() => expect(onChange).toHaveBeenCalledWith({ q: 'banks' }), { timeout: 800 })
    await waitFor(() => expect(screen.getByLabelText('location search')).toHaveTextContent('q=banks'))
  })

  it('updates selects, supports empty options, and resets values and URL pagination', async () => {
    render(<MemoryRouter initialEntries={['/?page=3&status=active']}><FilterHarness /></MemoryRouter>)
    expect(screen.getByRole('option', { name: 'All Category' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'inactive' } })
    expect(screen.getByLabelText('filter values')).toHaveTextContent('inactive')
    expect(screen.getByLabelText('location search')).toHaveTextContent('status=inactive')
    expect(screen.getByLabelText('location search')).toHaveTextContent('page=1')

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByLabelText('filter values')).not.toHaveTextContent('inactive')
    expect(screen.getByLabelText('location search')).not.toHaveTextContent('status=')
  })

  it('rejects an inverted date range', () => {
    const onChange = vi.fn()
    render(<MemoryRouter><FilterHarness onChange={onChange} /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Created to'), { target: { value: '2026-01-01' } })
    fireEvent.change(screen.getByLabelText('Created from'), { target: { value: '2026-02-01' } })
    expect(screen.getByRole('alert')).toHaveTextContent('Start date must be before')
    expect(onChange).not.toHaveBeenCalledWith({ created_from: '2026-02-01', created_to: '2026-01-01' })
  })

  it('debounced search changes the mock API result', async () => {
    restoreMock = installMockApi(apiClient, { minDelay: 0, maxDelay: 0, errorRate: 0 })
    function QueryFilters() {
      const [values, setValues] = useState<FilterValues>({})
      const query = useDynamicQuery<PaginatedResponse<TestItem>>({ pageConfig: testItemsListConfig, filters: values, pagination: { page: 1, pageSize: 25 } })
      return <><FilterGenerator filters={[filters[0]]} values={values} onChange={(changes) => setValues((current) => ({ ...current, ...changes }))} /><p>{query.isLoading ? 'Loading' : `Total: ${query.data?.total}`}</p></>
    }
    render(<QueryFilters />, { wrapper: queryWrapper() })
    expect(await screen.findByText('Total: 25')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'Test Item 25' } })
    expect(screen.getByText('Total: 25')).toBeInTheDocument()
    expect(await screen.findByText('Total: 1', {}, { timeout: 1_000 })).toBeInTheDocument()
  })
})
