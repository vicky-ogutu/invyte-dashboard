import useResourceList from '../hooks/useResourceList'
import DataTable, { Pagination } from '../components/ui/DataTable'
import { PageHeader, Toolbar } from '../components/ui/Page'
import { SearchInput, Select } from '../components/ui/Form'
import Badge from '../components/ui/Badge'
import { dateTime, humanize, money } from '../utils/format'

const opts = (values) => values.map((v) => ({ value: v, label: humanize(v) }))

export default function Payments() {
  const list = useResourceList('payments', 'payments')

  const columns = [
    { key: 'payment_intent_id', header: 'Payment', render: (p) => <span className="font-mono text-xs text-slate-700">{p.payment_intent_id || `#${p.id}`}</span> },
    { key: 'user_name', header: 'Payer', render: (p) => <div><p>{p.user_name || '—'}</p><p className="text-xs text-slate-500">{p.user_email}</p></div> },
    { key: 'payment_type', header: 'Type', render: (p) => <Badge tone="indigo" dot={false}>{humanize(p.payment_type)}</Badge> },
    { key: 'booking_reference', header: 'Booking', render: (p) => p.booking_reference ? <span className="font-mono text-xs">{p.booking_reference}</span> : '—' },
    { key: 'payment_method', header: 'Method', render: (p) => humanize(p.payment_method) },
    { key: 'amount', header: 'Amount', align: 'right', sortKey: 'amount', render: (p) => money(p.amount) },
    { key: 'refund_amount', header: 'Refunded', align: 'right', render: (p) => (Number(p.refund_amount) ? money(p.refund_amount) : '—') },
    { key: 'status', header: 'Status', render: (p) => <Badge status={p.status} /> },
    { key: 'created_at', header: 'Created', sortKey: 'created_at', render: (p) => <span className="text-slate-500">{dateTime(p.created_at)}</span> },
  ]

  return (
    <>
      <PageHeader title="Payments" description="Stripe payments for booking deposits, final payments and stream passes." />
      <Toolbar>
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Payment ID, payer or booking" />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Select value={list.filters.payment_type} onChange={(v) => list.setFilter('payment_type', v)} placeholder="Any type"
            options={opts(['deposit', 'final', 'livestream', 'service_fee'])} />
          <Select value={list.filters.status} onChange={(v) => list.setFilter('status', v)} placeholder="Any status"
            options={opts(['pending', 'succeeded', 'failed', 'refunded'])} />
        </div>
      </Toolbar>
      <DataTable columns={columns} rows={list.items} loading={list.status === 'loading'} error={list.error}
        onRetry={list.reload} sort={list.sort} onSort={list.toggleSort} empty="No payments match these filters" />
      <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />
    </>
  )
}
