import Icon from './Icon'

/**
 * columns: [{ key, header, render?(row), sortKey?, align?, className? }]
 * Sorting is server-side: clicking a sortable header calls onSort(sortKey).
 */
export default function DataTable({ columns, rows, loading, error, onRetry, sort, onSort, onRowClick, empty = 'No records found', rowKey = 'id' }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="overflow-x-auto scroll-thin">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {c.sortKey && onSort ? (
                    <button onClick={() => onSort(c.sortKey)} className="inline-flex items-center gap-1 uppercase hover:text-slate-800">
                      {c.header}
                      <Icon
                        name={sort?.sort === c.sortKey && sort.order === 'asc' ? 'chevronUp' : 'chevronDown'}
                        className={`h-3.5 w-3.5 ${sort?.sort === c.sortKey ? 'text-slate-700' : 'text-slate-300'}`}
                      />
                    </button>
                  ) : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && rows.length === 0 &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3.5"><div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" /></td>
                  ))}
                </tr>
              ))}
            {!loading && error && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-sm">
                    <Icon name="alert" className="h-6 w-6 text-rose-500" />
                    <p className="font-medium text-slate-800">Couldn't load this list</p>
                    <p className="text-slate-500">{error}</p>
                    {onRetry && <button onClick={onRetry} className="mt-1 font-medium text-brand-600 hover:text-brand-700">Try again</button>}
                  </div>
                </td>
              </tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
                    <Icon name="inbox" className="h-7 w-7 text-slate-300" />
                    {empty}
                  </div>
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row[rowKey]} onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition ${loading ? 'opacity-60' : ''} ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}>
                {columns.map((c) => (
                  <td key={c.key} className={`whitespace-nowrap px-4 py-3 text-slate-700 ${c.align === 'right' ? 'text-right tabular-nums' : ''} ${c.className || ''}`}>
                    {c.render ? c.render(row) : row[c.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Pagination({ page, pages, total, limit, onChange }) {
  if (!total) return null
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  return (
    <div className="flex flex-col items-center justify-between gap-3 px-1 pt-4 text-sm text-slate-600 sm:flex-row">
      <p>Showing <span className="font-medium text-slate-900">{from}</span>–<span className="font-medium text-slate-900">{to}</span> of <span className="font-medium text-slate-900">{total}</span></p>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}
          className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 ring-1 ring-inset ring-slate-300 hover:bg-white disabled:opacity-40">
          <Icon name="chevronLeft" className="h-4 w-4" /> Prev
        </button>
        <span className="px-3 tabular-nums">Page {page} of {Math.max(pages, 1)}</span>
        <button disabled={page >= pages} onClick={() => onChange(page + 1)}
          className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 ring-1 ring-inset ring-slate-300 hover:bg-white disabled:opacity-40">
          Next <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
