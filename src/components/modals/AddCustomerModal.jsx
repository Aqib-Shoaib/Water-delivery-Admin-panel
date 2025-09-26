import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AddCustomerModal({ open, onClose, onCreated, apiBase }) {
  const { token } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', region: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [regions, setRegions] = useState([])

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  useEffect(() => {
    async function loadRegions() {
      try {
        const res = await fetch(`${apiBase}/api/regions`, { headers })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setRegions(data)
      } catch (e) { /* ignore for now */ }
    }
    if (open) loadRegions()
  }, [open])

  if (!open) return null

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: 'customer',
        phone: form.phone.trim() || undefined,
        region: form.region || undefined,
      }
      const res = await fetch(`${apiBase}/api/admin/users`, { method: 'POST', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setForm({ name: '', email: '', password: '', phone: '', region: '' })
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
        <h3 className="text-lg font-semibold text-primary">Add Customer</h3>
        <p className="text-sm text-gray-600 mt-1">Create a new customer account.</p>

        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Email</label>
            <input type="email" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Password</label>
            <input type="password" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Phone</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Region</label>
            <select className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
              <option value="">— None —</option>
              {regions.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
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
