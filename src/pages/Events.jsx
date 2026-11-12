import useResourceList from '../hooks/useResourceList'
import DataTable, { Pagination } from '../components/ui/DataTable'
import { PageHeader, Toolbar } from '../components/ui/Page'
import { SearchInput, Select } from '../components/ui/Form'
import Badge from '../components/ui/Badge'
import Icon from '../components/ui/Icon'
import { date, money, number } from '../utils/format'

const time = (t) => (t ? t.slice(0, 5) : '')

export default function Events() {
  const list = useResourceList('events', 'events')

  const columns = [
    {
      key: 'event_name', header: 'Event', sortKey: 'event_name',
      render: (e) => (
        <div className="flex items-center gap-3">
          {e.cover_image
            ? <img src={e.cover_image} alt="" className="h-10 w-14 rounded-md object-cover ring-1 ring-slate-200" />
            : <span className="inline-flex h-10 w-14 items-center justify-center rounded-md bg-slate-100 text-slate-400"><Icon name="calendar" className="h-4 w-4" /></span>}
          <div className="max-w-[16rem]">
            <p className="truncate font-medium text-slate-900">{e.event_name}</p>
            <p className="truncate text-xs text-slate-500">{e.venue_address || 'No venue set'}</p>
          </div>
        </div>
      ),
    },
    { key: 'organizer_name', header: 'Organiser', render: (e) => <div><p>{e.organizer_name}</p><p className="text-xs text-slate-500">{e.organizer_email}</p></div> },
    { key: 'event_date', header: 'Date', sortKey: 'event_date', render: (e) => <div><p>{date(e.event_date)}</p><p className="text-xs text-slate-500">{[time(e.start_time), time(e.end_time)].filter(Boolean).join(' – ')}</p></div> },
    { key: 'event_type', header: 'Visibility', render: (e) => <Badge status={e.event_type} dot={false} /> },
    { key: 'expected_attendees', header: 'Guests', align: 'right', render: (e) => number(e.expected_attendees) },
    { key: 'booking_count', header: 'Bookings', align: 'right', render: (e) => number(e.booking_count) },
    { key: 'budget', header: 'Budget', align: 'right', render: (e) => (e.budget ? money(e.budget) : '—') },
    { key: 'engagement', header: 'Views · Likes', align: 'right', render: (e) => `${number(e.view_count)} · ${number(e.like_count)}` },
    { key: 'is_live', header: '', render: (e) => (e.is_live ? <Badge status="live">Live</Badge> : null) },
  ]

  return (
    <>
      <PageHeader title="Events" description="Events created by organisers on Invyte." />
      <Toolbar>
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search event, venue or organiser" />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Select value={list.filters.when} onChange={(v) => list.setFilter('when', v)} placeholder="Any date"
            options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }]} />
          <Select value={list.filters.event_type} onChange={(v) => list.setFilter('event_type', v)} placeholder="Any visibility"
            options={[{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }]} />
        </div>
      </Toolbar>
      <DataTable columns={columns} rows={list.items} loading={list.status === 'loading'} error={list.error}
        onRetry={list.reload} sort={list.sort} onSort={list.toggleSort} empty="No events match these filters" />
      <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />
    </>
  )
}
