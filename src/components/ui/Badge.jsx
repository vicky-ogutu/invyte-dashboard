import { humanize } from '../../utils/format'

const tones = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

// Status words the API uses, mapped to a tone. Every badge also shows its label,
// so state never depends on color alone.
const statusTone = {
  active: 'green', approved: 'green', completed: 'green', succeeded: 'green', confirmed: 'green',
  paid: 'green', final_paid: 'green', verified: 'green', live: 'red',
  pending: 'amber', partial: 'amber', in_progress: 'blue', scheduled: 'blue', held: 'amber',
  processing: 'blue', deposit_paid: 'blue', waived: 'gray',
  inactive: 'gray', ended: 'gray', free: 'gray', unverified: 'gray',
  cancelled: 'red', failed: 'red', refunded: 'violet', disputed: 'red', rejected: 'red',
  consumer: 'blue', vendor: 'violet', admin: 'indigo', public: 'green', private: 'gray',
}

export default function Badge({ children, tone, status, dot = true }) {
  const t = tone || statusTone[status] || 'gray'
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[t]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children ?? humanize(status)}
    </span>
  )
}
