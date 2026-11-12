import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchResource, selectResource } from '../store/resourcesSlice'
import useDebounce from './useDebounce'

/**
 * Drives a paginated admin table: holds search/filter/sort/page in local
 * state, fetches through Redux whenever they change, and returns everything
 * the page needs. `fixed` params (e.g. user_type) are always sent.
 */
export default function useResourceList(key, endpoint, { fixed = {}, initialFilters = {}, limit = 20 } = {}) {
  const dispatch = useDispatch()
  const resource = useSelector(selectResource(key))
  const [search, setSearchValue] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState({ sort: undefined, order: 'desc' })
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search)
  const fixedKey = JSON.stringify(fixed)

  const load = useCallback(() => {
    const all = { ...JSON.parse(fixedKey), ...filters, ...sort, page, limit, search: debouncedSearch }
    // Send only the filters the admin actually chose.
    const params = Object.fromEntries(Object.entries(all).filter(([, v]) => v !== '' && v !== undefined))
    dispatch(fetchResource({ key, endpoint, params }))
  }, [dispatch, key, endpoint, fixedKey, filters, sort, page, limit, debouncedSearch])

  useEffect(() => { load() }, [load])

  // Changing what's being looked at starts again from page 1.
  const setSearch = (value) => { setSearchValue(value); setPage(1) }
  const setFilter = (name, value) => { setFilters((f) => ({ ...f, [name]: value })); setPage(1) }
  const toggleSort = (column) =>
    setSort((s) => ({ sort: column, order: s.sort === column && s.order === 'desc' ? 'asc' : 'desc' }))

  return { ...resource, search, setSearch, filters, setFilter, sort, toggleSort, page, setPage, reload: load }
}
