import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { adminApi } from '../api/admin'
import { errorMessage } from '../api/client'

export const fetchStats = createAsyncThunk('stats/fetch', async (_, { rejectWithValue }) => {
  try {
    const [stats, revenue] = await Promise.all([adminApi.stats(), adminApi.revenue()])
    return { ...stats, revenue }
  } catch (err) {
    return rejectWithValue(errorMessage(err))
  }
})

const statsSlice = createSlice({
  name: 'stats',
  initialState: { data: null, status: 'idle', error: null, fetchedAt: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchStats.pending, (s) => { s.status = 'loading'; s.error = null })
      .addCase(fetchStats.fulfilled, (s, a) => { s.status = 'succeeded'; s.data = a.payload; s.fetchedAt = Date.now() })
      .addCase(fetchStats.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload })
  },
})

export default statsSlice.reducer
