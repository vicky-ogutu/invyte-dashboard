import client from './client'

// Every endpoint returns { success, message, data }; these helpers unwrap `data`.
const get = (url, params) => client.get(url, { params }).then((r) => r.data.data)
const send = (method, url, body) => client[method](url, body).then((r) => r.data)

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }).then((r) => r.data.data),
  logout: (refresh_token) => client.post('/auth/logout', { refresh_token }).catch(() => {}),
  me: () => get('/auth/me'),
}

export const adminApi = {
  stats: () => get('/admin/stats'),
  revenue: () => get('/admin/reports/revenue'),

  list: (endpoint, params) => get(`/admin/${endpoint}`, params),
  getUser: (id) => get(`/admin/users/${id}`),
  getVendor: (id) => get(`/admin/vendors/${id}`),

  setUserStatus: (id, is_active) => send('patch', `/admin/users/${id}/status`, { is_active }),
  setUserVerified: (id, is_verified) => send('patch', `/admin/users/${id}/verification`, { is_verified }),
  setVendorApproval: (id, is_approved) => send('patch', `/admin/vendors/${id}/approval`, { is_approved }),
  setServiceStatus: (id, is_active) => send('patch', `/admin/services/${id}/status`, { is_active }),
  setAdStatus: (id, is_active) => send('patch', `/admin/ads/${id}/status`, { is_active }),

  categories: () => get('/admin/categories'),
  createCategory: (body) => send('post', '/admin/categories', body),
  updateCategory: (id, body) => send('put', `/admin/categories/${id}`, body),
  deleteCategory: (id) => send('delete', `/admin/categories/${id}`),

  createAd: (body) => send('post', '/admin/ads', body),

  exportAnalytics: (params) =>
    client.get('/admin/analytics/export', { params: { ...params, format: 'csv' }, responseType: 'blob' }).then((r) => r.data),
}
