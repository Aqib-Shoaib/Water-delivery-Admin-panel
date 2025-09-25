import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import AddUserModal from '../components/modals/AddUserModal.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
const ROLES = ['admin', 'customer', 'driver']

export default function Users() {
  const { token, user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCreated = async () => { await load() }

  const onDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { alert(e.message) }
  }

  const isSelf = (u) => {
    if (!user) return false
    if (u?._id && user?._id) return u._id === user._id
    if (u?.email && user?.email) return u.email === user.email
    return false
  }

  const roleBadgeCls = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs'
      case 'driver': return 'bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-xs'
      default: return 'bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Users</h2>
            <p className="text-xs text-gray-500">Manage platform users</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
            <button onClick={() => setShowAdd(true)} className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary">Add User</button>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Permissions</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(u => (
                  <tr key={u._id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span>{u.name}</span>
                        {isSelf(u) && <span className="bg-light-blue text-primary border border-medium-blue px-2 py-0.5 rounded-full text-xs">You</span>}
                      </div>
                    </td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4"><span className={roleBadgeCls(u.role)}>{u.role}</span></td>
                    <td className="py-2 pr-4">{(u.permissions || []).join(', ')}</td>
                    <td className="py-2 pr-4">
                      <button
                        className={`px-3 py-1.5 text-sm rounded-md border ${isSelf(u) ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                        onClick={() => !isSelf(u) && onDelete(u._id)}
                        disabled={isSelf(u)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td className="py-4 text-gray-500" colSpan={5}>No users</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddUserModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={onCreated} apiBase={API_BASE} />
    </div>
  )
}
