import React, { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function SiteSettingsModal({ open, onClose, apiBase, initial }) {
  const { token } = useAuth()
  const [form, setForm] = useState({
    siteName: initial?.siteName || '',
    contactEmail: initial?.contactEmail || '',
    contactPhone: initial?.contactPhone || '',
    address: initial?.address || '',
    logoUrl: initial?.logoUrl || '',
    whatsappLink: initial?.whatsappLink || '',
    whatsappPhone: initial?.whatsappPhone || '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  if (!open) return null

  async function uploadLogoIfNeeded() {
    if (!logoFile) return null
    const fd = new FormData()
    fd.append('logo', logoFile)
    const res = await fetch(`${apiBase}/api/site-settings/logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    if (!res.ok) throw new Error(`Logo upload failed (HTTP ${res.status})`)
    const data = await res.json()
    return data.logoUrl
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let logoUrl = form.logoUrl
      if (logoFile) {
        const uploaded = await uploadLogoIfNeeded()
        if (uploaded) logoUrl = uploaded
      }
      const { siteName, contactEmail, contactPhone, address, whatsappLink, whatsappPhone } = form
      const payload = { siteName, contactEmail, contactPhone, address, whatsappLink, whatsappPhone, logoUrl }
      const res = await fetch(`${apiBase}/api/site-settings`, { method: 'PUT', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      onClose(true)
    } catch (e) {
      setError(e.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose(false)} />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">Edit Site Settings</h3>
        <p className="text-sm text-gray-600 mt-1">Update site branding and contact information.</p>
        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Site Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.siteName} onChange={e => setForm({ ...form, siteName: e.target.value })} required />
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Contact Email</label>
            <input type="email" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Contact Phone</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">WhatsApp Link</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="https://wa.me/1234567890" value={form.whatsappLink} onChange={e => setForm({ ...form, whatsappLink: e.target.value })} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">WhatsApp Phone</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="e.g. +1234567890" value={form.whatsappPhone} onChange={e => setForm({ ...form, whatsappPhone: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Address</label>
            <textarea rows={3} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Logo</label>
            <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
            {form.logoUrl && (
              <div className="mt-2">
                <img src={form.logoUrl} alt="Logo preview" className="h-12 object-contain" />
              </div>
            )}
          </div>

          {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onClose(false)} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="login-btn bg-primary text-white px-4 py-2 rounded-md">{saving ? 'Saving...' : 'Save Settings'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
