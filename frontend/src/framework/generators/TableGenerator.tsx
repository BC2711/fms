import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type PaginationState,
  type Row,
  type SortingState,
  type Updater,
  type VisibilityState,
  useReactTable,
} from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Badge, type BadgeVariant } from '@/components/data-display/Badge'
import { DataTable } from '@/components/data-display/DataTable'
import { TableSkeleton } from '@/components/data-display/TableSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ActionGenerator } from '@/framework/generators/ActionGenerator'
import { DynamicIcon } from '@/framework/runtime/DynamicIcon'
import { PermissionGuard } from '@/framework/runtime/PermissionGuard'
import { resolveEndpoint } from '@/services/endpoint-resolver'
import type { ActionConfig, TableColumnConfig, TableConfig } from '@/types/configuration.types'

export interface ServerPaginationState extends PaginationState {
  pageCount?: number
  total?: number
}

export interface TableGeneratorProps<TData extends object> {
  tableConfig: TableConfig
  data: TData[]
  isLoading: boolean
  isError: boolean
  error?: Error | null
  onRetry?: () => void
  onRowAction?: (action: ActionConfig, row: TData) => void
  pagination: ServerPaginationState
  onPaginationChange: (pagination: PaginationState) => void
  sorting: SortingState
  onSortingChange: (sorting: SortingState) => void
}

function valueFromRow<TData extends object>(row: TData, accessor: string): unknown {
  return accessor.split('.').reduce<unknown>((value, segment) => value && typeof value === 'object' ? (value as Record<string, unknown>)[segment] : undefined, row)
}

function numberValue(value: unknown, column: Extract<TableColumnConfig, { type: 'number' }>): string {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  if (column.format === 'currency') return new Intl.NumberFormat(undefined, { style: 'currency', currency: column.currency ?? 'USD' }).format(number)
  if (column.format === 'percent') return new Intl.NumberFormat(undefined, { style: 'percent' }).format(number)
  return new Intl.NumberFormat().format(number)
}

function defaultBadgeVariant(value: string): BadgeVariant {
  if (value === 'active' || value === 'success') return 'success'
  if (value === 'inactive' || value === 'error') return 'danger'
  if (value === 'draft' || value === 'pending') return 'warning'
  return 'info'
}

function resolveUpdater<T>(updater: Updater<T>, current: T): T {
  return typeof updater === 'function' ? (updater as (old: T) => T)(current) : updater
}

