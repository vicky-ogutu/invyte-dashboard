import { useEffect, useState } from 'react'
import useResourceList from '../hooks/useResourceList'
import useAction from '../hooks/useAction'
import { adminApi } from '../api/admin'
import { errorMessage } from '../api/client'
import DataTable, { Pagination } from '../components/ui/DataTable'
import { PageHeader, Toolbar, DetailList, Spinner } from '../components/ui/Page'
import { SearchInput, Select } from '../components/ui/Form'
import { Drawer } from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { MiniList } from './Users'
import { date, money, number } from '../utils/format'

export default function Vendors() {
  const list = useResourceList('vendors', 'vendors')
  const [run, pendingId] = useAction('vendors')
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailError, setDetailError] = useState(null)

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    setDetail(null)
    setDetailError(null)
    adminApi.getVendor(selectedId)
      .then((v) => !cancelled && setDetail(v))
      .catch((err) => !cancelled && setDetailError(errorMessage(err)))
    return () => { cancelled = true }
  }, [selectedId])

  const setApproval = async (vendor, approved) => {
    const ok = await run(vendor.id, () => adminApi.setVendorApproval(vendor.id, approved), { is_approved: approved ? 1 : 0 })
    if (ok && detail?.id === vendor.id) setDetail((d) => ({ ...d, is_approved: approved ? 1 : 0 }))
  }

  const columns = [
    {
      key: 'business_name', header: 'Business', sortKey: 'business_name',
      render: (v) => (
        <div className="flex items-center gap-3">
          <Avatar src={v.profile_picture} name={v.business_name || v.full_name} />
          <div>
            <p className="font-medium text-slate-900">{v.business_name || 'Unnamed business'}</p>
            <p className="text-xs text-slate-500">{v.full_name} · {v.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'service_category', header: 'Category', render: (v) => v.service_category || <span className="text-slate-400">—</span> },
    { key: 'service_count', header: 'Services', align: 'right', render: (v) => number(v.service_count) },
    { key: 'booking_count', header: 'Bookings', align: 'right', render: (v) => number(v.booking_count) },
    { key: 'rating', header: 'Rating', align: 'right', sortKey: 'rating', render: (v) => `${Number(v.rating).toFixed(1)} ★` },
    { key: 'total_earnings', header: 'Earnings', align: 'right', sortKey: 'total_earnings', render: (v) => money(v.total_earnings) },
    { key: 'stripe', header: 'Payouts', render: (v) => <Badge tone={v.stripe_onboarding_complete ? 'green' : 'gray'}>{v.stripe_onboarding_complete ? 'Connected' : 'Not set up'}</Badge> },
    { key: 'is_approved', header: 'Approval', render: (v) => <Badge status={v.is_approved ? 'approved' : 'pending'} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (v) => (
        <Button size="sm" variant={v.is_approved ? 'secondary' : 'primary'} icon={v.is_approved ? undefined : 'check'}
          loading={pendingId === v.id} onClick={(e) => { e.stopPropagation(); setApproval(v, !v.is_approved) }}>
          {v.is_approved ? 'Revoke' : 'Approve'}
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Vendors" description="Businesses offering services on Invyte. Only approved vendors appear in the app." />
      <Toolbar>
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search business, owner or email" />
        <div className="flex gap-2 sm:ml-auto">
          <Select value={list.filters.approval} onChange={(v) => list.setFilter('approval', v)} placeholder="All vendors"
            options={[{ value: 'pending', label: 'Awaiting approval' }, { value: 'approved', label: 'Approved' }]} />
        </div>
      </Toolbar>
      <DataTable columns={columns} rows={list.items} loading={list.status === 'loading'} error={list.error}
        onRetry={list.reload} sort={list.sort} onSort={list.toggleSort} onRowClick={(v) => setSelectedId(v.id)}
        empty="No vendors match these filters" />
      <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />

      <Drawer open={!!selectedId} onClose={() => setSelectedId(null)} title="Vendor details">
        {detailError && <p className="text-sm text-rose-600">{detailError}</p>}
        {!detail && !detailError && <div className="flex justify-center py-12"><Spinner /></div>}
        {detail && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar src={detail.profile_picture} name={detail.business_name} size="h-14 w-14 text-base" />
                <div>
                  <p className="text-lg font-semibold text-slate-900">{detail.business_name}</p>
                  <p className="text-sm text-slate-500">{detail.full_name} · {detail.email}</p>
                  <div className="mt-1.5"><Badge status={detail.is_approved ? 'approved' : 'pending'} /></div>
                </div>
              </div>
              <Button size="sm" variant={detail.is_approved ? 'secondary' : 'primary'} loading={pendingId === detail.id}
                onClick={() => setApproval(detail, !detail.is_approved)}>
                {detail.is_approved ? 'Revoke approval' : 'Approve vendor'}
              </Button>
            </div>
            {detail.description && <p className="text-sm text-slate-600">{detail.description}</p>}
            <DetailList items={[
              ['Business phone', detail.business_phone],
              ['Business email', detail.business_email],
              ['Address', detail.business_address],
              ['Category', detail.service_category],
              ['Registration no.', detail.business_registration_number],
              ['Tax ID', detail.tax_id],
              ['Experience', `${detail.years_experience || 0} years`],
              ['Completed jobs', number(detail.completed_jobs)],
              ['Total earnings', money(detail.total_earnings)],
              ['Pending payouts', money(detail.pending_payouts)],
              ['Approved on', date(detail.approval_date)],
              ['Joined', date(detail.joined_at)],
            ]} />
            <MiniList title="Services" empty="No services listed" rows={detail.services} render={(s) => (
              <>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{s.service_name}</p>
                  <p className="truncate text-xs text-slate-500">{s.category_name || 'Uncategorised'} · per {s.price_unit}</p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums">{money(s.base_price)}</p>
                  <Badge status={s.is_active ? 'active' : 'inactive'} />
                </div>
              </>
            )} />
            <MiniList title="Recent bookings" empty="No bookings" rows={detail.bookings} render={(b) => (
              <>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{b.service_name || b.booking_reference}</p>
                  <p className="truncate text-xs text-slate-500">{b.consumer_name} · {date(b.service_date)}</p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums">{money(b.total_amount)}</p>
                  <Badge status={b.booking_status} />
                </div>
              </>
            )} />
          </div>
        )}
      </Drawer>
    </>
  )
}
