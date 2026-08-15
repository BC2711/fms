import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { FormGenerator } from '@/framework/generators/FormGenerator'
import type { FormConfig } from '@/types/configuration.types'

const config: FormConfig = { fields: [{ name: 'name', type: 'text', label: 'Name', required: true }, { name: 'email', type: 'email', label: 'Email' }, { name: 'description', type: 'textarea', label: 'Description' }, { name: 'status', type: 'select', label: 'Status', default_value: 'active', options: [{ label: 'Active', value: 'active' }] }] }
describe('configured FormGenerator', () => {
  it('renders field types and default values', () => { render(<MemoryRouter><FormGenerator formConfig={config} mode="create" onSubmit={vi.fn()} isSubmitting={false} /></MemoryRouter>); expect(screen.getByLabelText(/Name/)).toBeInTheDocument(); expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email'); expect(screen.getByLabelText('Description').tagName).toBe('TEXTAREA'); expect(screen.getByLabelText('Status')).toHaveValue('active') })
  it('validates required fields', async () => { render(<MemoryRouter><FormGenerator formConfig={config} mode="create" onSubmit={vi.fn()} isSubmitting={false} /></MemoryRouter>); fireEvent.click(screen.getByRole('button', { name: 'Create' })); expect(await screen.findByRole('alert')).toHaveTextContent('Name is required') })
  it('submits form data', async () => { const submit = vi.fn(); render(<MemoryRouter><FormGenerator formConfig={config} mode="create" onSubmit={submit} isSubmitting={false} /></MemoryRouter>); fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Alpha' } }); fireEvent.click(screen.getByRole('button', { name: 'Create' })); await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alpha', status: 'active' }), expect.anything())) })
  it('loads edit initial data', async () => { render(<MemoryRouter><FormGenerator formConfig={config} mode="edit" initialData={{ name: 'Existing', status: 'active' }} onSubmit={vi.fn()} isSubmitting={false} /></MemoryRouter>); await waitFor(() => expect(screen.getByLabelText(/Name/)).toHaveValue('Existing')) })
  it('normalizes numeric select values loaded in edit mode', async () => {
    const submit = vi.fn()
    const editConfig: FormConfig = { fields: [{ name: 'station_type_id', type: 'select', label: 'Station Type', required: true, options: [{ label: 'Service Station', value: 1 }] }] }
    render(<MemoryRouter><FormGenerator formConfig={editConfig} mode="edit" initialData={{ station_type_id: 1 }} onSubmit={submit} isSubmitting={false} /></MemoryRouter>)
    expect(screen.getByLabelText(/Station Type/)).toHaveValue('1')
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({ station_type_id: '1' }), expect.anything()))
  })
  it('lays fields out using the configured column count', () => { render(<MemoryRouter><FormGenerator formConfig={{ ...config, layout: { type: 'columns', columns: 3 } }} mode="create" onSubmit={vi.fn()} isSubmitting={false} /></MemoryRouter>); expect(screen.getByLabelText(/Name/).closest('[data-grid-columns]')).toHaveAttribute('data-grid-columns', '4') })
})
