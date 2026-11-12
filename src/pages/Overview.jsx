import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchStats } from '../store/statsSlice'
import { PageHeader, Card, StatCard, Spinner, ErrorState } from '../components/ui/Page'
import { StackedColumnChart, BarList, Legend, ChartTable } from '../components/charts/Charts'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { compact, money, moneyCompact, humanize, relative, number } from '../utils/format'

const SERIES = [
  { key: 'consumers', label: 'Consumers', color: 'var(--color-series-1)' },
  { key: 'vendors', label: 'Vendors', color: 'var(--color-series-2)' },
]
const BOOKING_ORDER = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed']

/** Fills the last 12 months so months with no sign-ups still get a slot. */
function last12Months(rows) {
  const byMonth = Object.fromEntries(rows.map((r) => [r.month, r]))
  const out = []
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - 11)
  for (let i = 0; i < 12; i++) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    out.push({
      label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      short: d.toLocaleDateString('en-US', { month: 'short' }),
      consumers: byMonth[key]?.consumers || 0,
      vendors: byMonth[key]?.vendors || 0,
    })
    d.setMonth(d.getMonth() + 1)
  }
  return out
}

export default function Overview() {
  const dispatch = useDispatch()
  const { data, status, error, fetchedAt } = useSelector((s) => s.stats)
  const [showTable, setShowTable] = useState(false)

  useEffect(() => { dispatch(fetchStats()) }, [dispatch])

  const signups = useMemo(() => last12Months(data?.signups_by_month || []), [data])
  const bookingStatus = useMemo(() => {
    const counts = Object.fromEntries((data?.bookings_by_status || []).map((r) => [r.status, r.count]))
    return BOOKING_ORDER.map((s) => ({ label: humanize(s), value: counts[s] || 0 }))
  }, [data])
  const revenue = data?.revenue
  const revenueRows = revenue ? [
    { label: 'Booking service fees', value: revenue.service_fees },
    { label: 'Stream passes', value: revenue.livestream_revenue },
    { label: 'Advertising', value: revenue.ad_revenue },
    { label: 'Vendor boosts', value: revenue.boost_revenue },
  ] : []

  if (status === 'failed' && !data) return <ErrorState message={error} onRetry={() => dispatch(fetchStats())} />
  if (!data) return <div className="flex h-64 items-center justify-center"><Spinner /></div>

  const { users, vendors, events, bookings, payments, categories, services, livestreams } = data

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={fetchedAt ? `Platform overview · updated ${relative(fetchedAt)}` : 'Platform overview'}
        actions={<Button variant="secondary" icon="refresh" loading={status === 'loading'} onClick={() => dispatch(fetchStats())}>Refresh</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={compact(users.total)} icon="users"
          sub={`${number(users.consumers)} consumers · ${number(users.vendors)} vendors`} />
        <StatCard label="Vendors" value={compact(vendors.total)} icon="store" accent="bg-violet-50 text-violet-600"
          sub={vendors.pending ? `${number(vendors.pending)} awaiting approval` : 'All approved'} />
        <StatCard label="Bookings" value={compact(bookings.total)} icon="clipboard" accent="bg-sky-50 text-sky-600"
          sub={`${moneyCompact(bookings.gross_value)} paid booking value`} />
        <StatCard label="Platform revenue" value={moneyCompact(revenue?.total)} icon="dollar" accent="bg-emerald-50 text-emerald-600"
          sub="Fees, passes, ads and boosts" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Events" value={events.total} sub={`${number(events.upcoming)} upcoming`} to="/events" />
        <MiniStat label="Service categories" value={categories.total} sub={`${number(categories.active)} active`} to="/categories" />
        <MiniStat label="Vendor services" value={services.total} sub={`${number(services.active)} active`} to="/services" />
        <MiniStat label="Livestreams" value={livestreams.total} sub={livestreams.live ? `${number(livestreams.live)} live now` : `${money(livestreams.revenue)} earned`} to="/livestreams" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="New sign-ups"
          subtitle="Accounts created per month, last 12 months"
          action={
            <button onClick={() => setShowTable((v) => !v)} className="text-xs font-medium text-brand-600 hover:text-brand-700">
              {showTable ? 'View chart' : 'View table'}
            </button>
          }
        >
          {showTable ? (
            <ChartTable
              columns={[
                { key: 'label', header: 'Month' },
                { key: 'consumers', header: 'Consumers', align: 'right', format: number },
                { key: 'vendors', header: 'Vendors', align: 'right', format: number },
              ]}
              rows={signups}
            />
          ) : (
            <>
              <div className="mb-4"><Legend series={SERIES} /></div>
              <StackedColumnChart data={signups} series={SERIES} />
            </>
          )}
        </Card>

        <Card title="Bookings by status" subtitle={`${number(bookings.total)} bookings in total`}>
          <BarList data={bookingStatus} />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Revenue by source" subtitle={`${money(revenue?.total)} total`}>
          <BarList data={revenueRows} valueFormat={money} />
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
            <div>
              <p className="text-xs text-slate-500">Payments succeeded</p>
              <p className="font-semibold tabular-nums text-slate-900">{number(payments.succeeded)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Payments failed</p>
              <p className="font-semibold tabular-nums text-slate-900">{number(payments.failed)}</p>
            </div>
          </div>
        </Card>

        <Card title="Recent bookings" action={<Link to="/bookings" className="text-xs font-medium text-brand-600 hover:text-brand-700">View all</Link>}>
          <ul className="-my-2 divide-y divide-slate-100">
            {data.recent_bookings.length === 0 && <li className="py-6 text-center text-sm text-slate-500">No bookings yet</li>}
            {data.recent_bookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{b.vendor_business_name || 'Vendor'}</p>
                  <p className="truncate text-xs text-slate-500">{b.consumer_name} · {relative(b.created_at)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-medium tabular-nums text-slate-900">{money(b.total_amount)}</span>
                  <Badge status={b.booking_status} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Newest users" action={<Link to="/users" className="text-xs font-medium text-brand-600 hover:text-brand-700">View all</Link>}>
          <ul className="-my-2 divide-y divide-slate-100">
            {data.recent_users.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-2.5">
                <Avatar src={u.profile_picture} name={u.full_name} size="h-8 w-8 text-[11px]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{u.full_name}</p>
                  <p className="truncate text-xs text-slate-500">{relative(u.created_at)}</p>
                </div>
                <Badge status={u.user_type} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}

function MiniStat({ label, value, sub, to }) {
  return (
    <Link to={to} className="group rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-200 transition hover:ring-brand-300">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{compact(value)}</p>
      <p className="text-xs text-slate-500 group-hover:text-brand-600">{sub}</p>
    </Link>
  )
}
