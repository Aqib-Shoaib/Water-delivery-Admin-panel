import React, { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function SiteSettingsModal({ open, onClose, apiBase, initial }) {
  const { token } = useAuth()
  const [form, setForm] = useState({
    siteName: initial?.siteName || '',
    // emails: prefer array if exists, else derive from legacy string
    emails: Array.isArray(initial?.emails)
      ? initial.emails
      : (initial?.contactEmail ? [initial.contactEmail] : []),
    // phones: prefer array if exists, else derive from legacy contactPhone/whatsappPhone
    phones: Array.isArray(initial?.phones)
      ? initial.phones
      : ([initial?.contactPhone, initial?.whatsappPhone].filter(Boolean)),
    address: initial?.address || '',
    logoUrl: initial?.logoUrl || '',
    whatsappLink: initial?.whatsappLink || '',
    customerAppName: initial?.customerAppName || '',
    customerAppAndroidLink: initial?.customerAppAndroidLink || '',
    customerAppIOSLink: initial?.customerAppIOSLink || '',
    customerAppLogoUrl: initial?.customerAppLogoUrl || '',
    driverAppName: initial?.driverAppName || '',
    driverAppAndroidLink: initial?.driverAppAndroidLink || '',
    driverAppIOSLink: initial?.driverAppIOSLink || '',
    driverAppLogoUrl: initial?.driverAppLogoUrl || '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [customerLogoFile, setCustomerLogoFile] = useState(null)
  const [driverLogoFile, setDriverLogoFile] = useState(null)
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

  async function uploadCustomerLogoIfNeeded() {
    if (!customerLogoFile) return null
    const fd = new FormData()
    fd.append('logo', customerLogoFile)
    const res = await fetch(`${apiBase}/api/site-settings/customer-logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    if (!res.ok) throw new Error(`Customer app logo upload failed (HTTP ${res.status})`)
    const data = await res.json()
    return data.customerAppLogoUrl
  }

  async function uploadDriverLogoIfNeeded() {
    if (!driverLogoFile) return null
    const fd = new FormData()
    fd.append('logo', driverLogoFile)
    const res = await fetch(`${apiBase}/api/site-settings/driver-logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    if (!res.ok) throw new Error(`Driver app logo upload failed (HTTP ${res.status})`)
    const data = await res.json()
    return data.driverAppLogoUrl
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
      let customerAppLogoUrl = form.customerAppLogoUrl
      if (customerLogoFile) {
        const uploaded = await uploadCustomerLogoIfNeeded()
        if (uploaded) customerAppLogoUrl = uploaded
      }
      let driverAppLogoUrl = form.driverAppLogoUrl
      if (driverLogoFile) {
        const uploaded = await uploadDriverLogoIfNeeded()
        if (uploaded) driverAppLogoUrl = uploaded
      }
      const {
        siteName,
        emails,
        phones,
        address,
        whatsappLink,
        customerAppName,
        customerAppAndroidLink,
        customerAppIOSLink,
        driverAppName,
        driverAppAndroidLink,
        driverAppIOSLink,
      } = form
      const payload = {
        siteName,
        emails,
        phones,
        address,
        whatsappLink,
        logoUrl,
        customerAppName,
        customerAppAndroidLink,
        customerAppIOSLink,
        customerAppLogoUrl,
        driverAppName,
        driverAppAndroidLink,
        driverAppIOSLink,
        driverAppLogoUrl,
      }
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
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-primary">Edit Site Settings</h3>
        <p className="text-sm text-gray-600 mt-1">Update site branding, contact information, and mobile app settings.</p>
        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Site Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.siteName} onChange={e => setForm({ ...form, siteName: e.target.value })} required />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Contact Emails</label>
            <div className="space-y-2">
              {(form.emails || []).map((em, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="email" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={em}
                         onChange={e => {
                           const emails = [...form.emails]; emails[idx] = e.target.value; setForm({ ...form, emails })
                         }} />
                  <button type="button" className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                          onClick={() => setForm({ ...form, emails: form.emails.filter((_, i) => i !== idx) })}>Remove</button>
                </div>
              ))}
              <button type="button" className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                      onClick={() => setForm({ ...form, emails: [...(form.emails || []), ''] })}>Add Email</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Phones</label>
            <div className="space-y-2">
              {(form.phones || []).map((ph, idx) => (
                <div key={idx} className="flex gap-2">
                  <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="e.g. +1234567890" value={ph}
                         onChange={e => {
                           const phones = [...form.phones]; phones[idx] = e.target.value; setForm({ ...form, phones })
                         }} />
                  <button type="button" className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                          onClick={() => setForm({ ...form, phones: form.phones.filter((_, i) => i !== idx) })}>Remove</button>
                </div>
              ))}
              <button type="button" className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                      onClick={() => setForm({ ...form, phones: [...(form.phones || []), ''] })}>Add Phone</button>
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">WhatsApp Link</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="https://wa.me/1234567890" value={form.whatsappLink} onChange={e => setForm({ ...form, whatsappLink: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Address</label>
            <textarea rows={3} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>


          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Logo</label>
            <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
            {logoFile ? (
              <div className="mt-2 text-xs text-gray-600 break-all">Selected: {logoFile.name}
                <div className="mt-2">
                  <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="h-12 object-contain" />
                </div>
              </div>
            ) : form.logoUrl ? (
              <div className="mt-2">
                <img src={form.logoUrl} alt="Logo preview" className="h-12 object-contain" />
              </div>
            ) : null}
          </div>

          {/* Mobile Apps - Customer App */}
          <div className="md:col-span-2 mt-2">
            <div className="text-sm font-semibold text-primary">Customer App</div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Customer App Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.customerAppName} onChange={e => setForm({ ...form, customerAppName: e.target.value })} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Customer App Logo</label>
            <input type="file" accept="image/*" onChange={e => setCustomerLogoFile(e.target.files?.[0] || null)} />
            {customerLogoFile ? (
              <div className="mt-2 text-xs text-gray-600 break-all">Selected: {customerLogoFile.name}
                <div className="mt-2">
                  <img src={URL.createObjectURL(customerLogoFile)} alt="Customer app logo" className="h-12 object-contain" />
                </div>
              </div>
            ) : form.customerAppLogoUrl ? (
              <div className="mt-2">
                <img src={form.customerAppLogoUrl} alt="Customer app logo" className="h-12 object-contain" />
              </div>
            ) : null}
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Customer App Android Link</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="Play Store URL" value={form.customerAppAndroidLink} onChange={e => setForm({ ...form, customerAppAndroidLink: e.target.value })} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Customer App iOS Link</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="App Store URL" value={form.customerAppIOSLink} onChange={e => setForm({ ...form, customerAppIOSLink: e.target.value })} />
          </div>

          {/* Mobile Apps - Driver App */}
          <div className="md:col-span-2 mt-2">
            <div className="text-sm font-semibold text-primary">Driver App</div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Driver App Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.driverAppName} onChange={e => setForm({ ...form, driverAppName: e.target.value })} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Driver App Logo</label>
            <input type="file" accept="image/*" onChange={e => setDriverLogoFile(e.target.files?.[0] || null)} />
            {driverLogoFile ? (
              <div className="mt-2 text-xs text-gray-600 break-all">Selected: {driverLogoFile.name}
                <div className="mt-2">
                  <img src={URL.createObjectURL(driverLogoFile)} alt="Driver app logo" className="h-12 object-contain" />
                </div>
              </div>
            ) : form.driverAppLogoUrl ? (
              <div className="mt-2">
                <img src={form.driverAppLogoUrl} alt="Driver app logo" className="h-12 object-contain" />
              </div>
            ) : null}
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Driver App Android Link</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="Play Store URL" value={form.driverAppAndroidLink} onChange={e => setForm({ ...form, driverAppAndroidLink: e.target.value })} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Driver App iOS Link</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="App Store URL" value={form.driverAppIOSLink} onChange={e => setForm({ ...form, driverAppIOSLink: e.target.value })} />
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
