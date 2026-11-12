import { useState } from 'react'
import { compact, number } from '../../utils/format'

/** Rounds an axis maximum up to a clean value and returns ~4 evenly spaced ticks. */
function niceTicks(max) {
  if (max <= 0) return [0, 1]
  const rough = max / 4
  const mag = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rough)
  const ticks = []
  for (let v = 0; v <= max + step * 0.001 || ticks.length < 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6)
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step)
  return ticks
}

export function Legend({ series }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
      {series.map((s) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  )
}

/**
 * Stacked column chart. data: [{ label, [seriesKey]: number }], series: [{ key, label, color }]
 * Columns cap at 24px, segments are separated by a 2px surface gap, and only the
 * top of the stack is rounded.
 */
export function StackedColumnChart({ data, series, height = 220, valueFormat = number }) {
  const [hover, setHover] = useState(null)
  const totals = data.map((d) => series.reduce((sum, s) => sum + (Number(d[s.key]) || 0), 0))
  const ticks = niceTicks(Math.max(...totals, 0))
  const top = ticks[ticks.length - 1]

  return (
    <div className="flex gap-3">
      {/* y-axis */}
      <div className="relative w-8 shrink-0 text-right text-[11px] tabular-nums text-slate-400" style={{ height }}>
        {ticks.map((t) => (
          <span key={t} className="absolute right-0" style={{ bottom: `${(t / top) * 100}%`, transform: 'translateY(50%)' }}>
            {compact(t)}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }}>
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-[var(--color-grid)]" style={{ bottom: `${(t / top) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end">
            {data.map((d, i) => (
              <div
                key={d.label}
                className="relative flex h-full flex-1 flex-col items-center justify-end"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {hover === i && <div className="absolute inset-y-0 inset-x-1 rounded-md bg-slate-100/70" />}
                <div className="relative flex w-full max-w-6 flex-col-reverse gap-[2px]" style={{ height: `${(totals[i] / top) * 100}%` }}>
                  {series.map((s, si) => {
                    const v = Number(d[s.key]) || 0
                    if (!v) return null
                    const isTop = series.slice(si + 1).every((n) => !Number(d[n.key]))
                    return (
                      <div key={s.key} style={{ flexGrow: v, flexBasis: 0, background: s.color }}
                        className={`min-h-[2px] ${isTop ? 'rounded-t' : ''}`} />
                    )
                  })}
                </div>
                {hover === i && (
                  <div className="pointer-events-none absolute z-10 mb-2 w-max rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg"
                    style={{ bottom: `${(totals[i] / top) * 100}%` }}>
                    <p className="mb-1 font-semibold">{d.label}</p>
                    {series.map((s) => (
                      <p key={s.key} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                        <span className="text-slate-300">{s.label}</span>
                        <span className="ml-auto pl-3 font-medium tabular-nums">{valueFormat(d[s.key])}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex text-[11px] text-slate-500">
          {data.map((d) => <span key={d.label} className="flex-1 truncate text-center">{d.short || d.label}</span>)}
        </div>
      </div>
    </div>
  )
}

/**
 * Horizontal single-series bars with the value at each bar's tip.
 * data: [{ label, value }]
 */
export function BarList({ data, color = 'var(--color-series-1)', valueFormat = number }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(...data.map((d) => Number(d.value) || 0), 0)
  if (!data.length) return <p className="py-6 text-center text-sm text-slate-500">No data yet</p>
  return (
    <ul className="space-y-3">
      {data.map((d, i) => {
        const pct = max ? ((Number(d.value) || 0) / max) * 100 : 0
        return (
          <li key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            className={`-mx-2 rounded-md px-2 py-1 transition ${hover === i ? 'bg-slate-50' : ''}`}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-600">{d.label}</span>
              <span className="font-medium tabular-nums text-slate-900">{valueFormat(d.value)}</span>
            </div>
            <div className="h-2.5 w-full">
              <div className="h-full rounded-r" style={{ width: `${Math.max(pct, d.value ? 1.5 : 0)}%`, background: color }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Plain table alternative for any chart, so values never rely on reading the graphic. */
export function ChartTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            {columns.map((c) => <th key={c.key} className={`py-2 pr-4 font-semibold ${c.align === 'right' ? 'text-right' : ''}`}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              {columns.map((c) => (
                <td key={c.key} className={`py-2 pr-4 text-slate-700 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                  {c.format ? c.format(r[c.key]) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
