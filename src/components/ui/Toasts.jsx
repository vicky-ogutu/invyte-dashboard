import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeToast } from '../../store/uiSlice'
import Icon from './Icon'

function Toast({ toast }) {
  const dispatch = useDispatch()
  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(toast.id)), 4500)
    return () => clearTimeout(t)
  }, [dispatch, toast.id])

  const error = toast.tone === 'error'
  return (
    <div role="status" className="pointer-events-auto flex w-80 items-start gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-200">
      <Icon name={error ? 'alert' : 'check'} className={`mt-0.5 h-5 w-5 shrink-0 ${error ? 'text-rose-600' : 'text-emerald-600'}`} />
      <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
      <button onClick={() => dispatch(removeToast(toast.id))} className="text-slate-400 hover:text-slate-600" aria-label="Dismiss">
        <Icon name="x" className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function Toasts() {
  const toasts = useSelector((s) => s.ui.toasts)
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => <Toast key={t.id} toast={t} />)}
    </div>
  )
}
