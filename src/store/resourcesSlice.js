import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { adminApi } from '../api/admin'
import { errorMessage } from '../api/client'

/**
 * One slice for every paginated admin list. State is keyed by a resource key
 * (e.g. "users", "consumers", "vendors") so two pages that read the same
 * endpoint with different filters never overwrite each other.
 */
export const emptyResource = { items: [], total: 0, page: 1, pages: 0, limit: 20, status: 'idle', error: null }

export const fetchResource = createAsyncThunk(
  'resources/fetch',
  async ({ endpoint, params }, { rejectWithValue }) => {
    try {
      return await adminApi.list(endpoint, params)
    } catch (err) {
      return rejectWithValue(errorMessage(err))
    }
  },
)

const resourcesSlice = createSlice({
  name: 'resources',
  initialState: {},
  reducers: {
    /** Applies a successful mutation to the row in place, so the table updates without a refetch. */
    patchItem: (state, { payload: { key, id, changes } }) => {
      const item = state[key]?.items.find((row) => row.id === id)
      if (item) Object.assign(item, changes)
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchResource.pending, (state, { meta }) => {
      const key = meta.arg.key
      state[key] = { ...(state[key] || emptyResource), status: 'loading', error: null, requestId: meta.requestId }
    })
      .addCase(fetchResource.fulfilled, (state, { payload, meta }) => {
        const current = state[meta.arg.key]
        // Ignore responses that arrive after a newer request (fast typing in search).
        if (current?.requestId !== meta.requestId) return
        state[meta.arg.key] = {
          items: payload.data, total: payload.total, page: payload.page, pages: payload.pages,
          limit: payload.limit, status: 'succeeded', error: null, requestId: meta.requestId,
        }
      })
      .addCase(fetchResource.rejected, (state, { payload, meta, error }) => {
        const current = state[meta.arg.key]
        if (current?.requestId !== meta.requestId) return
        current.status = 'failed'
        current.error = payload || error.message
      })
  },
})

export const { patchItem } = resourcesSlice.actions
export const selectResource = (key) => (state) => state.resources[key] || emptyResource
export default resourcesSlice.reducer
