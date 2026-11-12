import useResourceList from '../hooks/useResourceList'
import DataTable, { Pagination } from '../components/ui/DataTable'
import { PageHeader, Toolbar } from '../components/ui/Page'
import { Select } from '../components/ui/Form'
import Badge from '../components/ui/Badge'
import { dateTime, duration, humanize, money, number } from '../utils/format'

export default function Livestreams() {
  const list = useResourceList('livestreams', 'livestreams')

  const columns = [
    { key: 'event_name', header: 'Event', render: (l) => <div><p className="font-medium text-slate-900">{l.event_name || `Event #${l.event_id}`}</p><p className="text-xs text-slate-500">{l.organizer_name}</p></div> },
    { key: 'stream_status', header: 'Status', render: (l) => <Badge status={l.stream_status} /> },
    { key: 'scheduled_start', header: 'Scheduled', render: (l) => dateTime(l.scheduled_start) },
    { key: 'actual_start', header: 'Went live', render: (l) => dateTime(l.actual_start) },
    { key: 'on_air_seconds', header: 'On air', align: 'right', render: (l) => duration(l.on_air_seconds) },
    { key: 'pay_per_view_price', header: 'Pass price', align: 'right', render: (l) => (Number(l.pay_per_view_price) > 0 ? money(l.pay_per_view_price) : 'Free') },
    { key: 'pass_count', header: 'Passes', align: 'right', render: (l) => number(l.pass_count) },
    { key: 'view_count', header: 'Views', align: 'right', sortKey: 'view_count', render: (l) => number(l.view_count) },
    { key: 'total_revenue', header: 'Revenue', align: 'right', sortKey: 'total_revenue', render: (l) => money(l.total_revenue) },
  ]

  return (
    <>
      <PageHeader title="Livestreams" description="Event streams, their on-air time and stream-pass sales." />
      <Toolbar>
        <div className="sm:ml-auto">
          <Select value={list.filters.stream_status} onChange={(v) => list.setFilter('stream_status', v)} placeholder="Any status"
            options={['scheduled', 'live', 'ended', 'failed'].map((v) => ({ value: v, label: humanize(v) }))} />
        </div>
      </Toolbar>
      <DataTable columns={columns} rows={list.items} loading={list.status === 'loading'} error={list.error}
        onRetry={list.reload} sort={list.sort} onSort={list.toggleSort} empty="No livestreams match" />
      <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />
    </>
  )
}
