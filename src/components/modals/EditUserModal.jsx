import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function EditUserModal({ open, onClose, onSaved, apiBase, user }) {
  const { token } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', role: 'customer', roleName: '', phone: '', cnic: '', permissions: [], region: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [regions, setRegions] = useState([])
  const [availablePerms, setAvailablePerms] = useState([])
  const [availableRoles, setAvailableRoles] = useState(['admin','customer','driver'])
  const [selectAll, setSelectAll] = useState(false)

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  useEffect(() => {
    if (!open) return
    // seed form from user
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'customer',
      roleName: user?.roleName || '',
      phone: user?.phone || '',
      cnic: user?.cnic || '',
      permissions: Array.isArray(user?.permissions) ? user.permissions : [],
      region: user?.region?._id || user?.region || ''
    })
  }, [open, user])

  useEffect(() => {
    async function loadRegions() {
      try {
        const res = await fetch(`${apiBase}/api/regions`, { headers })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setRegions(data)
      } catch { /* ignore */ }
    }
    async function loadPermissions() {
      try {
        const res = await fetch(`${apiBase || API_BASE}/api/permissions`, { headers })
        if (res.ok) {
          const data = await res.json()
          setAvailablePerms(data.permissions || [])
          setAvailableRoles(data.roles?.filter(Boolean) || ['admin','customer','driver'])
        }
      } catch { /* ignore */ }
    }
    if (open) { loadRegions(); loadPermissions(); }
  }, [open])

  if (!open) return null

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        roleName: form.roleName.trim() || undefined,
        permissions: Array.isArray(form.permissions) ? form.permissions : [],
        region: form.region || undefined,
        cnic: form.cnic?.trim?.() || undefined,
      }
      const res = await fetch(`${apiBase}/api/admin/users/${user._id}`, { method: 'PUT', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      onSaved && onSaved()
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
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">Edit User</h3>
        <p className="text-sm text-gray-600 mt-1">Update user details, role and permissions.</p>

        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Email</label>
            <input disabled className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-100" value={form.email} readOnly />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Phone</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Role</label>
            <select className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Custom Role Name (optional)</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="e.g. Inventory Manager" value={form.roleName} onChange={e => setForm({ ...form, roleName: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Region</label>
            <select className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
              <option value="">— None —</option>
              {regions.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-primary">Permissions</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectAll} onChange={(e) => {
                const checked = e.target.checked; setSelectAll(checked);
                setForm({ ...form, permissions: checked ? [...availablePerms] : [] })
              }} /> Select all</label>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded p-2">
              {availablePerms.map(p => (
                <label key={p} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(p)}
                    onChange={(e) => {
                      if (e.target.checked) setForm({ ...form, permissions: [...form.permissions, p] })
                      else setForm({ ...form, permissions: form.permissions.filter(x => x !== p) })
                    }}
                  />
                  <span>{p}</span>
                </label>
              ))}
              {availablePerms.length === 0 && <div className="text-xs text-gray-500">No permissions loaded</div>}
            </div>
          </div>
          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="login-btn bg-primary text-white px-4 py-2 rounded-md">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
