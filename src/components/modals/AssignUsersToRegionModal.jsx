import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

// role should be 'driver' or 'customer'
export default function AssignUsersToRegionModal({ open, onClose, apiBase, region, role }) {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  useEffect(() => {
    async function load() {
      if (!open) return
      setLoading(true)
      setError('')
      try {
        // Get all users of the given role; we'll filter those already assigned to this region
        const res = await fetch(`${apiBase}/api/admin/users`, { headers })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const filtered = data.filter(u => u.role === role)
        setUsers(filtered)
      } catch (e) { setError(e.message) } finally { setLoading(false) }
    }
    load()
  }, [open, role])

  useEffect(() => { if (!open) { setSelected([]); setError('') } }, [open])

  if (!open) return null

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function onAssign() {
    if (!region?._id || selected.length === 0) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/regions/${region._id}/assign-users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userIds: selected, role })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      onClose()
    } catch (e) { setError(e.message) } finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">Assign {role}s to {region?.name}</h3>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Select</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Currently In</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">
                      <input type="checkbox" checked={selected.includes(u._id)} onChange={() => toggle(u._id)} />
                    </td>
                    <td className="py-2 pr-4">{u.name}</td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">{u.region ? (u.region.name || u.region) : '—'}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td className="py-4 text-gray-500" colSpan={4}>No users</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={onAssign} disabled={submitting || selected.length === 0} className="login-btn bg-primary text-white px-4 py-2 rounded-md">{submitting ? 'Assigning...' : 'Assign'}</button>
        </div>
      </div>
    </div>
  )
}
