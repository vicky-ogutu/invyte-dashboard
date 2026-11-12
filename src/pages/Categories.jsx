import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories, saveCategory, deleteCategory } from '../store/categoriesSlice'
import { addToast } from '../store/uiSlice'
import { PageHeader, Toolbar } from '../components/ui/Page'
import DataTable from '../components/ui/DataTable'
import Modal, { ConfirmDialog } from '../components/ui/Modal'
import { Field, Input, Textarea, SearchInput, Select, Toggle } from '../components/ui/Form'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Icon from '../components/ui/Icon'
import { money, number, date } from '../utils/format'

const EMPTY = { name: '', slug: '', description: '', icon_url: '', min_service_fee: '', max_service_fee: '', is_active: true }

export default function Categories() {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((s) => s.categories)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState(null) // null | category form object
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { dispatch(fetchCategories()) }, [dispatch])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((c) =>
      (!q || c.name.toLowerCase().includes(q) || (c.slug || '').includes(q)) &&
      (!statusFilter || (statusFilter === 'active' ? c.is_active : !c.is_active)))
  }, [items, search, statusFilter])

  const openForm = (c) => {
    setFormError(null)
    setEditing(c ? {
      ...EMPTY, ...c,
      description: c.description || '', icon_url: c.icon_url || '',
      min_service_fee: c.min_service_fee ?? '', max_service_fee: c.max_service_fee ?? '',
      is_active: !!c.is_active,
    } : { ...EMPTY })
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    const { id, name, slug, description, icon_url, min_service_fee, max_service_fee, is_active } = editing
    const result = await dispatch(saveCategory({ id, name, slug, description, icon_url, min_service_fee, max_service_fee, is_active }))
    setSaving(false)
    if (saveCategory.fulfilled.match(result)) {
      dispatch(addToast(id ? 'Category updated' : 'Category created'))
      setEditing(null)
    } else {
      setFormError(result.payload)
    }
  }

  const toggleActive = async (c) => {
    const result = await dispatch(saveCategory({ ...c, is_active: !c.is_active }))
    dispatch(saveCategory.fulfilled.match(result)
      ? addToast(c.is_active ? `${c.name} deactivated` : `${c.name} activated`)
      : addToast(result.payload, 'error'))
  }

  const confirmDelete = async () => {
    setDeleting(true)
    const result = await dispatch(deleteCategory(toDelete.id))
    setDeleting(false)
    dispatch(deleteCategory.fulfilled.match(result) ? addToast('Category deleted') : addToast(result.payload, 'error'))
    setToDelete(null)
  }

  const set = (field) => (e) => setEditing((c) => ({ ...c, [field]: e.target.value }))

  const columns = [
    {
      key: 'name', header: 'Category',
      render: (c) => (
        <div className="flex items-center gap-3">
          {c.icon_url
            ? <img src={c.icon_url} alt="" className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200" />
            : <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon name="tag" className="h-4 w-4" /></span>}
          <div>
            <p className="font-medium text-slate-900">{c.name}</p>
            <p className="text-xs text-slate-500">/{c.slug}</p>
          </div>
        </div>
      ),
    },
    { key: 'description', header: 'Description', className: 'max-w-xs', render: (c) => <span className="block truncate text-slate-500">{c.description || '—'}</span> },
    {
      key: 'fees', header: 'Service fee range', align: 'right',
      render: (c) => c.min_service_fee == null && c.max_service_fee == null
        ? <span className="text-slate-400">Not set</span>
        : `${c.min_service_fee != null ? money(c.min_service_fee) : '—'} – ${c.max_service_fee != null ? money(c.max_service_fee) : '—'}`,
    },
    { key: 'service_count', header: 'Services', align: 'right', render: (c) => number(c.service_count) },
    { key: 'vendor_count', header: 'Vendors', align: 'right', render: (c) => number(c.vendor_count) },
    { key: 'created_at', header: 'Created', render: (c) => date(c.created_at) },
    {
      key: 'is_active', header: 'Status',
      render: (c) => (
        <button onClick={() => toggleActive(c)} title="Click to toggle">
          <Badge status={c.is_active ? 'active' : 'inactive'} />
        </button>
      ),
    },
    {
      key: 'actions', header: '', align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" icon="edit" onClick={() => openForm(c)}>Edit</Button>
          <Button size="sm" variant="ghost" icon="trash" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => setToDelete(c)}>Delete</Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Service categories"
        description="The categories vendors list their services under. Inactive categories are hidden from the app."
        actions={<Button icon="plus" onClick={() => openForm(null)}>New category</Button>}
      />
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search categories" />
        <div className="sm:ml-auto">
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="All statuses"
            options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </div>
      </Toolbar>
      <DataTable columns={columns} rows={rows} loading={status === 'loading'} error={status === 'failed' ? error : null}
        onRetry={() => dispatch(fetchCategories())} empty={items.length ? 'No categories match' : 'No categories yet. Create the first one.'} />

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit category' : 'New category'}
        description="Vendors pick from these when they add a service."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="category-form" loading={saving}>{editing?.id ? 'Save changes' : 'Create category'}</Button>
          </>
        }
      >
        {editing && (
          <form id="category-form" onSubmit={submit} className="space-y-4">
            {formError && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">{formError}</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name"><Input required value={editing.name} onChange={set('name')} placeholder="Photography" /></Field>
              <Field label="Slug" hint="Leave blank to generate from the name">
                <Input value={editing.slug} onChange={set('slug')} placeholder="photography" />
              </Field>
            </div>
            <Field label="Description"><Textarea value={editing.description} onChange={set('description')} placeholder="What kind of services belong here" /></Field>
            <Field label="Icon URL"><Input type="url" value={editing.icon_url} onChange={set('icon_url')} placeholder="https://…" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Min service fee ($)"><Input type="number" min="0" step="0.01" value={editing.min_service_fee} onChange={set('min_service_fee')} /></Field>
              <Field label="Max service fee ($)"><Input type="number" min="0" step="0.01" value={editing.max_service_fee} onChange={set('max_service_fee')} /></Field>
            </div>
            <Toggle checked={editing.is_active} onChange={(v) => setEditing((c) => ({ ...c, is_active: v }))} label="Active (visible to vendors and consumers)" />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete category?"
        message={Number(toDelete?.service_count) > 0
          ? `${toDelete?.name} is used by ${toDelete?.service_count} service(s), so it can't be deleted. Deactivate it instead.`
          : `${toDelete?.name} will be permanently removed.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
