import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/auth/auth.store'
import type { User } from '@/auth/auth.types'
import { FormGenerator, type FormValues } from '@/framework/generators/FormGenerator'
import { PageGenerator } from '@/framework/generators/PageGenerator'
import { apiClient } from '@/services/api-client'
import { installMockApi } from '@/services/mock-api'
import type { FormConfig } from '@/types/configuration.types'

const formConfig: FormConfig = {
  submitLabel: 'Create record',
  resetEnabled: true,
  fields: [
    { name: 'id', type: 'hidden', label: 'ID', default_value: 'new' },
    { name: 'name', type: 'text', label: 'Name', required: true, section: 'Basics', grid: { columns: 6 }, validation: { min_length: 3, max_length: 5 } },
    { name: 'email', type: 'email', label: 'Email', required: true, section: 'Basics', grid: { columns: 6 } },
    { name: 'password', type: 'password', label: 'Password', section: 'Security', grid: { columns: 6 } },
    { name: 'website', type: 'url', label: 'Website', section: 'Security', grid: { columns: 6 } },
    { name: 'description', type: 'textarea', label: 'Description', rows: 6, grid: { columns: 12 } },
    { name: 'status', type: 'select', label: 'Status', options: [{ label: 'Active', value: 'active' }], grid: { columns: 6 } },
    { name: 'date', type: 'date', label: 'Date', grid: { columns: 6 } },
  ],
}

let restoreMock: (() => void) | undefined
afterEach(() => { restoreMock?.(); restoreMock = undefined })

describe('FormGenerator', () => {
  it('renders dynamic field types, sections, and 12-column grid spans', () => {
    render(<MemoryRouter><FormGenerator formConfig={formConfig} mode="create" onSubmit={() => undefined} isSubmitting={false} /></MemoryRouter>)
    expect(screen.getByText('Basics')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByLabelText(/Name/)).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText(/Email/)).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText('Website')).toHaveAttribute('type', 'url')
    expect(screen.getByLabelText('Description').tagName).toBe('TEXTAREA')
    expect(screen.getByLabelText('Status').tagName).toBe('SELECT')
    expect(screen.getByLabelText('Date')).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText(/Name/).closest('[data-grid-columns]')).toHaveAttribute('data-grid-columns', '6')
    expect(document.querySelector('input[type="hidden"]')).toHaveValue('new')
  })

  it('enforces required, minimum, maximum, email, and URL validation', async () => {
    const onSubmit = vi.fn()
    render(<MemoryRouter><FormGenerator formConfig={formConfig} mode="create" onSubmit={onSubmit} isSubmitting={false} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Create record' }))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Email is required')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'ab' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'invalid' } })
    fireEvent.change(screen.getByLabelText('Website'), { target: { value: 'not-a-url' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create record' }))
    expect(await screen.findByText('Name must be at least 3 characters')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid URL')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'abcdef' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create record' }))
    expect(await screen.findByText('Name must be at most 5 characters')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits valid create values and resets to configured defaults', async () => {
    const onSubmit = vi.fn<(values: FormValues) => void>()
    render(<MemoryRouter><FormGenerator formConfig={formConfig} mode="create" onSubmit={onSubmit} isSubmitting={false} /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Alpha' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'alpha@example.com' } })
    fireEvent.change(screen.getByLabelText('Website'), { target: { value: 'https://example.com' } })
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'active' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create record' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ id: 'new', name: 'Alpha', email: 'alpha@example.com', status: 'active' }), expect.anything()))

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByLabelText(/Name/)).toHaveValue('')
    expect(document.querySelector('input[type="hidden"]')).toHaveValue('new')
  })
})

describe('edit form integration', () => {
  const user: User = { id: '1', name: 'Admin', email: 'admin@example.com', role: 'super_admin', permissions: [] }
  beforeEach(() => useAuthStore.setState({ user, token: 'token', isAuthenticated: true, isLoading: false }))

  it('loads existing mock data and resets it into the edit form', async () => {
    restoreMock = installMockApi(apiClient, { minDelay: 20, maxDelay: 20, errorRate: 0 })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/test-items/2/edit']}><Routes><Route path="/test-items/:id/edit" element={<PageGenerator pageKey="test-items-edit" />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(screen.getByLabelText('Loading form')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByLabelText(/Name/)).toHaveValue('Test Item 2'))
    expect(screen.getByLabelText('Description')).toHaveValue('Description for test item 2')
    expect(screen.getByLabelText(/Status/)).toHaveValue('inactive')
  })
})