export function TableGenerator<TData extends object>({
  tableConfig,
  data,
  isLoading,
  isError,
  error,
  onRetry,
  onRowAction,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
}: TableGeneratorProps<TData>) {
  const navigate = useNavigate()
  const location = useLocation()
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => Object.fromEntries(tableConfig.columns.map((column) => [column.id, column.visible !== false])))

  const runAction = (action: ActionConfig, row: TData) => {
    onRowAction?.(action, row)
    if (onRowAction) return
    const id = String(valueFromRow(row, tableConfig.rowKey) ?? '')
    const base = location.pathname.replace(/\/(create|[^/]+\/edit|[^/]+)$/, '') || location.pathname
    if (action.path) navigate(resolveEndpoint(action.path, { id }))
    else if (action.type === 'edit') navigate(`${base}/${id}/edit`)
    else if (action.type === 'navigate') navigate(`${base}/${id}`)
  }

  const resolveActions = (actions: ActionConfig[], row: TData) => {
    const id = String(valueFromRow(row, tableConfig.rowKey) ?? '')
    const base = location.pathname.replace(/\/(create|[^/]+\/edit|[^/]+)$/, '') || location.pathname
    return actions.map((action) => ({
      ...action,
      icon: action.icon ?? (action.type === 'edit' ? 'Pencil' : action.type === 'delete' ? 'Trash2' : 'Eye'),
      path: action.path ? resolveEndpoint(action.path, { id }) : action.type === 'edit' ? `${base}/${id}/edit` : action.type === 'navigate' ? `${base}/${id}` : action.path,
      endpoint: action.endpoint ? resolveEndpoint(action.endpoint, { id }) : action.endpoint,
    }))
  }

  const legacyActionButtons = (actions: ActionConfig[], row: TData) => actions.map((action) => (
    <PermissionGuard key={action.id} permissions={action.permission}>
      <button type="button" aria-label={action.label} onClick={() => runAction(action, row)} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white">
        <DynamicIcon iconKey={action.icon ?? (action.type === 'edit' ? 'Pencil' : action.type === 'delete' ? 'Trash2' : 'Eye')} size={16} />
      </button>
    </PermissionGuard>
  ))

  const actionButtons = (actions: ActionConfig[], row: TData, position: 'row' | 'toolbar' = 'row') => onRowAction
    ? legacyActionButtons(actions, row)
    : <ActionGenerator actions={resolveActions(actions, row)} context={{ data: row, queryKey: [location.pathname.split('/').filter(Boolean)[0] ?? location.pathname] }} position={position} />

  const columns = useMemo<ColumnDef<TData>[]>(() => {
    const generated: ColumnDef<TData>[] = tableConfig.columns.map((column) => {
      if (column.type === 'actions') return {
        id: column.id,
        header: column.header,
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => column.actions.length > 3 ? <details className="relative"><summary aria-label="Row actions" className="inline-flex cursor-pointer list-none rounded-md p-1.5"><MoreHorizontal size={18} /></summary><div className="absolute right-0 z-20 flex min-w-40 flex-col gap-1 rounded-lg border bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">{actionButtons(column.actions, row.original, 'toolbar')}</div></details> : <div className="flex items-center gap-1">{actionButtons(column.actions, row.original)}</div>,
      }
      return {
        id: column.id,
        accessorFn: (row) => valueFromRow(row, column.accessor),
        header: column.header,
        enableSorting: column.sortable ?? false,
        enableGlobalFilter: column.searchable ?? false,
        cell: ({ getValue }) => {
          const value = getValue()
          if (column.type === 'number') return numberValue(value, column)
          if (column.type === 'badge') { const label = String(value ?? ''); return <Badge label={label} variant={column.options?.[label] ?? defaultBadgeVariant(label)} /> }
          if (column.type === 'datetime') { const date = new Date(String(value)); return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date) }
          return String(value ?? '')
        },
      }
    })
    if (tableConfig.selectable) generated.unshift({ id: '__select', enableSorting: false, enableGlobalFilter: false, header: ({ table }) => <input aria-label="Select all rows" type="checkbox" checked={table.getIsAllPageRowsSelected()} onChange={table.getToggleAllPageRowsSelectedHandler()} />, cell: ({ row }) => <input aria-label={`Select row ${row.id}`} type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} /> })
    return generated
  }, [tableConfig, location.pathname, onRowAction])

  const pageCount = pagination.pageCount ?? (pagination.total === undefined ? -1 : Math.ceil(pagination.total / pagination.pageSize))
  const table = useReactTable({
    data,
    columns,
    state: { pagination, sorting, rowSelection, globalFilter, columnVisibility },
    pageCount,
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: tableConfig.selectable,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => onPaginationChange(resolveUpdater(updater, pagination)),
    onSortingChange: (updater) => onSortingChange(resolveUpdater(updater, sorting)),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (isError) return <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-900 dark:bg-red-950"><p className="font-medium">Unable to load table data</p><p className="mt-1 text-sm">{error?.message ?? 'An unexpected error occurred.'}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-4 rounded-lg bg-red-600 px-3 py-2 text-sm text-white">Retry</button>}</div>

  const searchable = tableConfig.columns.some((column) => 'searchable' in column && column.searchable)
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">{searchable ? <input aria-label="Search table" value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Search…" className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700" /> : <span />}<details className="relative"><summary className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700">Columns</summary><div className="absolute right-0 z-20 mt-1 min-w-44 rounded-lg border bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">{table.getAllLeafColumns().filter((column) => column.id !== '__select').map((column) => <label key={column.id} className="flex gap-2 px-2 py-1 text-sm"><input type="checkbox" checked={column.getIsVisible()} onChange={column.getToggleVisibilityHandler()} />{String(column.columnDef.header)}</label>)}</div></details></div>
    <DataTable stickyHeader={tableConfig.stickyHeader}>
      <table className="hidden w-full text-left text-sm md:table"><thead className={`bg-gray-50 font-medium dark:bg-gray-800 ${tableConfig.stickyHeader ? 'sticky top-0 z-10' : ''}`}>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="px-4 py-3">{header.isPlaceholder ? null : header.column.getCanSort() ? <button type="button" onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1">{flexRender(header.column.columnDef.header, header.getContext())}{{ asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] ?? ''}</button> : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>{isLoading ? <TableSkeleton columnCount={table.getVisibleLeafColumns().length} /> : <tbody>{table.getRowModel().rows.map((row, index) => <tr key={row.id} className={`${tableConfig.striped && index % 2 ? 'bg-gray-50/70 dark:bg-gray-800/40' : ''} border-t border-gray-100 hover:bg-blue-50/50 dark:border-gray-800 dark:hover:bg-blue-950/20`}>{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>}</table>
      {!isLoading && table.getRowModel().rows.length === 0 && <EmptyState title="No records found" message="Try changing your filters or create a new record." />}
      {!isLoading && table.getRowModel().rows.length > 0 && <div className="divide-y divide-gray-100 md:hidden dark:divide-gray-800">{table.getRowModel().rows.map((row: Row<TData>) => <article key={row.id} className="space-y-2 p-4">{row.getVisibleCells().filter((cell) => cell.column.id !== '__select').map((cell) => <div key={cell.id} className="flex justify-between gap-4"><span className="text-xs font-medium text-gray-500">{String(cell.column.columnDef.header)}</span><span className="text-right text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</span></div>)}</article>)}</div>}
    </DataTable>
    {tableConfig.pagination?.enabled && <div className="flex items-center justify-between text-sm"><button type="button" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Previous</button><span>Page {pagination.pageIndex + 1}</span><div className="flex items-center gap-2"><select aria-label="Rows per page" value={pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))}>{(tableConfig.pagination.pageSizeOptions ?? [10, 20, 50]).map((size) => <option key={size} value={size}>{size}</option>)}</select><button type="button" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Next</button></div></div>}
  </div>
}
