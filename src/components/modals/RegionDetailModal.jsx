import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RegionDetailModal({ open, onClose, apiBase, region }) {
  const { token } = useAuth()
  const [roleFilter, setRoleFilter] = useState('all') // all | customer | driver
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  useEffect(() => { if (!open) setRoleFilter('all') }, [open])

  useEffect(() => {
    async function load() {
      if (!open || !region?._id) return
      setLoading(true)
      setError('')
      try {
        const query = roleFilter === 'all' ? '' : `?role=${roleFilter}`
        const res = await fetch(`${apiBase}/api/regions/${region._id}/users${query}`, { headers })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setItems(data)
      } catch (e) { setError(e.message) } finally { setLoading(false) }
    }
    load()
  }, [open, region?._id, roleFilter])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">{region?.name}</h3>
            {region?.description && <p className="text-sm text-gray-600 mt-1">{region.description}</p>}
          </div>
          <button onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Close</button>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Filter:</span>
            <button className={`px-3 py-1.5 rounded-md border ${roleFilter==='all' ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-50'}`} onClick={() => setRoleFilter('all')}>All</button>
            <button className={`px-3 py-1.5 rounded-md border ${roleFilter==='customer' ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-50'}`} onClick={() => setRoleFilter('customer')}>Customers</button>
            <button className={`px-3 py-1.5 rounded-md border ${roleFilter==='driver' ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:bg-gray-50'}`} onClick={() => setRoleFilter('driver')}>Drivers</button>
          </div>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          {loading ? (
            <div className="py-10 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(u => (
                    <tr key={u._id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">{u.name}</td>
                      <td className="py-2 pr-4">{u.email}</td>
                      <td className="py-2 pr-4">{u.role}</td>
                      <td className="py-2 pr-4">{u.phone || '—'}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td className="py-4 text-gray-500" colSpan={4}>No users for this filter</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
