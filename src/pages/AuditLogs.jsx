import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function AuditLogs() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ action: '', entity: '', q: '' })

  async function load(p = page, l = limit, f = filters) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', p)
      params.set('limit', l)
      if (f.action) params.set('action', f.action)
      if (f.entity) params.set('entity', f.entity)
      if (f.q) params.set('q', f.q)
      const res = await fetch(`${API_BASE}/api/audit-logs?${params.toString()}` , {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
        setTotal(data.total)
        setPage(data.page)
        setLimit(data.limit)
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { if (token) load(1, limit) }, [token])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500">Action</label>
          <input value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })} className="input" placeholder="e.g. product:create" />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Entity</label>
          <input value={filters.entity} onChange={e => setFilters({ ...filters, entity: e.target.value })} className="input" placeholder="e.g. Product" />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500">Search</label>
          <input value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} className="input" placeholder="Search IP, UA, entityId..." />
        </div>
        <button onClick={() => load(1, limit, filters)} className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary">Filter</button>
        <button onClick={() => { const f = { action: '', entity: '', q: '' }; setFilters(f); load(1, limit, f) }} className="px-3 py-2 text-sm rounded-md border">Reset</button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Action</th>
              <th className="text-left p-2">Entity</th>
              <th className="text-left p-2">Entity ID</th>
              <th className="text-left p-2">IP</th>
              <th className="text-left p-2">User Agent</th>
              <th className="text-left p-2">Meta</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-4 text-center text-gray-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="p-4 text-center text-gray-500">No audit logs</td></tr>
            ) : (
              items.map((it) => (
                <tr key={it._id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{new Date(it.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    {it.user ? (
                      <div>
                        <div className="font-medium text-primary">{it.user.name || it.user.email}</div>
                        <div className="text-xs text-gray-500">{it.user.email}</div>
                      </div>
                    ) : <span className="text-gray-500">System</span>}
                  </td>
                  <td className="p-2">{it.action}</td>
                  <td className="p-2">{it.entity || '-'}</td>
                  <td className="p-2">{it.entityId || '-'}</td>
                  <td className="p-2">{it.ip || '-'}</td>
                  <td className="p-2 max-w-xs truncate" title={it.userAgent || ''}>{it.userAgent || '-'}</td>
                  <td className="p-2 max-w-sm">
                    <pre className="text-xs whitespace-pre-wrap break-words">{it.meta ? JSON.stringify(it.meta, null, 2) : '-'}</pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">Total: {total}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1 || loading} onClick={() => load(page - 1)} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
          <div className="text-sm">Page {page} / {totalPages}</div>
          <button disabled={page >= totalPages || loading} onClick={() => load(page + 1)} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  )
}
