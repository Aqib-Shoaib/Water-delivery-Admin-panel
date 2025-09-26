import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AddRegionModal({ open, onClose, onCreated, apiBase }) {
  const { token } = useAuth()
  const [form, setForm] = useState({ name: '', description: '', zipCodes: '', active: true })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  useEffect(() => {
    if (!open) {
      setForm({ name: '', description: '', zipCodes: '', active: true })
      setError('')
    }
  }, [open])

  if (!open) return null

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        zipCodes: form.zipCodes.split(',').map(z => z.trim()).filter(Boolean),
        active: !!form.active,
      }
      const res = await fetch(`${apiBase}/api/regions`, { method: 'POST', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      onCreated && onCreated()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">Add Region</h3>
        <p className="text-sm text-gray-600 mt-1">Create a new delivery region (zone).</p>
        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Description</label>
            <textarea rows={3} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">ZIP Codes (comma-separated)</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.zipCodes} onChange={e => setForm({ ...form, zipCodes: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input id="active" type="checkbox" checked={!!form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
            <label htmlFor="active" className="text-sm text-primary">Active</label>
          </div>
          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="login-btn bg-primary text-white px-4 py-2 rounded-md">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
