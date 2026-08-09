import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AppRouter } from '@/app/router/AppRouter'
import { useAuthStore } from '@/auth/auth.store'
import { ToastContainer } from '@/components/feedback/ToastContainer'
import { getPageConfigByRoute, pageRegistry } from '@/config/page-registry'
import { NavigationGenerator } from '@/framework/generators/NavigationGenerator'
import { apiClient } from '@/services/api-client'
import { installMockApi } from '@/services/mock-api'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { menuConfig } from '@/config/menu.config'

let restoreMock: (() => void) | undefined
function LocationProbe() { const location = useLocation(); return <span data-testid="router-location" className="sr-only">{location.pathname}{location.search}</span> }
function renderApplication(path = '/test-items') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } })
  return render(<QueryClientProvider client={client}><ThemeProvider><MemoryRouter initialEntries={[path]}><AppRouter /><LocationProbe /><ToastContainer /></MemoryRouter></ThemeProvider></QueryClientProvider>)
}

describe('test-items module integration', () => {
  beforeEach(() => {
    restoreMock = installMockApi(apiClient, { minDelay: 10, maxDelay: 10, errorRate: 0 })
    act(() => useAuthStore.setState({ user: { id: '1', name: 'Administrator', email: 'admin@example.com', role: 'super_admin', permissions: [] }, token: 'token', isAuthenticated: true, isLoading: false }))
  })
  afterEach(() => restoreMock?.())

  it('registers and resolves list and sub-page routes precisely', () => {
    expect(Object.keys(pageRegistry)).toEqual(expect.arrayContaining(['test-items', 'test-items-create', 'test-items-details', 'test-items-edit']))
    expect(getPageConfigByRoute('/test-items')?.id).toBe('test-items')
    expect(getPageConfigByRoute('/test-items/create')?.id).toBe('test-items-create')
    expect(getPageConfigByRoute('/test-items/12')?.id).toBe('test-items-details')
    expect(getPageConfigByRoute('/test-items/12/edit')?.id).toBe('test-items-edit')
  })

  it('completes create, view, edit, filter, sort, pagination, and export flows', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-export')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    renderApplication()
    expect(screen.getByRole('rowgroup', { name: 'Loading table' })).toBeInTheDocument()
    expect((await screen.findAllByText('Test Item 1')).length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Status' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Add Test Item' }))
    expect(await screen.findByRole('heading', { name: 'Add Test Item' })).toBeInTheDocument()
    expect(screen.getByTestId('router-location')).toHaveTextContent('/test-items/create')
    expect(screen.getByText('create mode')).toBeInTheDocument()
    const createForm = screen.getByRole('main').querySelector('form') as HTMLFormElement
    expect(createForm).toBeTruthy()
    fireEvent.change(createForm.elements.namedItem('name') as HTMLInputElement, { target: { value: 'E2E Created Item' } })
    fireEvent.change(createForm.elements.namedItem('description') as HTMLTextAreaElement, { target: { value: 'Created through the full module flow' } })
    fireEvent.change(createForm.elements.namedItem('status') as HTMLSelectElement, { target: { value: 'active' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add Test Item' }))
    expect(await screen.findByText('Record created successfully.')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Test Items' }, { timeout: 3000 })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'E2E Created Item' } })
    expect((await screen.findAllByText('E2E Created Item', {}, { timeout: 3000 })).length).toBeGreaterThan(0)
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'active' } })
    const createdCells = await screen.findAllByText('E2E Created Item')
    const createdRow = createdCells.find((cell) => cell.closest('tr'))?.closest('tr')
    expect(createdRow).toBeTruthy()
    fireEvent.click(within(createdRow as HTMLTableRowElement).getByRole('button', { name: 'View' }))
    expect(await screen.findByRole('heading', { name: 'Test Item Details' })).toBeInTheDocument()
    expect(await screen.findByText('Created through the full module flow')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(await screen.findByRole('heading', { name: 'Edit Test Item' })).toBeInTheDocument()
    const editForm = await waitFor(() => { const form = screen.getByRole('main').querySelector('form'); if (!form) throw new Error('Edit form not ready'); return form as HTMLFormElement })
    const name = editForm.elements.namedItem('name') as HTMLInputElement
    await waitFor(() => expect(name).toHaveValue('E2E Created Item'))
    fireEvent.change(name, { target: { value: 'E2E Updated Item' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
    expect(await screen.findByText('Record updated successfully.')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Test Items' })).toBeInTheDocument()

    fireEvent.change(await screen.findByLabelText('Search'), { target: { value: 'E2E Updated Item' } })
    expect((await screen.findAllByText('E2E Updated Item', {}, { timeout: 3000 })).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))
    await waitFor(() => expect(createObjectURL).toHaveBeenCalled())
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: '' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: '' } })
    await screen.findAllByText('Test Item 1', {}, { timeout: 3000 })
    fireEvent.click(screen.getByRole('button', { name: 'Name' }))
    await waitFor(() => expect(screen.getByTestId('router-location')).toHaveTextContent('sort=name'))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Page 2')).toBeInTheDocument()
  }, 30000)

  it('enforces menu and action permissions while allowing read access', async () => {
    useAuthStore.setState({ user: { id: '2', name: 'Viewer', email: 'viewer@example.com', role: 'viewer', permissions: ['test_items.view'] }, token: 'token', isAuthenticated: true, isLoading: false })
    renderApplication()
    expect((await screen.findAllByText('Test Item 1')).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Add Test Item' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'View' }).length).toBeGreaterThan(0)
  })

  it('hides the module menu without view permission', () => {
    useAuthStore.setState({ user: { id: '3', name: 'Other', email: 'other@example.com', role: 'viewer', permissions: [] }, token: 'token', isAuthenticated: true, isLoading: false })
    render(<MemoryRouter><NavigationGenerator menuItems={menuConfig} collapsed={false} layout="sidebar" /></MemoryRouter>)
    expect(screen.queryByText('Test Items')).not.toBeInTheDocument()
  })
})
