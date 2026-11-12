import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { adminApi } from '../api/admin'
import { errorMessage } from '../api/client'
import { addToast } from '../store/uiSlice'
import { PageHeader, Card, StatCard, Spinner, ErrorState } from '../components/ui/Page'
import { BarList } from '../components/charts/Charts'
import { Field, Input } from '../components/ui/Form'
import Button from '../components/ui/Button'
import { money } from '../utils/format'

export default function Reports() {
  const dispatch = useDispatch()
  const [revenue, setRevenue] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState({ date_from: '', date_to: '' })
  const [exporting, setExporting] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    adminApi.revenue()
      .then(setRevenue)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const exportCsv = async () => {
    setExporting(true)
    try {
      const params = Object.fromEntries(Object.entries(range).filter(([, v]) => v))
      if (params.date_to) params.date_to = `${params.date_to} 23:59:59`
      const blob = await adminApi.exportAnalytics(params)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invyte-analytics-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      dispatch(addToast('Analytics export downloaded'))
    } catch (err) {
      dispatch(addToast(errorMessage(err), 'error'))
    } finally {
      setExporting(false)
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (loading && !revenue) return <div className="flex h-64 items-center justify-center"><Spinner /></div>

  const sources = [
    { label: 'Booking service fees', value: revenue.service_fees },
    { label: 'Stream passes', value: revenue.livestream_revenue },
    { label: 'Advertising', value: revenue.ad_revenue },
    { label: 'Vendor boosts', value: revenue.boost_revenue },
  ]

  return (
    <>
      <PageHeader title="Reports" description="Platform revenue and raw analytics exports."
        actions={<Button variant="secondary" icon="refresh" loading={loading} onClick={load}>Refresh</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total revenue" value={money(revenue.total)} icon="dollar" accent="bg-emerald-50 text-emerald-600" />
        {sources.map((s) => <StatCard key={s.label} label={s.label} value={money(s.value)} />)}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Revenue by source" subtitle="All time">
          <BarList data={sources} valueFormat={money} />
        </Card>
        <Card title="Export user analytics" subtitle="Download app analytics events as CSV for analysis in a spreadsheet.">
          <div className="grid grid-cols-2 gap-4">
            <Field label="From"><Input type="date" value={range.date_from} onChange={(e) => setRange((r) => ({ ...r, date_from: e.target.value }))} /></Field>
            <Field label="To"><Input type="date" value={range.date_to} onChange={(e) => setRange((r) => ({ ...r, date_to: e.target.value }))} /></Field>
          </div>
          <p className="mt-3 text-xs text-slate-500">Leave both empty to export everything.</p>
          <Button className="mt-4" icon="download" loading={exporting} onClick={exportCsv}>Download CSV</Button>
        </Card>
      </div>
    </>
  )
}
