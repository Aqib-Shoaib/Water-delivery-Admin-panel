import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ViewRegionUsersModal({ open, onClose, apiBase, region, role }) {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  useEffect(() => {
    async function load() {
      if (!open || !region?._id) return
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${apiBase}/api/regions/${region._id}/users?role=${role || ''}`, { headers })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setItems(data)
      } catch (e) { setError(e.message) } finally { setLoading(false) }
    }
    load()
  }, [open, region?._id, role])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">{role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Users'} in {region?.name}</h3>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
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
                  <tr><td className="py-4 text-gray-500" colSpan={4}>No users</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  )
}
