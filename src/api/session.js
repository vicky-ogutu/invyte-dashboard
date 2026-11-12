// Persists the admin session (access + refresh token and user) in localStorage.
const KEY = 'invyte_admin_session'

export const loadSession = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

export const saveSession = (session) => localStorage.setItem(KEY, JSON.stringify(session))
export const clearSession = () => localStorage.removeItem(KEY)
