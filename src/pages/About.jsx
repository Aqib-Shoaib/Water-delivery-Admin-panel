import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function About() {
  const { token } = useAuth()
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    missionStatement: '',
    visionStatement: '',
    ceoMessage: '',
    hqAddress: '',
    customerFeedbackLink: '',
    socialLinks: [], // [{label, icon, url}]
    usefulLinks: [], // [{label, url}]
  })

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/about`, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setForm({
        missionStatement: data.missionStatement || '',
        visionStatement: data.visionStatement || '',
        ceoMessage: data.ceoMessage || '',
        hqAddress: data.hqAddress || '',
        customerFeedbackLink: data.customerFeedbackLink || '',
        socialLinks: data.socialLinks || [],
        usefulLinks: data.usefulLinks || [],
      })
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form }
      const res = await fetch(`${API_BASE}/api/about`, { method: 'PUT', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  useEffect(() => { if (token) load() }, [token])

  if (loading) return <div className="p-3 text-sm text-gray-500">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-primary">About Us</h2>
          <p className="text-sm text-gray-600">Manage public-facing About content.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
          <button onClick={onSubmit} disabled={saving} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>

      {error && <div className="p-2 text-sm text-red-600 border border-red-200 rounded">{error}</div>}

      <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onSubmit}>
        <label className="text-sm md:col-span-2">
          <div className="text-primary mb-1">Mission Statement</div>
          <textarea rows={3} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.missionStatement} onChange={e=>setForm({...form, missionStatement:e.target.value})} />
        </label>
        <label className="text-sm md:col-span-2">
          <div className="text-primary mb-1">Vision Statement</div>
          <textarea rows={3} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.visionStatement} onChange={e=>setForm({...form, visionStatement:e.target.value})} />
        </label>
        <label className="text-sm md:col-span-2">
          <div className="text-primary mb-1">CEO’s Message</div>
          <textarea rows={4} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.ceoMessage} onChange={e=>setForm({...form, ceoMessage:e.target.value})} />
        </label>
        <label className="text-sm md:col-span-2">
          <div className="text-primary mb-1">Head Office Address</div>
          <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.hqAddress} onChange={e=>setForm({...form, hqAddress:e.target.value})} />
        </label>
        <label className="text-sm md:col-span-2">
          <div className="text-primary mb-1">Customer Feedback Link</div>
          <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" placeholder="https://..." value={form.customerFeedbackLink} onChange={e=>setForm({...form, customerFeedbackLink:e.target.value})} />
        </label>

        <div className="md:col-span-2 space-y-2">
          <div className="text-sm font-semibold text-primary">Social Media Links</div>
          {(form.socialLinks||[]).map((row,idx)=> (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input placeholder="Label" className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.label||''} onChange={e=>{ const copy=[...form.socialLinks]; copy[idx] = { ...copy[idx], label:e.target.value }; setForm({...form, socialLinks: copy}) }} />
              <input placeholder="Icon (e.g., fa-facebook)" className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.icon||''} onChange={e=>{ const copy=[...form.socialLinks]; copy[idx] = { ...copy[idx], icon:e.target.value }; setForm({...form, socialLinks: copy}) }} />
              <div className="flex gap-2">
                <input placeholder="URL" className="flex-1 form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.url||''} onChange={e=>{ const copy=[...form.socialLinks]; copy[idx] = { ...copy[idx], url:e.target.value }; setForm({...form, socialLinks: copy}) }} />
                <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={()=>{ const copy=[...form.socialLinks]; copy.splice(idx,1); setForm({...form, socialLinks: copy}) }}>Remove</button>
              </div>
            </div>
          ))}
          <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={()=> setForm({...form, socialLinks:[...(form.socialLinks||[]), {label:'',icon:'',url:''}]})}>Add Social Link</button>
        </div>

        <div className="md:col-span-2 space-y-2">
          <div className="text-sm font-semibold text-primary">Useful Files/Forms/Docs</div>
          {(form.usefulLinks||[]).map((row,idx)=> (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input placeholder="Label" className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.label||''} onChange={e=>{ const copy=[...form.usefulLinks]; copy[idx] = { ...copy[idx], label:e.target.value }; setForm({...form, usefulLinks: copy}) }} />
              <div className="flex gap-2">
                <input placeholder="URL" className="flex-1 form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.url||''} onChange={e=>{ const copy=[...form.usefulLinks]; copy[idx] = { ...copy[idx], url:e.target.value }; setForm({...form, usefulLinks: copy}) }} />
                <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={()=>{ const copy=[...form.usefulLinks]; copy.splice(idx,1); setForm({...form, usefulLinks: copy}) }}>Remove</button>
              </div>
            </div>
          ))}
          <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={()=> setForm({...form, usefulLinks:[...(form.usefulLinks||[]), {label:'',url:''}]})}>Add Useful Link</button>
        </div>
      </form>

      {/* Live Preview */}
      <div className="mt-4 border rounded-lg bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-primary">Preview</h3>
          <span className="text-xs text-gray-500">Public-facing layout</span>
        </div>
        <div className="space-y-4">
          {form.missionStatement && (
            <section>
              <div className="text-sm font-semibold text-gray-800">Our Mission</div>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{form.missionStatement}</p>
            </section>
          )}
          {form.visionStatement && (
            <section>
              <div className="text-sm font-semibold text-gray-800">Our Vision</div>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{form.visionStatement}</p>
            </section>
          )}
          {form.ceoMessage && (
            <section>
              <div className="text-sm font-semibold text-gray-800">CEO’s Message</div>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{form.ceoMessage}</p>
            </section>
          )}
          {(form.hqAddress || form.customerFeedbackLink) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {form.hqAddress && (
                <div>
                  <div className="text-sm font-semibold text-gray-800">Head Office</div>
                  <div className="text-sm text-gray-700 mt-1">{form.hqAddress}</div>
                </div>
              )}
              {form.customerFeedbackLink && (
                <div>
                  <div className="text-sm font-semibold text-gray-800">Customer Feedback</div>
                  <a href={form.customerFeedbackLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline break-all">{form.customerFeedbackLink}</a>
                </div>
              )}
            </section>
          )}
          {(form.socialLinks?.length>0) && (
            <section>
              <div className="text-sm font-semibold text-gray-800 mb-1">Social Media</div>
              <div className="flex flex-wrap gap-2">
                {form.socialLinks.map((s, i) => (
                  <a key={i} href={s.url||'#'} target="_blank" rel="noreferrer" className="px-3 py-1 text-xs rounded-full border border-gray-300 hover:bg-gray-50">
                    {s.label || s.url || 'Link'}
                  </a>
                ))}
              </div>
            </section>
          )}
          {(form.usefulLinks?.length>0) && (
            <section>
              <div className="text-sm font-semibold text-gray-800 mb-1">Useful Links</div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                {form.usefulLinks.map((u,i)=>(
                  <li key={i}><a href={u.url||'#'} target="_blank" rel="noreferrer" className="underline">{u.label || u.url || 'Document'}</a></li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
