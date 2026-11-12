import Icon from './Icon'

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** One row of filters above a table: search on the left, selects on the right. */
export function Toolbar({ children }) {
  return <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
}

export function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`rounded-xl bg-white shadow-sm ring-1 ring-slate-200 ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

/** Stat tile: label · value · optional secondary line. */
export function StatCard({ label, value, sub, icon, accent = 'bg-brand-50 text-brand-600' }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && (
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

export function DetailList({ items }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
          <dd className="mt-1 break-words text-sm text-slate-900">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Spinner({ className = 'h-6 w-6' }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-brand-600 border-r-transparent ${className}`} />
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
      <Icon name="alert" className="mx-auto h-7 w-7 text-rose-500" />
      <p className="mt-2 font-medium text-slate-800">Something went wrong</p>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">Try again</button>}
    </div>
  )
}
