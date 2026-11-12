const currencyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const compactFmt = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const numberFmt = new Intl.NumberFormat('en-US')

export const money = (v) => currencyFmt.format(Number(v) || 0)
export const moneyCompact = (v) => (Math.abs(Number(v)) >= 10000 ? `$${compactFmt.format(Number(v))}` : money(v))
export const number = (v) => numberFmt.format(Number(v) || 0)
export const compact = (v) => (Math.abs(Number(v)) >= 10000 ? compactFmt.format(Number(v)) : number(v))

export const date = (v) =>
  v ? new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
export const dateTime = (v) =>
  v ? new Date(v).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'

export const relative = (v) => {
  if (!v) return 'Never'
  const seconds = (Date.now() - new Date(v).getTime()) / 1000
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]]
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, size] of units) if (seconds >= size) return rtf.format(-Math.floor(seconds / size), unit)
  return 'Just now'
}

export const humanize = (s) => (s ? String(s).replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : '—')

export const initials = (name = '') =>
  String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'

export const duration = (seconds) => {
  const s = Number(seconds) || 0
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h ? `${h}h ${m}m` : `${m}m`
}
