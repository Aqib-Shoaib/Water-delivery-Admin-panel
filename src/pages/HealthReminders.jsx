import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationsContext.jsx'
import useTableControls from '../hooks/useTableControls'
import TableControls from '../components/ui/TableControls.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function HealthReminders() {
  const { token } = useAuth()
  const { success, error: notifyError } = useNotifications()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [creating, setCreating] = useState(false)
  const { items: view, controls } = useTableControls(items, { initialPageSize: 10, searchableKeys: ['title','message','dateOnly','active'] })
  const [form, setForm] = useState({ title: '', message: '', active: true, dateOnly: '', weight: 1 })

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const res = await fetch(`${API_BASE}/api/health-reminders`, { headers: { Authorization: `Bearer ${token}` } })
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
        message: form.message.trim() || undefined,
        active: !!form.active,
        dateOnly: form.dateOnly || undefined,
        weight: Number(form.weight) || 1,
      }
      const res = await fetch(`${API_BASE}/api/health-reminders`, { method: 'POST', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setForm({ title: '', message: '', active: true, dateOnly: '', weight: 1 })
      success('Health reminder created')
      await load()
    } catch (e) { notifyError(e.message) } finally { setCreating(false) }
  }

  async function onToggleActive(r) {
    try {
      const res = await fetch(`${API_BASE}/api/health-reminders/${r._id}`, { method: 'PUT', headers, body: JSON.stringify({ active: !r.active }) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { notifyError(e.message) }
  }

  async function onDelete(id) {
    if (!confirm('Delete this health reminder?')) return
    try {
      const res = await fetch(`${API_BASE}/api/health-reminders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      success('Health reminder deleted')
      await load()
    } catch (e) { notifyError(e.message) }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Health Reminders</h2>
            <p className="text-xs text-gray-500">Create tips shown randomly in the customer app or pin one to a specific day.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
          </div>
        </div>

        {/* Inline create form */}
        <form onSubmit={onCreate} className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-end border rounded-lg p-3">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-primary mb-1">Title</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-primary mb-1">Message</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary mb-1">Specific Day</label>
            <input type="date" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.dateOnly} onChange={e => setForm({ ...form, dateOnly: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary mb-1">Weight</label>
            <input type="number" min="1" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <input id="hr-active" type="checkbox" checked={!!form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
            <label htmlFor="hr-active" className="text-sm text-primary">Active</label>
            <button type="submit" disabled={creating} className="ml-auto px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary">{creating ? 'Creating...' : 'Add Health Reminder'}</button>
          </div>
        </form>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : err ? (
          <div className="py-10 text-center text-red-600">{err}</div>
        ) : (
          <div className="mt-4">
            <TableControls controls={controls} className="mb-3" />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Message</th>
                    <th className="py-2 pr-4">Specific Day</th>
                    <th className="py-2 pr-4">Active</th>
                    <th className="py-2 pr-4">Weight</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {view.map(r => (
                    <tr key={r._id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-2 pr-4">{r.title}</td>
                      <td className="py-2 pr-4">{r.message || '—'}</td>
                      <td className="py-2 pr-4">{r.dateOnly || '—'}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${r.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{r.active ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="py-2 pr-4">{r.weight ?? 1}</td>
                      <td className="py-2 pr-4 flex flex-wrap gap-2">
                        <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50" onClick={() => onToggleActive(r)}>{r.active ? 'Deactivate' : 'Activate'}</button>
                        <button className="px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50" onClick={() => onDelete(r._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {view.length === 0 && (
                    <tr><td className="py-4 text-gray-500" colSpan={6}>No health reminders</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
