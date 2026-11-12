import { createSlice, nanoid } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: false, toasts: [] },
  reducers: {
    toggleSidebar: (s, a) => { s.sidebarOpen = a.payload ?? !s.sidebarOpen },
    addToast: {
      reducer: (s, a) => { s.toasts.push(a.payload) },
      prepare: (message, tone = 'success') => ({ payload: { id: nanoid(), message, tone } }),
    },
    removeToast: (s, a) => { s.toasts = s.toasts.filter((t) => t.id !== a.payload) },
  },
})

export const { toggleSidebar, addToast, removeToast } = uiSlice.actions
export default uiSlice.reducer
