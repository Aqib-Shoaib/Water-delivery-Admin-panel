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
    // About Us
    missionStatement: initial?.missionStatement || '',
    visionStatement: initial?.visionStatement || '',
    ceoMessage: initial?.ceoMessage || '',
    hqAddress: initial?.hqAddress || '',
    customerFeedbackLink: initial?.customerFeedbackLink || '',
    socialLinks: initial?.socialLinks || [],
    usefulLinks: initial?.usefulLinks || [],
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
        contactEmail,
        contactPhone,
        address,
        whatsappLink,
        whatsappPhone,
        missionStatement,
        visionStatement,
        ceoMessage,
        hqAddress,
        customerFeedbackLink,
        socialLinks,
        usefulLinks,
        customerAppName,
        customerAppAndroidLink,
        customerAppIOSLink,
        driverAppName,
        driverAppAndroidLink,
        driverAppIOSLink,
      } = form
      const payload = {
        siteName,
        contactEmail,
        contactPhone,
        address,
        whatsappLink,
        whatsappPhone,
        logoUrl,
        missionStatement,
        visionStatement,
        ceoMessage,
        hqAddress,
        customerFeedbackLink,
        socialLinks,
        usefulLinks,
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
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">Edit Site Settings</h3>
        <p className="text-sm text-gray-600 mt-1">Update site branding, contact information, and mobile app settings.</p>
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

          {/* About Us Section */}
          <div className="md:col-span-2 mt-2">
            <div className="text-sm font-semibold text-primary">About Us</div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Mission Statement</label>
            <textarea rows={3} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.missionStatement} onChange={e => setForm({ ...form, missionStatement: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Vision Statement</label>
            <textarea rows={3} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.visionStatement} onChange={e => setForm({ ...form, visionStatement: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">CEO’s Message</label>
            <textarea rows={4} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.ceoMessage} onChange={e => setForm({ ...form, ceoMessage: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Company Worldwide Presence (Head office address)</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.hqAddress} onChange={e => setForm({ ...form, hqAddress: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Customer Feedback (Useful Link)</label>
            <div className="flex gap-2">
              <input className="flex-1 form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="https://..." value={form.customerFeedbackLink} onChange={e => setForm({ ...form, customerFeedbackLink: e.target.value })} />
              <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={() => { navigator.clipboard?.writeText?.(form.customerFeedbackLink || '') }}>Copy</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Social Media Links</label>
            <div className="space-y-2">
              {(form.socialLinks || []).map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input placeholder="Label (e.g., Facebook)" className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.label || ''} onChange={e => {
                    const copy = [...form.socialLinks]; copy[idx] = { ...copy[idx], label: e.target.value }; setForm({ ...form, socialLinks: copy })
                  }} />
                  <input placeholder="Icon (e.g., fa-facebook)" className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.icon || ''} onChange={e => {
                    const copy = [...form.socialLinks]; copy[idx] = { ...copy[idx], icon: e.target.value }; setForm({ ...form, socialLinks: copy })
                  }} />
                  <div className="flex gap-2">
                    <input placeholder="URL" className="flex-1 form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.url || ''} onChange={e => {
                      const copy = [...form.socialLinks]; copy[idx] = { ...copy[idx], url: e.target.value }; setForm({ ...form, socialLinks: copy })
                    }} />
                    <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={() => {
                      const copy = [...form.socialLinks]; copy.splice(idx,1); setForm({ ...form, socialLinks: copy })
                    }}>Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={() => setForm({ ...form, socialLinks: [...(form.socialLinks || []), { label: '', icon: '', url: '' }] })}>Add Social Link</button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Useful Files/Forms/Docs</label>
            <div className="space-y-2">
              {(form.usefulLinks || []).map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input placeholder="Label (e.g., Onboarding Form)" className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.label || ''} onChange={e => {
                    const copy = [...form.usefulLinks]; copy[idx] = { ...copy[idx], label: e.target.value }; setForm({ ...form, usefulLinks: copy })
                  }} />
                  <div className="flex gap-2">
                    <input placeholder="URL" className="flex-1 form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.url || ''} onChange={e => {
                      const copy = [...form.usefulLinks]; copy[idx] = { ...copy[idx], url: e.target.value }; setForm({ ...form, usefulLinks: copy })
                    }} />
                    <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={() => {
                      const copy = [...form.usefulLinks]; copy.splice(idx,1); setForm({ ...form, usefulLinks: copy })
                    }}>Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={() => setForm({ ...form, usefulLinks: [...(form.usefulLinks || []), { label: '', url: '' }] })}>Add Useful Link</button>
            </div>
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
            {form.customerAppLogoUrl && (
              <div className="mt-2">
                <img src={form.customerAppLogoUrl} alt="Customer app logo" className="h-12 object-contain" />
              </div>
            )}
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
            {form.driverAppLogoUrl && (
              <div className="mt-2">
                <img src={form.driverAppLogoUrl} alt="Driver app logo" className="h-12 object-contain" />
              </div>
            )}
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
