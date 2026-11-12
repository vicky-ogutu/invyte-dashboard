import { useState } from 'react'
import useResourceList from '../hooks/useResourceList'
import DataTable, { Pagination } from '../components/ui/DataTable'
import { PageHeader, Toolbar, DetailList } from '../components/ui/Page'
import { SearchInput, Select } from '../components/ui/Form'
import { Drawer } from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { date, dateTime, humanize, money } from '../utils/format'

const opts = (values) => values.map((v) => ({ value: v, label: humanize(v) }))

export default function Bookings() {
  const list = useResourceList('bookings', 'bookings')
  const [selected, setSelected] = useState(null)

  const columns = [
    { key: 'booking_reference', header: 'Reference', render: (b) => <span className="font-mono text-xs text-slate-900">{b.booking_reference}</span> },
    { key: 'consumer_name', header: 'Consumer', render: (b) => <div><p>{b.consumer_name}</p><p className="text-xs text-slate-500">{b.consumer_email}</p></div> },
    { key: 'vendor', header: 'Vendor · Service', render: (b) => <div className="max-w-[14rem]"><p className="truncate">{b.vendor_business_name}</p><p className="truncate text-xs text-slate-500">{b.service_name}</p></div> },
    { key: 'event_name', header: 'Event', render: (b) => <span className="block max-w-[12rem] truncate">{b.event_name || '—'}</span> },
    { key: 'service_date', header: 'Service date', sortKey: 'service_date', render: (b) => date(b.service_date) },
    { key: 'total_amount', header: 'Total', align: 'right', sortKey: 'total_amount', render: (b) => money(b.total_amount) },
    { key: 'payment_status', header: 'Payment', render: (b) => <Badge status={b.payment_status} /> },
    { key: 'booking_status', header: 'Status', render: (b) => <Badge status={b.booking_status} /> },
  ]

  return (
    <>
      <PageHeader title="Bookings" description="Every vendor booking made through the app, with payment and fulfilment state." />
      <Toolbar>
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Reference, consumer, vendor, event" />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Select value={list.filters.booking_status} onChange={(v) => list.setFilter('booking_status', v)} placeholder="Any status"
            options={opts(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'])} />
          <Select value={list.filters.payment_status} onChange={(v) => list.setFilter('payment_status', v)} placeholder="Any payment"
            options={opts(['pending', 'partial', 'completed', 'refunded', 'failed', 'waived'])} />
        </div>
      </Toolbar>
      <DataTable columns={columns} rows={list.items} loading={list.status === 'loading'} error={list.error}
        onRetry={list.reload} sort={list.sort} onSort={list.toggleSort} onRowClick={setSelected} empty="No bookings match these filters" />
      <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={`Booking ${selected?.booking_reference || ''}`}>
        {selected && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <Badge status={selected.booking_status} />
              <Badge status={selected.payment_status}>Payment: {humanize(selected.payment_status)}</Badge>
              <Badge status={selected.vendor_payment_status}>Vendor: {humanize(selected.vendor_payment_status)}</Badge>
            </div>
            <DetailList items={[
              ['Consumer', `${selected.consumer_name} (${selected.consumer_email})`],
              ['Vendor', selected.vendor_business_name],
              ['Service', selected.service_name],
              ['Event', selected.event_name],
              ['Service date', `${date(selected.service_date)} ${selected.service_time ? selected.service_time.slice(0, 5) : ''}`],
              ['Quantity', selected.quantity],
              ['Booked on', dateTime(selected.created_at)],
              ['Completed', dateTime(selected.completed_at)],
            ]} />
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              {[
                ['Agreed price', selected.agreed_price],
                ['Service fee', selected.service_fee],
                ['Tax', selected.tax_amount],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-1 text-slate-600"><span>{l}</span><span className="tabular-nums">{money(v)}</span></div>
              ))}
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900"><span>Total</span><span className="tabular-nums">{money(selected.total_amount)}</span></div>
              <div className="flex justify-between py-1 text-slate-600"><span>Paid so far</span><span className="tabular-nums">{money(selected.amount_paid)}</span></div>
            </div>
            {selected.special_requests && (
              <div><h3 className="mb-1 text-sm font-semibold text-slate-900">Special requests</h3><p className="text-sm text-slate-600">{selected.special_requests}</p></div>
            )}
            {selected.cancellation_reason && (
              <div><h3 className="mb-1 text-sm font-semibold text-slate-900">Cancellation reason</h3><p className="text-sm text-slate-600">{selected.cancellation_reason}</p><p className="text-xs text-slate-400">{dateTime(selected.cancelled_at)}</p></div>
            )}
          </div>
        )}
      </Drawer>
    </>
  )
}
