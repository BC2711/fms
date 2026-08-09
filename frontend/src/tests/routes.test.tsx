import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it } from 'vitest'

import { AppRouter } from '@/app/router/AppRouter'
import { findDuplicateRoutes, generateBreadcrumbTrail, hasDuplicateRoutes, interpolateRoute } from '@/app/router/route-utils'
import { useAuthStore } from '@/auth/auth.store'
import type { User } from '@/auth/auth.types'
import { getAllPageConfigs, pageRegistry } from '@/config/page-registry'
import { generateRoutes } from '@/framework/generators/RouteGenerator'
import type { PageConfig } from '@/types/configuration.types'
import { ThemeProvider } from '@/providers/ThemeProvider'

const user: User = { id: '1', name: 'Admin', email: 'admin@example.com', role: 'super_admin', permissions: [] }

function renderRoute(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><ThemeProvider><MemoryRouter initialEntries={[path]}><AppRouter /></MemoryRouter></ThemeProvider></QueryClientProvider>)
}

describe('dynamic route generation', () => {
  beforeEach(() => {
    localStorage.setItem('fms.layout', 'mac-sidebar')
    useAuthStore.setState({ user, token: 'token', isAuthenticated: true, isLoading: false })
  })

  it('generates registry and nested sub-page paths plus a catch-all', () => {
    const paths = generateRoutes(pageRegistry).map((route) => (route.props as { path: string }).path)
    expect(paths).toEqual(expect.arrayContaining([
      '/dashboard', '/test-items', '/test-items/create', '/test-items/:id', '/test-items/:id/edit', '*',
    ]))
  })

  it('navigates from a list page to the generated create page', async () => {
    renderRoute('/test-items')
    expect(screen.getByRole('heading', { name: 'Test Items' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add Test Item' }))
    expect(await screen.findByRole('heading', { name: 'Add Test Item' })).toBeInTheDocument()
    expect(screen.getByText('create mode')).toBeInTheDocument()
  })

  it('redirects unauthenticated users from protected pages', async () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
    renderRoute('/dashboard')
    expect(await screen.findByRole('heading', { name: 'Unauthorized' })).toBeInTheDocument()
  })

  it('shows the generated 404 page for unmatched routes', () => {
    renderRoute('/does-not-exist')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('supports route utilities', () => {
    expect(interpolateRoute('/test-items/:id/edit', { id: 12 })).toBe('/test-items/12/edit')
    expect(interpolateRoute('/teams/{team}', { team: 'A B' })).toBe('/teams/A%20B')
    expect(hasDuplicateRoutes(getAllPageConfigs())).toBe(false)

    const duplicate = { ...getAllPageConfigs()[0], id: 'duplicate' } as PageConfig
    expect(findDuplicateRoutes([...getAllPageConfigs(), duplicate])).toContain('/dashboard')
    expect(generateBreadcrumbTrail('/test-items/12/edit', getAllPageConfigs())).toEqual([
      { label: 'Test Items', path: '/test-items' },
      { label: 'Test Item Details', path: '/test-items/12' },
      { label: 'Edit Test Item', path: '/test-items/12/edit' },
    ])
  })
})
