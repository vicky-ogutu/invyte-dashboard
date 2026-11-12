import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import useResourceList from '../hooks/useResourceList'
import useAction from '../hooks/useAction'
import { adminApi } from '../api/admin'
import { errorMessage } from '../api/client'
import { addToast } from '../store/uiSlice'
import DataTable, { Pagination } from '../components/ui/DataTable'
import { PageHeader, Toolbar } from '../components/ui/Page'
import { Field, Input, Textarea, Select } from '../components/ui/Form'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { date, humanize, money, number } from '../utils/format'

const AD_TYPES = ['banner', 'sponsored_post', 'video', 'sidebar']
const today = () => new Date().toISOString().slice(0, 10)
const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)
const EMPTY = { vendor_id: '', title: '', description: '', media_url: '', click_url: '', ad_type: 'banner', cost_per_click: '0.50', budget: '100', start_date: today(), end_date: inDays(30) }

export default function Ads() {
  const dispatch = useDispatch()
  const list = useResourceList('ads', 'ads')
  const [run, pendingId] = useAction('ads')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [vendors, setVendors] = useState([])

  // Approved vendors for the advertiser picker, loaded when the form first opens.
  useEffect(() => {
    if (!form || vendors.length) return
    adminApi.list('vendors', { approval: 'approved', limit: 100, sort: 'business_name', order: 'asc' })
      .then((r) => setVendors(r.data))
      .catch(() => {})
  }, [form, vendors.length])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.end_date < form.start_date) return setFormError('End date must be after the start date.')
    setSaving(true)
    setFormError(null)
    try {
      await adminApi.createAd({
        ...form,
        vendor_id: form.vendor_id ? Number(form.vendor_id) : null,
        cost_per_click: Number(form.cost_per_click),
        budget: Number(form.budget),
        start_date: `${form.start_date} 00:00:00`,
        end_date: `${form.end_date} 23:59:59`,
      })
      dispatch(addToast('Advertisement created'))
      setForm(null)
      list.reload()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'title', header: 'Ad',
      render: (a) => (
        <div className="flex items-center gap-3">
          {a.media_url && <img src={a.media_url} alt="" className="h-10 w-14 rounded-md object-cover ring-1 ring-slate-200" />}
          <div className="max-w-[16rem]">
            <p className="truncate font-medium text-slate-900">{a.title}</p>
            <p className="truncate text-xs text-slate-500">{a.vendor_business_name || 'Platform ad'}</p>
          </div>
        </div>
      ),
    },
    { key: 'ad_type', header: 'Type', render: (a) => <Badge tone="indigo" dot={false}>{humanize(a.ad_type)}</Badge> },
    { key: 'schedule', header: 'Runs', render: (a) => `${date(a.start_date)} – ${date(a.end_date)}` },
    { key: 'impressions', header: 'Impressions', align: 'right', render: (a) => number(a.impressions) },
    { key: 'clicks', header: 'Clicks', align: 'right', sortKey: 'clicks', render: (a) => number(a.clicks) },
    { key: 'ctr', header: 'CTR', align: 'right', render: (a) => (a.impressions ? `${((a.clicks / a.impressions) * 100).toFixed(1)}%` : '—') },
    { key: 'spent', header: 'Spent / budget', align: 'right', sortKey: 'spent', render: (a) => `${money(a.spent)} / ${money(a.budget)}` },
    { key: 'is_active', header: 'Status', render: (a) => <Badge status={a.is_active ? 'active' : 'inactive'} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (a) => (
        <Button size="sm" variant="secondary" loading={pendingId === a.id}
          onClick={() => run(a.id, () => adminApi.setAdStatus(a.id, !a.is_active), { is_active: a.is_active ? 0 : 1 })}>
          {a.is_active ? 'Pause' : 'Resume'}
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Advertisements" description="Sponsored placements shown in the app."
        actions={<Button icon="plus" onClick={() => { setFormError(null); setForm({ ...EMPTY }) }}>New ad</Button>} />
      <Toolbar>
        <div className="sm:ml-auto">
          <Select value={list.filters.status} onChange={(v) => list.setFilter('status', v)} placeholder="Any status"
            options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Paused' }]} />
        </div>
      </Toolbar>
      <DataTable columns={columns} rows={list.items} loading={list.status === 'loading'} error={list.error}
        onRetry={list.reload} sort={list.sort} onSort={list.toggleSort} empty="No advertisements yet" />
      <Pagination page={list.page} pages={list.pages} total={list.total} limit={list.limit} onChange={list.setPage} />

      <Modal open={!!form} onClose={() => setForm(null)} title="New advertisement" width="max-w-2xl"
        footer={<>
          <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
          <Button type="submit" form="ad-form" loading={saving}>Create ad</Button>
        </>}>
        {form && (
          <form id="ad-form" onSubmit={submit} className="space-y-4">
            {formError && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">{formError}</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Title"><Input required value={form.title} onChange={set('title')} /></Field>
              <Field label="Advertiser">
                <Select className="w-full" value={form.vendor_id} onChange={(v) => setForm((f) => ({ ...f, vendor_id: v }))} placeholder="Invyte (platform ad)"
                  options={vendors.map((v) => ({ value: String(v.id), label: v.business_name || v.full_name }))} />
              </Field>
            </div>
            <Field label="Description"><Textarea value={form.description} onChange={set('description')} /></Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Media URL"><Input type="url" value={form.media_url} onChange={set('media_url')} placeholder="https://…" /></Field>
              <Field label="Click-through URL"><Input type="url" value={form.click_url} onChange={set('click_url')} placeholder="https://…" /></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Type">
                <Select className="w-full" value={form.ad_type} onChange={(v) => setForm((f) => ({ ...f, ad_type: v }))}
                  options={AD_TYPES.map((t) => ({ value: t, label: humanize(t) }))} />
              </Field>
              <Field label="Cost per click ($)"><Input type="number" min="0" step="0.01" required value={form.cost_per_click} onChange={set('cost_per_click')} /></Field>
              <Field label="Budget ($)"><Input type="number" min="0" step="0.01" required value={form.budget} onChange={set('budget')} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start date"><Input type="date" required value={form.start_date} onChange={set('start_date')} /></Field>
              <Field label="End date"><Input type="date" required value={form.end_date} onChange={set('end_date')} /></Field>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
