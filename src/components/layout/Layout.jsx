import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import Icon from '../ui/Icon'
import Avatar from '../ui/Avatar'
import Toasts from '../ui/Toasts'
import { toggleSidebar } from '../../store/uiSlice'
import { logout } from '../../store/authSlice'

const NAV = [
  { section: 'Overview', items: [{ to: '/', label: 'Dashboard', icon: 'home', end: true }] },
  {
    section: 'People',
    items: [
      { to: '/users', label: 'All users', icon: 'users' },
      { to: '/consumers', label: 'Consumers', icon: 'user' },
      { to: '/vendors', label: 'Vendors', icon: 'store' },
    ],
  },
  {
    section: 'Marketplace',
    items: [
      { to: '/categories', label: 'Service categories', icon: 'tag' },
      { to: '/services', label: 'Vendor services', icon: 'briefcase' },
      { to: '/events', label: 'Events', icon: 'calendar' },
      { to: '/bookings', label: 'Bookings', icon: 'clipboard' },
      { to: '/livestreams', label: 'Livestreams', icon: 'video' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { to: '/payments', label: 'Payments', icon: 'card' },
      { to: '/payouts', label: 'Vendor payouts', icon: 'wallet' },
      { to: '/ads', label: 'Advertisements', icon: 'megaphone' },
      { to: '/reports', label: 'Reports', icon: 'chart' },
    ],
  },
]

function Sidebar() {
  const open = useSelector((s) => s.ui.sidebarOpen)
  const dispatch = useDispatch()
  const location = useLocation()

  // Close the mobile drawer after navigating.
  useEffect(() => { dispatch(toggleSidebar(false)) }, [location.pathname, dispatch])

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => dispatch(toggleSidebar(false))} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-2.5 px-5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">In</span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Invyte</p>
            <p className="text-[11px] text-slate-400">Admin console</p>
          </div>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scroll-thin">
          {NAV.map((group) => (
            <div key={group.section}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{group.section}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}
                    >
                      <Icon name={item.icon} className="h-[18px] w-[18px]" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}

function Topbar() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/85 px-4 backdrop-blur sm:px-6">
      <button className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => dispatch(toggleSidebar())} aria-label="Open menu">
        <Icon name="menu" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <Avatar src={user?.profile_picture} name={user?.full_name} />
        <div className="hidden leading-tight sm:block">
          <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <button onClick={() => dispatch(logout())} title="Sign out"
          className="ml-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <Icon name="logout" className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  )
}
