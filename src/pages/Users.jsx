import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import useResourceList from '../hooks/useResourceList'
import useAction from '../hooks/useAction'
import { adminApi } from '../api/admin'
import { errorMessage } from '../api/client'
import DataTable, { Pagination } from '../components/ui/DataTable'
import { PageHeader, Toolbar, DetailList, Spinner, Card } from '../components/ui/Page'
import { SearchInput, Select } from '../components/ui/Form'
import { ConfirmDialog, Drawer } from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import { date, money, number, relative } from '../utils/format'

/** Users list. With `userType` it becomes a focused list (e.g. Consumers). */
export default function Users({ userType }) {
  const key = userType ? `${userType}s` : 'users'
  const list = useResourceList(key, 'users', { fixed: userType ? { user_type: userType } : {} })
  const [run, pendingId] = useAction(key)
  const me = useSelector((s) => s.auth.user)
  const [confirm, setConfirm] = useState(null)
  const [selected, setSelected] = useState(null)

  const toggleActive = async (user) => {
    const next = !user.is_active
    const ok = await run(user.id, () => adminApi.setUserStatus(user.id, next), { is_active: next ? 1 : 0 })
    if (ok) setConfirm(null)
  }

  const columns = [
    {
      key: 'full_name', header: 'User', sortKey: 'full_name',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar src={u.profile_picture} name={u.full_name} />
          <div>
            <p className="font-medium text-slate-900">{u.full_name}</p>
            <p className="text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    !userType && { key: 'user_type', header: 'Role', render: (u) => <Badge status={u.user_type} dot={false} /> },
    { key: 'phone', header: 'Phone', render: (u) => u.phone || <span className="text-slate-400">—</span> },
    { key: 'is_verified', header: 'Email', render: (u) => <Badge status={u.is_verified ? 'verified' : 'unverified'} /> },
    { key: 'booking_count', header: 'Bookings', align: 'right', render: (u) => number(u.booking_count) },
    userType === 'consumer' && { key: 'total_spent', header: 'Spent', align: 'right', sortKey: 'total_spent', render: (u) => money(u.total_spent) },
    { key: 'last_login', header: 'Last seen', sortKey: 'last_login', render: (u) => <span className="text-slate-500">{relative(u.last_login)}</span> },
    { key: 'created_at', header: 'Joined', sortKey: 'created_at', render: (u) => date(u.created_at) },
    { key: 'is_active', header: 'Status', render: (u) => <Badge status={u.is_active ? 'active' : 'inactive'} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (u) => u.id === me?.id ? <span className="text-xs text-slate-400">You</span> : (
        <Button size="sm" variant={u.is_active ? 'secondary' : 'primary'} loading={pendingId === u.id}
          onClick={(e) => { e.stopPropagation(); setConfirm(u) }}>
          {u.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ].filter(Boolean)

  return (
    <>
      <PageHeader
        title={userType === 'consumer' ? 'Consumers' : 'All users'}
        description={userType === 'consumer'
          ? 'People who plan events and book vendors.'
          : 'Every account on Invyte: consumers, vendors and admins.'}
      />
      <Toolbar>
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search name, email or phone" />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {!userType && (
            <Select value={list.filters.user_type} onChange={(v) => list.setFilter('user_type', v)} placeholder="All roles"
              options={[{ value: 'consumer', label: 'Consumers' }, { value: 'vendor', label: 'Vendors' }, { value: 'admin', label: 'Admins' }]} />
          )}
          <Select value={list.filters.status} onChange={(v) => list.setFilter('status', v)} placeholder="Any status"
            options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          <Select value={list.filters.verified} onChange={(v) => list.setFilter('verified', v)} placeholder="Any verification"
            options={[{ value: 'yes', label: 'Verified' }, { value: 'no', label: 'Unverified' }]} />
        </div>
      </Toolbar>

      <DataTable columns={columns} rows={list.items} loading={list.status === 'loading'} error={list.error}
        onRetry={list.reload} sort={list.sort} onSort={list.toggleSort} onRowClick={setSelected}
        empty="No users match these filters" />
      <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.is_active ? 'Deactivate account?' : 'Activate account?'}
        message={confirm?.is_active
          ? `${confirm?.full_name} will be signed out everywhere and won't be able to sign in until reactivated.`
          : `${confirm?.full_name} will be able to sign in again.`}
        confirmLabel={confirm?.is_active ? 'Deactivate' : 'Activate'}
        danger={!!confirm?.is_active}
        loading={pendingId === confirm?.id}
        onCancel={() => setConfirm(null)}
        onConfirm={() => toggleActive(confirm)}
      />

      <UserDrawer userId={selected?.id} onClose={() => setSelected(null)} />
    </>
  )
}

function UserDrawer({ userId, onClose }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setUser(null)
    setError(null)
    adminApi.getUser(userId)
      .then((u) => !cancelled && setUser(u))
      .catch((err) => !cancelled && setError(errorMessage(err)))
    return () => { cancelled = true }
  }, [userId])

  return (
    <Drawer open={!!userId} onClose={onClose} title="User details">
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {!user && !error && <div className="flex justify-center py-12"><Spinner /></div>}
      {user && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar src={user.profile_picture} name={user.full_name} size="h-14 w-14 text-base" />
            <div>
              <p className="text-lg font-semibold text-slate-900">{user.full_name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="mt-1.5 flex gap-1.5">
                <Badge status={user.user_type} dot={false} />
                <Badge status={user.is_active ? 'active' : 'inactive'} />
                <Badge status={user.is_verified ? 'verified' : 'unverified'} />
              </div>
            </div>
          </div>
          <DetailList items={[
            ['Phone', user.phone],
            ['Joined', date(user.created_at)],
            ['Last login', relative(user.last_login)],
            ['Rating', `${Number(user.rating).toFixed(1)} (${user.review_count} reviews)`],
            ['Total spent', money(user.total_spent)],
            ['Wallet balance', money(user.wallet_balance)],
          ]} />
          {user.bio && <p className="text-sm text-slate-600">{user.bio}</p>}
          {user.vendor_profile && (
            <Card title="Vendor profile">
              <DetailList items={[
                ['Business', user.vendor_profile.business_name],
                ['Approval', <Badge key="a" status={user.vendor_profile.is_approved ? 'approved' : 'pending'} />],
                ['Completed jobs', number(user.vendor_profile.completed_jobs)],
                ['Earnings', money(user.vendor_profile.total_earnings)],
              ]} />
            </Card>
          )}
          <MiniList title="Recent bookings" empty="No bookings" rows={user.bookings} render={(b) => (
            <>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{b.service_name || b.booking_reference}</p>
                <p className="truncate text-xs text-slate-500">{b.vendor_business_name} · {date(b.service_date)}</p>
              </div>
              <div className="text-right">
                <p className="tabular-nums">{money(b.total_amount)}</p>
                <Badge status={b.booking_status} />
              </div>
            </>
          )} />
          <MiniList title="Events organised" empty="No events" rows={user.events} render={(e) => (
            <>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{e.event_name}</p>
                <p className="truncate text-xs text-slate-500">{e.venue_address || 'No venue'}</p>
              </div>
              <div className="text-right text-xs text-slate-500">{date(e.event_date)}<br /><Badge status={e.event_type} dot={false} /></div>
            </>
          )} />
        </div>
      )}
    </Drawer>
  )
}

export function MiniList({ title, rows, render, empty }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
      {rows.length === 0 ? <p className="text-sm text-slate-500">{empty}</p> : (
        <ul className="divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
          {rows.map((r) => <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">{render(r)}</li>)}
        </ul>
      )}
    </div>
  )
}
