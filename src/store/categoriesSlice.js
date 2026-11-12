import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { adminApi } from '../api/admin'
import { errorMessage } from '../api/client'

export const fetchCategories = createAsyncThunk('categories/fetch', async (_, { rejectWithValue }) => {
  try {
    return await adminApi.categories()
  } catch (err) {
    return rejectWithValue(errorMessage(err))
  }
})

// After a write the list is refetched, so usage counts and slugs stay accurate.
export const saveCategory = createAsyncThunk('categories/save', async ({ id, ...body }, { dispatch, rejectWithValue }) => {
  try {
    const result = id ? await adminApi.updateCategory(id, body) : await adminApi.createCategory(body)
    dispatch(fetchCategories())
    return result
  } catch (err) {
    return rejectWithValue(errorMessage(err))
  }
})

export const deleteCategory = createAsyncThunk('categories/delete', async (id, { dispatch, rejectWithValue }) => {
  try {
    const result = await adminApi.deleteCategory(id)
    dispatch(fetchCategories())
    return result
  } catch (err) {
    return rejectWithValue(errorMessage(err))
  }
})

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchCategories.pending, (s) => { s.status = 'loading'; s.error = null })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload })
      .addCase(fetchCategories.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload })
  },
})

export default categoriesSlice.reducer
