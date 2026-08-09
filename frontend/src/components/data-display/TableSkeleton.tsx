export function TableSkeleton({ columnCount, rowCount = 6 }: { columnCount: number; rowCount?: number }) {
  return <tbody aria-label="Loading table" className="animate-pulse">{Array.from({ length: rowCount }, (_, row) => <tr key={row}>{Array.from({ length: columnCount }, (_, column) => <td key={column} className="px-4 py-4"><div className={`h-4 rounded bg-gray-200 dark:bg-gray-700 ${column % 3 === 0 ? 'w-3/4' : column % 3 === 1 ? 'w-1/2' : 'w-5/6'}`} /></td>)}</tr>)}</tbody>
}
