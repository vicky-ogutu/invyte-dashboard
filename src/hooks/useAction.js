import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addToast } from '../store/uiSlice'
import { patchItem } from '../store/resourcesSlice'
import { errorMessage } from '../api/client'

/**
 * Runs a row mutation (approve, deactivate…), shows a toast, and patches the
 * row in the Redux list so the table reflects it immediately.
 * Returns [run, pendingId].
 */
export default function useAction(resourceKey) {
  const dispatch = useDispatch()
  const [pendingId, setPendingId] = useState(null)

  const run = async (id, request, changes) => {
    setPendingId(id)
    try {
      const res = await request()
      if (changes) dispatch(patchItem({ key: resourceKey, id, changes }))
      dispatch(addToast(res?.message || 'Saved'))
      return true
    } catch (err) {
      dispatch(addToast(errorMessage(err), 'error'))
      return false
    } finally {
      setPendingId(null)
    }
  }
  return [run, pendingId]
}
