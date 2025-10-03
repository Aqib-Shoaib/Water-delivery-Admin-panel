import React, { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Invite() {
  const { token } = useAuth()
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'customer',
  })

  async function onSubmit(e){
    e.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/invite`, { method:'POST', headers, body: JSON.stringify(form) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setMessage('Invite sent successfully.')
      setForm({ name:'', email:'', role:'customer' })
    } catch(e){ setError(e.message) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-primary">Invite a Friend</h2>
          <p className="text-sm text-gray-600">Send an invitation to join the platform.</p>
        </div>
      </div>

      {error && <div className="p-2 text-sm text-red-600 border border-red-200 rounded">{error}</div>}
      {message && <div className="p-2 text-sm text-green-700 border border-green-200 rounded">{message}</div>}

      <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={onSubmit}>
        <label className="text-sm">
          <div className="text-primary mb-1">Name</div>
          <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        </label>
        <label className="text-sm">
          <div className="text-primary mb-1">Email</div>
          <input type="email" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
        </label>
        <label className="text-sm">
          <div className="text-primary mb-1">Role</div>
          <select className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="md:col-span-3 flex justify-end">
          <button type="submit" disabled={saving} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">{saving ? 'Sending...' : 'Send Invite'}</button>
        </div>
      </form>
    </div>
  )
}
