import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { Badge } from '@/components/data-display/Badge'
import { TableGenerator } from '@/framework/generators/TableGenerator'
import type { TableConfig } from '@/types/configuration.types'

interface RowData {
  id: number
  name: string
  amount: number
  status: string
  created_at: string
}

const tableConfig: TableConfig = {
  rowKey: 'id',
  selectable: true,
  stickyHeader: true,
  striped: true,
  pagination: { enabled: true, pageSize: 10, pageSizeOptions: [10, 20] },
  columns: [
    { id: 'name', type: 'text', header: 'Name', accessor: 'name', sortable: true, searchable: true },
    { id: 'amount', type: 'number', header: 'Amount', accessor: 'amount', format: 'decimal' },
    { id: 'status', type: 'badge', header: 'Status', accessor: 'status', options: { active: 'success', inactive: 'danger' } },
    { id: 'created', type: 'datetime', header: 'Created', accessor: 'created_at', visible: false },
  ],
}

const data: RowData[] = [{ id: 1, name: 'Alpha Item', amount: 1234, status: 'active', created_at: '2026-01-01T10:00:00.000Z' }]

function renderTable(overrides: Partial<React.ComponentProps<typeof TableGenerator<RowData>>> = {}) {
  const props: React.ComponentProps<typeof TableGenerator<RowData>> = {
    tableConfig,
    data,
    isLoading: false,
    isError: false,
    pagination: { pageIndex: 0, pageSize: 10, total: 1 },
    sorting: [],
    onPaginationChange: vi.fn(),
    onSortingChange: vi.fn(),
    ...overrides,
  }
  return { ...render(<MemoryRouter><TableGenerator<RowData> {...props} /></MemoryRouter>), props }
}

describe('TableGenerator', () => {
  it('renders configured columns and formatted cell types while respecting visibility', () => {
    renderTable()
    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Created' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Alpha Item').length).toBeGreaterThan(0)
    expect(screen.getAllByText('1,234').length).toBeGreaterThan(0)
    expect(screen.getAllByText('active')[0]).toHaveClass('bg-green-100')
    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument()
  })

  it('emits controlled sorting changes from sortable headers', () => {
    const onSortingChange = vi.fn()
    renderTable({ onSortingChange })
    fireEvent.click(screen.getByRole('button', { name: 'Name' }))
    expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: false }])
  })

  it('shows skeleton rows while loading', () => {
    renderTable({ data: [], isLoading: true })
    expect(screen.getByRole('rowgroup', { name: 'Loading table' })).toHaveClass('animate-pulse')
  })

  it('shows an empty state when no records are available', () => {
    renderTable({ data: [] })
    expect(screen.getByText('No records found')).toBeInTheDocument()
  })

  it('shows a retryable error state', () => {
    const onRetry = vi.fn()
    renderTable({ isError: true, error: new Error('Network unavailable'), onRetry })
    expect(screen.getByRole('alert')).toHaveTextContent('Network unavailable')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})

describe('Badge', () => {
  it('maps variants to their semantic colors', () => {
    const { rerender } = render(<Badge label="Active" variant="success" />)
    expect(screen.getByText('Active')).toHaveClass('bg-green-100')
    rerender(<Badge label="Inactive" variant="danger" />)
    expect(screen.getByText('Inactive')).toHaveClass('bg-red-100')
  })
})
