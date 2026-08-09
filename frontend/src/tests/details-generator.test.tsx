import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/auth/auth.store'
import type { User } from '@/auth/auth.types'
import { getPageConfig } from '@/config/page-registry'
import { DetailsGenerator } from '@/framework/generators/DetailsGenerator'
import { PageGenerator } from '@/framework/generators/PageGenerator'
import { apiClient } from '@/services/api-client'
import { installMockApi } from '@/services/mock-api'
import type { DetailsPageConfig } from '@/types/configuration.types'

const baseConfig = getPageConfig('test-items-details') as DetailsPageConfig
const config: DetailsPageConfig = {
  ...baseConfig,
  title: 'Account Details',
  page_title: 'Account Details',
  sections: [{
    id: 'all-fields', title: 'All fields', fields: [
      { key: 'name', label: 'Name', type: 'text', copyable: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'website', label: 'Website', type: 'url' },
      { key: 'created_at', label: 'Created', type: 'datetime' },
      { key: 'status', label: 'Status', type: 'badge', badgeVariants: { active: 'success' } },
      { key: 'enabled', label: 'Enabled', type: 'boolean' },
      { key: 'avatar', label: 'Avatar', type: 'image' },
      { key: 'document', label: 'Document', type: 'file' },
      { key: 'secret', label: 'Secret', type: 'text', sensitive: true, copyable: true },
    ],
  }],
}

const data = {
  name: 'Alice', email: 'alice@example.com', website: 'https://example.com', created_at: '2026-01-02T10:00:00.000Z',
  status: 'active', enabled: true, avatar: '/avatar.png', document: '/report.pdf', secret: 'classified',
}

let restoreMock: (() => void) | undefined
const user: User = { id: '1', name: 'Admin', email: 'admin@example.com', role: 'super_admin', permissions: [] }

function renderDetails(props: Partial<React.ComponentProps<typeof DetailsGenerator>> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/accounts/1']}><Routes><Route path="/accounts/:id" element={<DetailsGenerator pageConfig={config} data={data} {...props} />} /></Routes></MemoryRouter></QueryClientProvider>)
}

beforeEach(() => useAuthStore.setState({ user, token: 'token', isAuthenticated: true, isLoading: false }))
afterEach(() => { restoreMock?.(); restoreMock = undefined })

describe('DetailsGenerator', () => {
  it('renders sections, field formats, related records, and page actions', () => {
    renderDetails()
    expect(screen.getByRole('heading', { name: 'Account Details' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'All fields' })).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('active')).toHaveClass('bg-green-100')
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Avatar' })).toHaveAttribute('src', '/avatar.png')
    expect(screen.getByRole('link', { name: /download file/i })).toHaveAttribute('download')
    expect(screen.getByText('Related records will appear here.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('toggles masked fields and copies their raw values', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    renderDetails()
    expect(screen.getByText('••••••••')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show Secret' }))
    expect(screen.getByText('classified')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Copy Secret' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('classified'))
  })

  it('shows the detail skeleton while loading', () => {
    renderDetails({ isLoading: true })
    expect(screen.getByLabelText('Loading details')).toHaveClass('animate-pulse')
  })

  it('shows a not-found error with a back button', () => {
    renderDetails({ isError: true, error: new Error('Missing record') })
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Item not found')
    expect(alert).toHaveTextContent('Missing record')
    expect(within(alert).getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('fetches and renders test-item details from the generated route', async () => {
    restoreMock = installMockApi(apiClient, { minDelay: 10, maxDelay: 10, errorRate: 0 })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/test-items/3']}><Routes><Route path="/test-items/:id" element={<PageGenerator pageKey="test-items-details" />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(screen.getByLabelText('Loading details')).toBeInTheDocument()
    expect(await screen.findByText('Test Item 3')).toBeInTheDocument()
    expect(screen.getByText('Description for test item 3')).toBeInTheDocument()
    expect(screen.getByText('draft')).toHaveClass('bg-yellow-100')
  })
})
