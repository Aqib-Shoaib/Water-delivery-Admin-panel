import React, { useEffect, useMemo, useState } from 'react'
import ImageUpload from '../ui/ImageUpload.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function SiteSettingsModal({ open, onClose, apiBase, initial }) {
  const { token } = useAuth()
  function buildInitialForm(src) {
    return {
      siteName: src?.siteName || '',
      emails: Array.isArray(src?.emails)
        ? src.emails
        : (src?.contactEmail ? [src.contactEmail] : []),
      phones: Array.isArray(src?.phones)
        ? src.phones
        : ([src?.contactPhone, src?.whatsappPhone].filter(Boolean)),
      address: src?.address || '',
      logoUrl: src?.logoUrl || '',
      whatsappLink: src?.whatsappLink || '',
      customerAppName: src?.customerAppName || '',
      customerAppAndroidLink: src?.customerAppAndroidLink || '',
      customerAppIOSLink: src?.customerAppIOSLink || '',
      customerAppLogoUrl: src?.customerAppLogoUrl || '',
      driverAppName: src?.driverAppName || '',
      driverAppAndroidLink: src?.driverAppAndroidLink || '',
      driverAppIOSLink: src?.driverAppIOSLink || '',
      driverAppLogoUrl: src?.driverAppLogoUrl || '',
    }
  }

  const [form, setForm] = useState(buildInitialForm(initial))
  const [logoFile, setLogoFile] = useState(null)
  const [customerLogoFile, setCustomerLogoFile] = useState(null)
  const [driverLogoFile, setDriverLogoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  // Re-hydrate form with latest initial data whenever modal opens or initial changes
  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(initial))
      setLogoFile(null)
      setCustomerLogoFile(null)
      setDriverLogoFile(null)
    }
  }, [open, initial])

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
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8 max-h-[85vh] overflow-y-auto border-l-4 border-primary hover-lift">
        <h3 className="text-2xl font-bold text-primary">Edit Site Settings</h3>
        <p className="text-sm text-gray-600 mt-1">Manage your website configuration and contact information</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary hover-lift">
            <div className="mb-4">
              <h4 className="text-xl font-bold text-primary mb-1">Contact Information</h4>
              <p className="text-gray-600 text-sm">Your primary business contact details and branding</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-primary mb-2">Site Name</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-medium-blue focus:outline-none transition-colors" value={form.siteName} onChange={e => setForm({ ...form, siteName: e.target.value })} required />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-primary mb-2">Contact Emails</label>
                <div className="space-y-2">
                  {(form.emails || []).map((em, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input type="email" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-medium-blue focus:outline-none transition-colors" value={em}
                             onChange={e => {
                               const emails = [...form.emails]; emails[idx] = e.target.value; setForm({ ...form, emails })
                             }} />
                      <button type="button" className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                              onClick={() => setForm({ ...form, emails: form.emails.filter((_, i) => i !== idx) })}>Remove</button>
                    </div>
                  ))}
                  <button type="button" className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                          onClick={() => setForm({ ...form, emails: [...(form.emails || []), ''] })}>Add Email</button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-primary mb-2">Phones</label>
                <div className="space-y-2">
                  {(form.phones || []).map((ph, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-medium-blue focus:outline-none transition-colors" placeholder="e.g. +1234567890" value={ph}
                             onChange={e => {
                               const phones = [...form.phones]; phones[idx] = e.target.value; setForm({ ...form, phones })
                             }} />
                      <button type="button" className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                              onClick={() => setForm({ ...form, phones: form.phones.filter((_, i) => i !== idx) })}>Remove</button>
                    </div>
                  ))}
                  <button type="button" className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                          onClick={() => setForm({ ...form, phones: [...(form.phones || []), ''] })}>Add Phone</button>
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-primary mb-2">WhatsApp Link</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-medium-blue focus:outline-none transition-colors" placeholder="https://wa.me/1234567890" value={form.whatsappLink} onChange={e => setForm({ ...form, whatsappLink: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-primary mb-2">Address</label>
                <textarea rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-medium-blue focus:outline-none transition-colors resize-none" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>

              <div className="md:col-span-1">
                <ImageUpload label="Logo" value={form.logoUrl} file={logoFile} onPick={(f)=>setLogoFile(f)} buttonText="Upload Logo" />
              </div>
            </div>
          </div>

          {/* Mobile Applications - Customer */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-medium-blue hover-lift">
            <div className="mb-4">
              <h4 className="text-xl font-bold text-primary mb-1">Mobile Applications</h4>
              <p className="text-gray-600 text-sm">Download links for your customer application</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-primary mb-2">Customer App Name</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-medium-blue focus:outline-none transition-colors" value={form.customerAppName} onChange={e => setForm({ ...form, customerAppName: e.target.value })} />
              </div>
              <div className="md:col-span-1">
                <ImageUpload label="Customer App Logo" value={form.customerAppLogoUrl} file={customerLogoFile} onPick={(f)=>setCustomerLogoFile(f)} buttonText="Upload Logo" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-primary mb-2">Customer App Android Link</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-medium-blue focus:outline-none transition-colors" placeholder="Play Store URL" value={form.customerAppAndroidLink} onChange={e => setForm({ ...form, customerAppAndroidLink: e.target.value })} />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-primary mb-2">Customer App iOS Link</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-medium-blue focus:outline-none transition-colors" placeholder="App Store URL" value={form.customerAppIOSLink} onChange={e => setForm({ ...form, customerAppIOSLink: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Mobile Applications - Driver */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-light-blue hover-lift">
            <div className="mb-4">
              <h4 className="text-xl font-bold text-primary mb-1">Secondary Applications</h4>
              <p className="text-gray-600 text-sm">Additional mobile applications or services</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-primary mb-2">Driver App Name</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-medium-blue focus:outline-none transition-colors" value={form.driverAppName} onChange={e => setForm({ ...form, driverAppName: e.target.value })} />
              </div>
              <div className="md:col-span-1">
                <ImageUpload label="Driver App Logo" value={form.driverAppLogoUrl} file={driverLogoFile} onPick={(f)=>setDriverLogoFile(f)} buttonText="Upload Logo" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-primary mb-2">Driver App Android Link</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-medium-blue focus:outline-none transition-colors" placeholder="Play Store URL" value={form.driverAppAndroidLink} onChange={e => setForm({ ...form, driverAppAndroidLink: e.target.value })} />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-primary mb-2">Driver App iOS Link</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-medium-blue focus:outline-none transition-colors" placeholder="App Store URL" value={form.driverAppIOSLink} onChange={e => setForm({ ...form, driverAppIOSLink: e.target.value })} />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-center md:justify-end gap-3 pt-2">
            <button type="button" onClick={() => onClose(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-opacity">{saving ? 'Saving...' : 'Save Settings'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
