import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/auth/auth.store'
import { ToastContainer } from '@/components/feedback/ToastContainer'
import { useToastStore } from '@/components/feedback/toast.store'
import { ActionGenerator } from '@/framework/generators/ActionGenerator'
import { executeAction, registerAction } from '@/framework/registry/action-registry'
import type { ActionConfig } from '@/types/configuration.types'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
function Location() { return <span data-testid="location">{useLocation().pathname}</span> }
function renderActions(actions: ActionConfig[]) {
  return render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={['/items']}><Routes><Route path="*" element={<><ActionGenerator actions={actions} context={{ data: { id: 1 } }} /><Location /><ToastContainer /></>} /></Routes></MemoryRouter></QueryClientProvider>)
}

describe('action generation and execution', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
    useAuthStore.setState({ user: { id: '1', name: 'Admin', email: 'a@example.com', role: 'admin', permissions: ['items.read'] }, token: 'token', isAuthenticated: true, isLoading: false })
  })

  it('executes navigation actions', async () => {
    renderActions([{ id: 'open', type: 'navigate', label: 'Open', path: '/items/1' }])
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/items/1'))
  })

  it('does not render actions without permission', () => {
    renderActions([{ id: 'restricted', type: 'refresh', label: 'Restricted', permission: { all: ['items.delete'] } }])
    expect(screen.queryByRole('button', { name: 'Restricted' })).not.toBeInTheDocument()
  })

  it('confirms delete, executes it, and shows a success toast', async () => {
    const handler = vi.fn().mockResolvedValue({ deleted: true })
    registerAction('confirmed-test-action', handler)
    renderActions([{ id: 'delete', type: 'confirmed-test-action', label: 'Delete', endpoint: '/items/1', requires_confirmation: true, confirmation: 'Delete this item?', success_message: 'Item deleted.' } as unknown as ActionConfig])
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete this item?')
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(handler).toHaveBeenCalledOnce())
    expect(await screen.findByText('Item deleted.')).toBeInTheDocument()
  })

  it('supports custom registered async actions', async () => {
    registerAction('custom', async (_action, context) => context.data)
    const result = await executeAction({ id: 'custom', type: 'custom', label: 'Custom' } as unknown as ActionConfig, { data: 42 })
    expect(result).toEqual({ success: true, data: 42 })
  })
})
