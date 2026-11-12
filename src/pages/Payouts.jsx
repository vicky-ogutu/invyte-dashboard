import useResourceList from '../hooks/useResourceList'
import DataTable, { Pagination } from '../components/ui/DataTable'
import { PageHeader, Toolbar } from '../components/ui/Page'
import { Select } from '../components/ui/Form'
import Badge from '../components/ui/Badge'
import { dateTime, humanize, money } from '../utils/format'

export default function Payouts() {
  const list = useResourceList('payouts', 'payouts')

  const columns = [
    { key: 'vendor_business_name', header: 'Vendor', render: (p) => <span className="font-medium text-slate-900">{p.vendor_business_name || '—'}</span> },
    { key: 'booking_reference', header: 'Booking', render: (p) => <span className="font-mono text-xs">{p.booking_reference || `#${p.booking_id}`}</span> },
    { key: 'total_amount', header: 'Booking total', align: 'right', render: (p) => money(p.total_amount) },
    { key: 'deposit_amount', header: 'Deposit paid', align: 'right', render: (p) => <div><p>{p.deposit_amount != null ? money(p.deposit_amount) : '—'}</p><p className="text-xs text-slate-500">{p.deposit_paid_at ? dateTime(p.deposit_paid_at) : ''}</p></div> },
    { key: 'final_amount', header: 'Final paid', align: 'right', render: (p) => <div><p>{p.final_amount != null ? money(p.final_amount) : '—'}</p><p className="text-xs text-slate-500">{p.final_paid_at ? dateTime(p.final_paid_at) : ''}</p></div> },
    { key: 'transfers', header: 'Stripe transfers', render: (p) => <div className="font-mono text-[11px] text-slate-500">{[p.stripe_transfer_id, p.final_transfer_id].filter(Boolean).join(' · ') || '—'}</div> },
    { key: 'status', header: 'Status', render: (p) => <Badge status={p.status} /> },
  ]

  return (
    <>
      <PageHeader title="Vendor payouts" description="Money transferred to vendors: a deposit when a booking is paid and the rest on completion." />
      <Toolbar>
        <div className="sm:ml-auto">
          <Select value={list.filters.status} onChange={(v) => list.setFilter('status', v)} placeholder="Any status"
            options={['pending', 'deposit_paid', 'final_paid', 'failed'].map((v) => ({ value: v, label: humanize(v) }))} />
        </div>
      </Toolbar>
      <DataTable columns={columns} rows={list.items} loading={list.status === 'loading'} error={list.error}
        onRetry={list.reload} empty="No payouts yet" />
      <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />
    </>
  )
}
