import { configureStore } from '@reduxjs/toolkit'
import { setSessionExpiredHandler } from '../api/client'
import auth, { sessionExpired } from './authSlice'
import ui from './uiSlice'
import resources from './resourcesSlice'
import categories from './categoriesSlice'
import stats from './statsSlice'

export const store = configureStore({
  reducer: { auth, ui, resources, categories, stats },
})

setSessionExpiredHandler(() => store.dispatch(sessionExpired()))
