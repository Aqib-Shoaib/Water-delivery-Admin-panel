import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Contact() {
  const { token } = useAuth()
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    emails: [],
    phones: [],
    address: '',
    whatsappLink: '',
  })

  const load  = useCallback(async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/site-settings`, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setForm({
        emails: Array.isArray(data.emails) ? data.emails : (data.contactEmail ? [data.contactEmail] : []),
        phones: Array.isArray(data.phones) ? data.phones : ([data.contactPhone, data.whatsappPhone].filter(Boolean)),
        address: data.address || '',
        whatsappLink: data.whatsappLink || '',
      })
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  },[headers])
  
  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // sanitize empties
      const payload = {
        ...form,
        emails: (form.emails || []).map(e => String(e || '').trim()).filter(Boolean),
        phones: (form.phones || []).map(p => String(p || '').trim()).filter(Boolean),
      }
      const res = await fetch(`${API_BASE}/api/site-settings`, { method: 'PUT', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  useEffect(() => { if (token) load() }, [token, load])

  if (loading) return <div className="p-3 text-sm text-gray-500">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-primary">Contact Us</h2>
          <p className="text-sm text-gray-600">Manage contact and support channels.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
          <button onClick={onSubmit} disabled={saving} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>

      {error && <div className="p-2 text-sm text-red-600 border border-red-200 rounded">{error}</div>}

      <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onSubmit}>
        <div className="text-sm md:col-span-2">
          <div className="text-primary mb-1">Contact Emails</div>
          <div className="space-y-2">
            {(form.emails || []).map((em, idx) => (
              <div className="flex gap-2" key={idx}>
                <input type="email" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={em}
                       onChange={e=>{
                         const emails=[...form.emails]; emails[idx]=e.target.value; setForm({...form, emails})
                       }} />
                <button type="button" className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                        onClick={()=> setForm({...form, emails: form.emails.filter((_,i)=>i!==idx)})}>Remove</button>
              </div>
            ))}
            <button type="button" className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                    onClick={()=> setForm({...form, emails: [...(form.emails||[]), '']})}>Add Email</button>
          </div>
        </div>
        <div className="text-sm md:col-span-2">
          <div className="text-primary mb-1">Phones</div>
          <div className="space-y-2">
            {(form.phones || []).map((ph, idx) => (
              <div className="flex gap-2" key={idx}>
                <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" placeholder="e.g. +123456789" value={ph}
                       onChange={e=>{
                         const phones=[...form.phones]; phones[idx]=e.target.value; setForm({...form, phones})
                       }} />
                <button type="button" className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                        onClick={()=> setForm({...form, phones: form.phones.filter((_,i)=>i!==idx)})}>Remove</button>
              </div>
            ))}
            <button type="button" className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                    onClick={()=> setForm({...form, phones: [...(form.phones||[]), '']})}>Add Phone</button>
          </div>
        </div>
        <label className="text-sm md:col-span-2">
          <div className="text-primary mb-1">Office Address</div>
          <textarea rows={3} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} />
        </label>
        <label className="text-sm">
          <div className="text-primary mb-1">WhatsApp Link</div>
          <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" placeholder="https://wa.me/..." value={form.whatsappLink} onChange={e=>setForm({...form, whatsappLink:e.target.value})} />
        </label>
      </form>

      {/* Preview */}
      <div className="mt-4 border rounded-lg bg-white p-4">
        <h3 className="text-base font-semibold text-primary mb-2">Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-500">Emails</div>
            <div className="text-gray-900">{(form.emails && form.emails.length) ? form.emails.join(', ') : '—'}</div>
          </div>
          <div>
            <div className="text-gray-500">Phones</div>
            <div className="text-gray-900">{(form.phones && form.phones.length) ? form.phones.join(', ') : '—'}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-gray-500">Address</div>
            <div className="text-gray-900 whitespace-pre-line">{form.address || '—'}</div>
          </div>
          <div>
            <div className="text-gray-500">WhatsApp Link</div>
            {form.whatsappLink ? <a href={form.whatsappLink} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{form.whatsappLink}</a> : <div className="text-gray-900">—</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
