import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/auth/auth.store'
import type { User } from '@/auth/auth.types'
import { PageGenerator } from '@/framework/generators/PageGenerator'

const user: User = { id: '1', name: 'Admin', email: 'admin@example.com', role: 'super_admin', permissions: [] }

function renderPage(pageKey: string, path: string) {
  const patterns: Record<string, string> = {
    'test-items-create': '/test-items/create',
    'test-items-edit': '/test-items/:id/edit',
    'test-items-details': '/test-items/:id',
  }
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><Routes><Route path={patterns[pageKey] ?? '*'} element={<PageGenerator pageKey={pageKey} />} /></Routes></MemoryRouter></QueryClientProvider>)
}

describe('PageGenerator', () => {
  beforeEach(() => useAuthStore.setState({ user, token: 'token', isAuthenticated: true, isLoading: false }))

  it('routes dashboard configuration to DashboardGenerator', () => {
    renderPage('dashboard', '/dashboard')
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getAllByText('Test Items')).toHaveLength(2)
  })

  it('composes list breadcrumbs, header, actions, statistics, filters, and table', () => {
    renderPage('test-items', '/test-items')
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Home')
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Test Items')
    expect(screen.getByRole('heading', { name: 'Test Items' })).toBeInTheDocument()
    expect(screen.getByText('Manage configured test items.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Test Item' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Statistics' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Filters' })).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('routes nested create, edit, and details configurations with params', () => {
    const create = renderPage('test-items-create', '/test-items/create')
    expect(screen.getByText('create mode')).toBeInTheDocument()
    create.unmount()

    const edit = renderPage('test-items-edit', '/test-items/42/edit')
    expect(screen.getByText('edit mode')).toBeInTheDocument()
    expect(screen.getByText('Record: 42')).toBeInTheDocument()
    edit.unmount()

    renderPage('test-items-details', '/test-items/42')
    expect(screen.getByRole('heading', { name: 'Test Item Details' })).toBeInTheDocument()
    expect(screen.getByText('Record: 42')).toBeInTheDocument()
  })

  it('renders the authentication loading state', () => {
    useAuthStore.setState({ isLoading: true })
    renderPage('dashboard', '/dashboard')
    expect(screen.getByRole('status')).toHaveTextContent('Checking authentication')
  })
})
