import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authApi } from '../api/admin'
import { errorMessage } from '../api/client'
import { clearSession, loadSession, saveSession } from '../api/session'

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const data = await authApi.login(email, password)
    if (data.verification_required) return rejectWithValue('This account has not verified its email yet.')
    if (data.user?.user_type !== 'admin') {
      // Don't keep a non-admin session around.
      await authApi.logout(data.refresh_token)
      return rejectWithValue('This account does not have admin access.')
    }
    const session = { access_token: data.access_token, refresh_token: data.refresh_token, user: data.user }
    saveSession(session)
    return session
  } catch (err) {
    return rejectWithValue(errorMessage(err))
  }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  const session = loadSession()
  clearSession()
  if (session?.refresh_token) await authApi.logout(session.refresh_token)
})

const initial = loadSession()

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: initial?.user || null, status: 'idle', error: null },
  reducers: {
    sessionExpired: (state) => {
      state.user = null
      state.error = 'Your session has expired. Please sign in again.'
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.status = 'loading'; s.error = null })
      .addCase(login.fulfilled, (s, a) => { s.status = 'idle'; s.user = a.payload.user })
      .addCase(login.rejected, (s, a) => { s.status = 'idle'; s.error = a.payload || 'Sign-in failed' })
      .addCase(logout.pending, (s) => { s.user = null; s.error = null })
  },
})

export const { sessionExpired } = authSlice.actions
export default authSlice.reducer
