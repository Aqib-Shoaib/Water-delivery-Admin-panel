import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import SiteSettingsModal from '../components/modals/SiteSettingsModal.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Communication() {
  const { token } = useAuth()
  const { settings, refresh: refreshSettings } = useSettings()
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  const [openSettings, setOpenSettings] = useState(false)

  const [tab, setTab] = useState('open') // 'open' | 'in_progress' | 'resolved'
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: tab, page: String(page), limit: String(limit) })
      if (q) params.set('q', q)
      const res = await fetch(`${API_BASE}/api/support-issues?${params.toString()}`, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []))
      setTotal(data.total || (Array.isArray(data) ? data.length : 0))
      setPages(data.pages || 1)
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }, [headers, tab, page, limit, q])

  useEffect(() => { if (token) load() }, [token, load])

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/api/support-issues/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed to update')
      await load()
    } catch (e) { alert(e.message) }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Communication & Complaints</h2>
            <p className="text-xs text-gray-500">Manage contact settings and track complaints</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={()=>refreshSettings()}>Refresh Settings</Button>
            <Button onClick={()=>setOpenSettings(true)}>Edit Contact Info</Button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Emails</div>
            <div className="flex flex-wrap gap-2">
              {(settings?.emails && settings.emails.length ? settings.emails : (settings?.contactEmail ? [settings.contactEmail] : [])).map((e,i)=> (
                <span key={i} className="px-2 py-1 text-sm rounded-md border border-gray-300">{e}</span>
              ))}
              {(!settings?.emails || settings.emails.length===0) && !settings?.contactEmail && (
                <span className="text-xs text-gray-400">No emails set</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Phones</div>
            <div className="flex flex-wrap gap-2">
              {(settings?.phones && settings.phones.length ? settings.phones : (settings?.contactPhone ? [settings.contactPhone] : [])).map((p,i)=> (
                <span key={i} className="px-2 py-1 text-sm rounded-md border border-gray-300">{p}</span>
              ))}
              {(!settings?.phones || settings.phones.length===0) && !settings?.contactPhone && (
                <span className="text-xs text-gray-400">No phones set</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-primary">Complaints</h3>
            <p className="text-xs text-gray-500">Track and resolve customer complaints</p>
          </div>
          <div className="flex items-center gap-2">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." className="border rounded px-2 py-1 text-sm" />
            <Button variant="secondary" onClick={()=>{setPage(1); load()}}>Search</Button>
          </div>
        </div>
        {/* Tabs */}
        <div className="mt-3 flex items-center gap-2 border-b">
          {[
            {k:'open', label:'New'},
            {k:'in_progress', label:'In Progress'},
            {k:'resolved', label:'Resolved'},
          ].map(t => (
            <button key={t.k} onClick={()=>{ setTab(t.k); setPage(1); }} className={`px-3 py-2 text-sm border-b-2 -mb-px ${tab===t.k?'border-primary text-primary':'border-transparent text-gray-600 hover:text-primary'}`}>{t.label}</button>
          ))}
        </div>

        {/* List */}
        <div className="mt-4">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No complaints</div>
          ) : (
            <ul className="divide-y">
              {items.map(issue => (
                <li key={issue._id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-primary">{issue.title}</div>
                    <div className="text-xs text-gray-600">{issue.description}</div>
                    <div className="mt-1 text-[11px] text-gray-500">By {issue.createdBy?.name || issue.createdBy?.email || 'Unknown'} • {new Date(issue.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={issue.status} onChange={(e)=>updateStatus(issue._id, e.target.value)} className="text-sm border rounded px-2 py-1">
                      <option value="open">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-600">Page {page} of {pages} • Total {total}</div>
          <div className="flex items-center gap-2">
            <select value={limit} onChange={e=>{ setLimit(parseInt(e.target.value)||10); setPage(1); }} className="text-sm border rounded px-2 py-1">
              {[10,20,50,100].map(n=> <option key={n} value={n}>{n}/page</option>)}
            </select>
            <Button variant="secondary" onClick={()=> setPage(p=> Math.max(1, p-1))} disabled={page<=1}>Prev</Button>
            <Button variant="secondary" onClick={()=> setPage(p=> Math.min(pages, p+1))} disabled={page>=pages}>Next</Button>
          </div>
        </div>
      </Card>

      <SiteSettingsModal open={openSettings} onClose={(changed)=>{ setOpenSettings(false); if (changed) refreshSettings(); }} apiBase={API_BASE} initial={settings || {}} />
    </div>
  )
}
