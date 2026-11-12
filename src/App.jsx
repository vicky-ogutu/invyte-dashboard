import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Users from './pages/Users'
import Vendors from './pages/Vendors'
import Categories from './pages/Categories'
import Services from './pages/Services'
import Events from './pages/Events'
import Bookings from './pages/Bookings'
import Payments from './pages/Payments'
import Payouts from './pages/Payouts'
import Livestreams from './pages/Livestreams'
import Ads from './pages/Ads'
import Reports from './pages/Reports'
import NotFound from './pages/NotFound'

function RequireAdmin() {
  const user = useSelector((s) => s.auth.user)
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAdmin />}>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="users" element={<Users key="users" />} />
          <Route path="consumers" element={<Users key="consumers" userType="consumer" />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="categories" element={<Categories />} />
          <Route path="services" element={<Services />} />
          <Route path="events" element={<Events />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="payments" element={<Payments />} />
          <Route path="payouts" element={<Payouts />} />
          <Route path="livestreams" element={<Livestreams />} />
          <Route path="ads" element={<Ads />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
