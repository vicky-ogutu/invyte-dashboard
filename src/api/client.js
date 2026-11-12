import axios from 'axios'
import { loadSession, saveSession, clearSession } from './session'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const client = axios.create({ baseURL: API_URL, timeout: 20000 })

let onExpired = () => {}
/** The store registers how to react when the session can't be refreshed. */
export const setSessionExpiredHandler = (fn) => { onExpired = fn }

client.interceptors.request.use((config) => {
  const session = loadSession()
  if (session?.access_token) config.headers.Authorization = `Bearer ${session.access_token}`
  return config
})

// Access tokens are short-lived. On a 401, exchange the refresh token once
// (shared by every request that failed meanwhile) and retry.
let refreshing = null

async function refreshSession() {
  const session = loadSession()
  if (!session?.refresh_token) throw new Error('No refresh token')
  const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: session.refresh_token })
  const next = { ...session, access_token: data.data.access_token, refresh_token: data.data.refresh_token }
  saveSession(next)
  return next
}

client.interceptors.response.use(
  (response) => response,
  async (err) => {
    const original = err.config
    const isAuthCall = original?.url?.startsWith('/auth/')
    if (err.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true
      try {
        refreshing = refreshing || refreshSession().finally(() => { refreshing = null })
        const session = await refreshing
        original.headers.Authorization = `Bearer ${session.access_token}`
        return client(original)
      } catch {
        clearSession()
        onExpired()
      }
    }
    return Promise.reject(err)
  },
)

/** Best human-readable message from an axios error. */
export const errorMessage = (err) =>
  err?.response?.data?.message || (err?.code === 'ERR_NETWORK' ? 'Cannot reach the API server.' : err?.message) || 'Something went wrong'

export default client
