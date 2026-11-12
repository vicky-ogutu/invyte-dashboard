import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { login } from '../store/authSlice'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'

export default function Login() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { user, status, error } = useSelector((s) => s.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (user) return <Navigate to={location.state?.from || '/'} replace />

  const submit = (e) => {
    e.preventDefault()
    dispatch(login({ email: email.trim(), password }))
  }

  const input = 'block w-full rounded-lg border-0 bg-white py-2.5 px-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600'

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">In</span>
          <span className="text-lg font-semibold text-white">Invyte</span>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold leading-tight text-white">Run the Invyte marketplace from one place.</h1>
          <p className="mt-4 text-slate-400">Approve vendors, manage service categories, follow bookings and payments, and keep an eye on livestreams and revenue.</p>
        </div>
        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} Invyte</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Admin sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Only accounts with the admin role can sign in.</p>

          {error && (
            <div className="mt-6 flex gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
              <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className={input} placeholder="admin@invyte.app" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password}
                  onChange={(e) => setPassword(e.target.value)} className={`${input} pr-10`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600">
                  <Icon name="eye" className="h-4 w-4" />
                </button>
              </div>
            </label>
          </div>

          <Button type="submit" loading={status === 'loading'} className="mt-6 w-full h-10">Sign in</Button>
        </form>
      </div>
    </div>
  )
}
