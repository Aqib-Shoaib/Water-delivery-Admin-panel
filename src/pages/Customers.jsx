import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import AddCustomerModal from '../components/modals/AddCustomerModal.jsx'
import useTableControls from '../hooks/useTableControls'
import TableControls from '../components/ui/TableControls.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Customers() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const { items: view, controls } = useTableControls(items, { initialPageSize: 10, searchableKeys: ['name','email','phone','region.name','cnic'] })

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, { headers: authHeaders })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data.filter(u => u.role === 'customer'))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])
  const onCreated = async () => { await load() }

  const onDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, { method: 'DELETE', headers: authHeaders })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { alert(e.message) }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Customers</h2>
            <p className="text-xs text-gray-500">Manage customer accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
            <button onClick={() => setShowAdd(true)} className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary">Add Customer</button>
          </div>
        </div>
        {error && (
          <div className="my-2 p-2 text-sm rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="mt-4">
            <>
              <TableControls controls={controls} className="mb-3" />
              <div className="overflow-x-auto bg-white shadow rounded-md">
                <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">CNIC</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Region</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {view.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="py-2 pr-4">{u.name}</td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">{u.cnic || '—'}</td>
                    <td className="py-2 pr-4">{u.phone || '—'}</td>
                    <td className="py-2 pr-4">{(u.region && (u.region.name || u.region)) || '—'}</td>
                    <td className="py-2 pr-4">
                      <button className="px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50" onClick={() => onDelete(u._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {view.length === 0 && (
                  <tr><td className="py-4 text-gray-500" colSpan={5}>No customers</td></tr>
                )}
              </tbody>
                </table>
              </div>
            </>
          </div>
        )}
      </Card>

      <AddCustomerModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={onCreated} apiBase={API_BASE} />
    </div>
  )
}
