import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { TableGenerator } from '@/framework/generators/TableGenerator'
import type { TableConfig } from '@/types/configuration.types'

const config: TableConfig = { rowKey: 'id', columns: [{ id: 'name', type: 'text', header: 'Name', accessor: 'name', sortable: true }, { id: 'amount', type: 'number', header: 'Amount', accessor: 'amount' }, { id: 'status', type: 'badge', header: 'Status', accessor: 'status', options: { active: 'success' } }, { id: 'created', type: 'datetime', header: 'Created', accessor: 'created_at' }, { id: 'actions', type: 'actions', header: 'Actions', actions: [{ id: 'view', type: 'navigate', label: 'View', icon: 'Eye' }] }] }
const data = [{ id: 1, name: 'Alpha', amount: 1200, status: 'active', created_at: '2026-01-01T10:00:00Z' }]
function renderTable(overrides = {}) { const props = { tableConfig: config, data, isLoading: false, isError: false, pagination: { pageIndex: 0, pageSize: 10, total: 1 }, sorting: [], onPaginationChange: vi.fn(), onSortingChange: vi.fn(), ...overrides }; return { props, ...render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><TableGenerator {...props} /></MemoryRouter></QueryClientProvider>) } }

describe('configured TableGenerator', () => {
  it('renders typed columns, badge color, and row actions', () => { renderTable(); expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0); expect(screen.getAllByText('1,200').length).toBeGreaterThan(0); expect(screen.getAllByText('active')[0]).toHaveClass('bg-green-100'); expect(screen.getAllByRole('button', { name: 'View' }).length).toBeGreaterThan(0) })
  it('shows its loading skeleton', () => { renderTable({ data: [], isLoading: true }); expect(screen.getByRole('rowgroup', { name: 'Loading table' })).toBeInTheDocument() })
  it('shows its empty state', () => { renderTable({ data: [] }); expect(screen.getByText('No records found')).toBeInTheDocument() })
  it('emits sorting changes', () => { const onSortingChange = vi.fn(); renderTable({ onSortingChange }); fireEvent.click(screen.getByRole('button', { name: 'Name' })); expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: false }]) })
})
