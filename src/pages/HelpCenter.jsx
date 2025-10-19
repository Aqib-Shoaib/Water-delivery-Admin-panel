import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import RichTextEditor from '../components/ui/RichTextEditor.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function HelpCenter() {
  const { token } = useAuth()
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    termsSubtitle: 'Get Instant Help, Contact Us....we are waiting',
    termsContent: '',
    privacyContent: '',
    faqs: [], // [{question, answer}]
    socialSubtitle: 'You can rate or Update on our Social Media',
    socialLinks: [], // [{label,url}]
    rateSubtitle: 'You can rate Us on our Social Media',
    rateLinks: [], // [{label,url}]
    appInfoSubtitle: 'You can get all the information relevant to this APP',
    appInfo: { betaVersion: '', latestVersion: '', updateUrl: '', notes: '' },
  })

  const load = useCallback(async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/help-center`, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setForm({
        termsSubtitle: data.termsSubtitle || '',
        termsContent: data.termsContent || '',
        privacyContent: data.privacyContent || '',
        faqs: data.faqs || [],
        socialSubtitle: data.socialSubtitle || '',
        socialLinks: data.socialLinks || [],
        rateSubtitle: data.rateSubtitle || '',
        rateLinks: data.rateLinks || [],
        appInfoSubtitle: data.appInfoSubtitle || '',
        appInfo: data.appInfo || { betaVersion: '', latestVersion: '', updateUrl: '', notes: '' },
      })
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }, [headers])

  async function save() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/help-center`, { method: 'PUT', headers, body: JSON.stringify(form) })
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
          <h2 className="text-lg font-semibold text-primary">Help Center</h2>
          <p className="text-sm text-gray-600">Manage terms, FAQs, social links, ratings, and app info.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
          <button onClick={save} disabled={saving} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>

      {error && <div className="p-2 text-sm text-red-600 border border-red-200 rounded">{error}</div>}

      {/* Terms & Privacy (Rich Text) */}
      <section className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-primary">Terms and Privacy Policy</h3>
          <button onClick={save} className="text-sm px-3 py-1 border rounded">Update</button>
        </div>
        <p className="text-xs text-gray-500">{form.termsSubtitle}</p>
        <div>
          <div className="text-sm text-primary mb-1">Terms of Service Content</div>
          <RichTextEditor value={form.termsContent} onChange={(html)=> setForm({...form, termsContent: html})} apiBase={API_BASE} />
        </div>
        <div>
          <div className="text-sm text-primary mb-1">Privacy Policy Content</div>
          <RichTextEditor value={form.privacyContent} onChange={(html)=> setForm({...form, privacyContent: html})} apiBase={API_BASE} />
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-primary">FAQs</h3>
          <div className="flex gap-2">
            <button onClick={()=> setForm({...form, faqs:[...(form.faqs||[]), {question:'', answer:''}]})} className="text-sm px-3 py-1 border rounded">Add Quiz?</button>
            <button onClick={save} className="text-sm px-3 py-1 border rounded">Update</button>
          </div>
        </div>
        <p className="text-xs text-gray-500">If you have any Questions or Feedback, feel free to Ask Us</p>
        {(form.faqs||[]).map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input placeholder="Question" className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.question||''} onChange={e=>{ const c=[...form.faqs]; c[idx] = { ...c[idx], question:e.target.value }; setForm({...form, faqs:c}) }} />
            <div className="flex gap-2">
              <input placeholder="Answer" className="flex-1 form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.answer||''} onChange={e=>{ const c=[...form.faqs]; c[idx] = { ...c[idx], answer:e.target.value }; setForm({...form, faqs:c}) }} />
              <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={()=>{ const c=[...form.faqs]; c.splice(idx,1); setForm({...form, faqs:c}) }}>Remove</button>
            </div>
          </div>
        ))}
        <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={()=> setForm({...form, faqs:[...(form.faqs||[]), {question:'', answer:''}]})}>Add FAQ</button>
      </section>

      {/* Social Media */}
      <section className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-primary">Social Media Accounts</h3>
          <div className="flex gap-2">
            <button onClick={()=> setForm({...form, socialLinks:[...(form.socialLinks||[]), {label:'', url:''}]})} className="text-sm px-3 py-1 border rounded">Add</button>
            <button onClick={save} className="text-sm px-3 py-1 border rounded">Update</button>
          </div>
        </div>
        <p className="text-xs text-gray-500">{form.socialSubtitle}</p>
        {(form.socialLinks||[]).map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input placeholder="Label" className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.label||''} onChange={e=>{ const c=[...form.socialLinks]; c[idx] = { ...c[idx], label:e.target.value }; setForm({...form, socialLinks:c}) }} />
            <div className="flex gap-2">
              <input placeholder="URL" className="flex-1 form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.url||''} onChange={e=>{ const c=[...form.socialLinks]; c[idx] = { ...c[idx], url:e.target.value }; setForm({...form, socialLinks:c}) }} />
              <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={()=>{ const c=[...form.socialLinks]; c.splice(idx,1); setForm({...form, socialLinks:c}) }}>Remove</button>
            </div>
          </div>
        ))}
      </section>

      {/* Rate Us */}
      <section className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-primary">Rate Us</h3>
          <div className="flex gap-2">
            <button onClick={()=> setForm({...form, rateLinks:[...(form.rateLinks||[]), {label:'', url:''}]})} className="text-sm px-3 py-1 border rounded">Links</button>
            <button onClick={save} className="text-sm px-3 py-1 border rounded">Update</button>
          </div>
        </div>
        <p className="text-xs text-gray-500">{form.rateSubtitle}</p>
        {(form.rateLinks||[]).map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input placeholder="Label" className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.label||''} onChange={e=>{ const c=[...form.rateLinks]; c[idx] = { ...c[idx], label:e.target.value }; setForm({...form, rateLinks:c}) }} />
            <div className="flex gap-2">
              <input placeholder="URL" className="flex-1 form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={row.url||''} onChange={e=>{ const c=[...form.rateLinks]; c[idx] = { ...c[idx], url:e.target.value }; setForm({...form, rateLinks:c}) }} />
              <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={()=>{ const c=[...form.rateLinks]; c.splice(idx,1); setForm({...form, rateLinks:c}) }}>Remove</button>
            </div>
          </div>
        ))}
      </section>

      {/* App Info */}
      <section className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-primary">App Info</h3>
          <div className="flex gap-2">
            <button onClick={()=> setForm({...form, appInfo:{...form.appInfo, betaVersion: form.appInfo.betaVersion || ''}})} className="text-sm px-3 py-1 border rounded">Beta Version</button>
            <button onClick={save} className="text-sm px-3 py-1 border rounded">Update New Version</button>
          </div>
        </div>
        <p className="text-xs text-gray-500">{form.appInfoSubtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-sm">
            <div className="text-primary mb-1">Beta Version</div>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.appInfo?.betaVersion||''} onChange={e=>setForm({...form, appInfo:{...form.appInfo, betaVersion:e.target.value}})} />
          </label>
          <label className="text-sm">
            <div className="text-primary mb-1">Latest Version</div>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.appInfo?.latestVersion||''} onChange={e=>setForm({...form, appInfo:{...form.appInfo, latestVersion:e.target.value}})} />
          </label>
          <label className="text-sm md:col-span-1">
            <div className="text-primary mb-1">Update URL</div>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.appInfo?.updateUrl||''} onChange={e=>setForm({...form, appInfo:{...form.appInfo, updateUrl:e.target.value}})} placeholder="https://..." />
          </label>
          <label className="text-sm md:col-span-3">
            <div className="text-primary mb-1">Release Notes</div>
            <textarea rows={3} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={form.appInfo?.notes||''} onChange={e=>setForm({...form, appInfo:{...form.appInfo, notes:e.target.value}})} />
          </label>
        </div>
      </section>

      {/* Live Preview */}
      <section className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-primary">Preview</h3>
          <span className="text-xs text-gray-500">Public-facing rendering</span>
        </div>
        <div className="prose prose-sm max-w-none">
          {form.termsContent && (
            <div>
              <div className="text-sm font-semibold text-gray-800 mb-1">Terms of Service</div>
              <div dangerouslySetInnerHTML={{ __html: form.termsContent }} />
            </div>
          )}
          {form.privacyContent && (
            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-800 mb-1">Privacy Policy</div>
              <div dangerouslySetInnerHTML={{ __html: form.privacyContent }} />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
