import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useResourceList from '../hooks/useResourceList'
import useAction from '../hooks/useAction'
import { adminApi } from '../api/admin'
import { fetchCategories } from '../store/categoriesSlice'
import DataTable, { Pagination } from '../components/ui/DataTable'
import { PageHeader, Toolbar } from '../components/ui/Page'
import { SearchInput, Select } from '../components/ui/Form'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { date, money } from '../utils/format'

export default function Services() {
  const dispatch = useDispatch()
  const categories = useSelector((s) => s.categories.items)
  const list = useResourceList('services', 'services')
  const [run, pendingId] = useAction('services')

  useEffect(() => { if (!categories.length) dispatch(fetchCategories()) }, [dispatch, categories.length])

  const columns = [
    {
      key: 'service_name', header: 'Service', sortKey: 'service_name',
      render: (s) => (
        <div className="max-w-xs">
          <p className="truncate font-medium text-slate-900">{s.service_name}</p>
          <p className="truncate text-xs text-slate-500">{s.description || 'No description'}</p>
        </div>
      ),
    },
    { key: 'vendor_business_name', header: 'Vendor' },
    { key: 'category_name', header: 'Category', render: (s) => s.category_name || <span className="text-slate-400">Uncategorised</span> },
    { key: 'base_price', header: 'Price', align: 'right', sortKey: 'base_price', render: (s) => <>{money(s.base_price)}<span className="text-xs text-slate-400"> /{s.price_unit}</span></> },
    { key: 'max_capacity', header: 'Capacity', align: 'right', render: (s) => s.max_capacity ?? '—' },
    { key: 'created_at', header: 'Listed', sortKey: 'created_at', render: (s) => date(s.created_at) },
    { key: 'is_active', header: 'Status', render: (s) => <Badge status={s.is_active ? 'active' : 'inactive'} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (s) => (
        <Button size="sm" variant="secondary" loading={pendingId === s.id}
          onClick={() => run(s.id, () => adminApi.setServiceStatus(s.id, !s.is_active), { is_active: s.is_active ? 0 : 1 })}>
          {s.is_active ? 'Hide' : 'Show'}
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Vendor services" description="Every service vendors offer. Hidden services can't be booked." />
      <Toolbar>
        <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search service or vendor" />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Select value={list.filters.category_id} onChange={(v) => list.setFilter('category_id', v)} placeholder="All categories"
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))} />
          <Select value={list.filters.status} onChange={(v) => list.setFilter('status', v)} placeholder="Any status"
            options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Hidden' }]} />
        </div>
      </Toolbar>
      <DataTable columns={columns} rows={list.items} loading={list.status === 'loading'} error={list.error}
        onRetry={list.reload} sort={list.sort} onSort={list.toggleSort} empty="No services match these filters" />
      <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />
    </>
  )
}
