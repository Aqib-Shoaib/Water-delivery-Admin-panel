import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import RegionDetailModal from '../components/modals/RegionDetailModal.jsx'
import useTableControls from '../hooks/useTableControls'
import TableControls from '../components/ui/TableControls.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Regions() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', zipCodes: '', active: true })
  const { items: view, controls } = useTableControls(items, { initialPageSize: 10, searchableKeys: ['name','description','zipCodes'] })

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/regions`, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onCreate(e) {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        zipCodes: form.zipCodes.split(',').map(z => z.trim()).filter(Boolean),
        active: !!form.active,
      }
      const res = await fetch(`${API_BASE}/api/regions`, { method: 'POST', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setForm({ name: '', description: '', zipCodes: '', active: true })
      await load()
    } catch (e) { setCreateError(e.message) } finally { setCreating(false) }
  }

  async function onDelete(region) {
    if (!confirm(`Delete region "${region.name}"?`)) return
    try {
      const res = await fetch(`${API_BASE}/api/regions/${region._id}`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { alert(e.message) }
  }

  async function onToggleActive(region) {
    try {
      const res = await fetch(`${API_BASE}/api/regions/${region._id}`, { method: 'PUT', headers, body: JSON.stringify({ active: !region.active }) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { alert(e.message) }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Zones</h2>
            <p className="text-xs text-gray-500">Manage delivery zones (regions)</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
          </div>
        </div>

        {/* Inline create form */}
        <form onSubmit={onCreate} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end border rounded-lg p-3">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-primary mb-1">Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-primary mb-1">Description</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-primary mb-1">ZIP Codes (comma-separated)</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.zipCodes} onChange={e => setForm({ ...form, zipCodes: e.target.value })} />
          </div>
          <div className="md:col-span-1 flex items-center gap-2">
            <input id="active" type="checkbox" checked={!!form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
            <label htmlFor="active" className="text-sm text-primary">Active</label>
          </div>
          <div className="md:col-span-3 flex items-center justify-end gap-2">
            {createError && <span className="text-sm text-red-600">{createError}</span>}
            <button type="submit" disabled={creating} className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary">{creating ? 'Creating...' : 'Add Zone'}</button>
          </div>
        </form>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="mt-4">
            <TableControls controls={controls} className="mb-3" />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Description</th>
                    <th className="py-2 pr-4">ZIP Codes</th>
                    <th className="py-2 pr-4">Active</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {view.map(r => (
                    <tr key={r._id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-2 pr-4">{r.name}</td>
                      <td className="py-2 pr-4">{r.description || '—'}</td>
                      <td className="py-2 pr-4">{(r.zipCodes || []).join(', ') || '—'}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${r.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{r.active ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="py-2 pr-4 flex flex-wrap gap-2">
                        <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50" onClick={() => { setSelected(r); setShowDetail(true) }}>Details</button>
                        <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50" onClick={() => onToggleActive(r)}>{r.active ? 'Deactivate' : 'Activate'}</button>
                        <button className="px-3 py-1.5 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50" onClick={() => onDelete(r)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {view.length === 0 && (
                    <tr><td className="py-4 text-gray-500" colSpan={4}>No zones</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
      <RegionDetailModal open={showDetail} onClose={() => { setShowDetail(false); setSelected(null) }} apiBase={API_BASE} region={selected} />
    </div>
  )
}
