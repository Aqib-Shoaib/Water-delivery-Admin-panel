import { useMemo, useState } from 'react'

export default function useTableControls(items, options = {}) {
  const { initialPageSize = 10, searchableKeys = [] } = options
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query) return items || []
    const q = query.toLowerCase()
    return (items || []).filter((it) => {
      if (searchableKeys.length === 0) {
        return JSON.stringify(it).toLowerCase().includes(q)
      }
      return searchableKeys.some((k) => String(getDeep(it, k) ?? '').toLowerCase().includes(q))
    })
  }, [items, query, searchableKeys])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const paged = filtered.slice(start, end)

  function getDeep(obj, path) {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj)
  }

  const controls = {
    query,
    setQuery,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    next: () => setPage((p) => Math.min(totalPages, p + 1)),
    prev: () => setPage((p) => Math.max(1, p - 1)),
    reset: () => { setQuery(''); setPage(1); setPageSize(initialPageSize) },
  }

  return { items: paged, controls, filteredTotal: total }
}
