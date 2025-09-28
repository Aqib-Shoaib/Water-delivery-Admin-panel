import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationsContext.jsx'
import useTableControls from '../hooks/useTableControls'
import TableControls from '../components/ui/TableControls.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Deals() {
  const { token } = useAuth()
  const { success, error: notifyError } = useNotifications()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [creating, setCreating] = useState(false)
  const { items: view, controls } = useTableControls(items, { initialPageSize: 10, searchableKeys: ['title','description'] })
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', active: true })

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const res = await fetch(`${API_BASE}/api/deals`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data)
    } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onCreate(e) {
    e.preventDefault()
    setCreating(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        active: !!form.active,
      }
      const res = await fetch(`${API_BASE}/api/deals`, { method: 'POST', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setForm({ title: '', description: '', startDate: '', endDate: '', active: true })
      success('Deal created')
      await load()
    } catch (e) { notifyError(e.message) } finally { setCreating(false) }
  }

  async function onToggleActive(d) {
    try {
      const res = await fetch(`${API_BASE}/api/deals/${d._id}`, { method: 'PUT', headers, body: JSON.stringify({ active: !d.active }) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { notifyError(e.message) }
  }

  async function onDelete(id) {
    if (!confirm('Delete this deal?')) return
    try {
      const res = await fetch(`${API_BASE}/api/deals/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      success('Deal deleted')
      await load()
    } catch (e) { notifyError(e.message) }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Deals</h2>
            <p className="text-xs text-gray-500">Manage promotional deals</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
          </div>
        </div>

        {/* Inline create form */}
        <form onSubmit={onCreate} className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end border rounded-lg p-3">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-primary mb-1">Title</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-primary mb-1">Description</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary mb-1">Start</label>
            <input type="date" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary mb-1">End</label>
            <input type="date" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <input id="deal-active" type="checkbox" checked={!!form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
            <label htmlFor="deal-active" className="text-sm text-primary">Active</label>
            <button type="submit" disabled={creating} className="ml-auto px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary">{creating ? 'Creating...' : 'Add Deal'}</button>
          </div>
        </form>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : err ? (
          <div className="py-10 text-center text-red-600">{err}</div>
        ) : (
          <div className="mt-4">
            <>
              <TableControls controls={controls} className="mb-3" />
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Start</th>
                  <th className="py-2 pr-4">End</th>
                  <th className="py-2 pr-4">Active</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {view.map(d => (
                  <tr key={d._id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-2 pr-4">{d.title}</td>
                    <td className="py-2 pr-4">{d.description || '—'}</td>
                    <td className="py-2 pr-4">{d.startDate ? new Date(d.startDate).toLocaleDateString() : '—'}</td>
                    <td className="py-2 pr-4">{d.endDate ? new Date(d.endDate).toLocaleDateString() : '—'}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${d.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{d.active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="py-2 pr-4 flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50" onClick={() => onToggleActive(d)}>{d.active ? 'Deactivate' : 'Activate'}</button>
                      <button className="px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50" onClick={() => onDelete(d._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {view.length === 0 && (
                  <tr><td className="py-4 text-gray-500" colSpan={6}>No deals</td></tr>
                )}
              </tbody>
                </table>
              </div>
            </>
          </div>
        )}
      </Card>
    </div>
  )
}
