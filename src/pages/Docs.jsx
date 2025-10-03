import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Docs() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ id: null, title: '', url: '', kind: 'doc' })
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      (i.url || '').toLowerCase().includes(q) ||
      (i.kind || '').toLowerCase().includes(q)
    )
  }, [items, query])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/docs`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  useEffect(() => { if (token) load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function resetForm() {
    setForm({ id: null, title: '', url: '', kind: 'doc' })
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    if (!form.url.trim()) return
    setSaving(true)
    try {
      if (form.id) {
        const res = await fetch(`${API_BASE}/api/docs/${form.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: form.title, url: form.url, kind: form.kind }) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      } else {
        const res = await fetch(`${API_BASE}/api/docs`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: form.title, url: form.url, kind: form.kind }) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      }
      await load()
      resetForm()
    } catch (e) { alert(e.message) } finally { setSaving(false) }
  }

  function onEdit(item) {
    setForm({ id: item._id, title: item.title, url: item.url, kind: item.kind || 'doc' })
  }

  async function onDelete(id) {
    try {
      const res = await fetch(`${API_BASE}/api/docs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { alert(e.message) }
    if (form.id === id) resetForm()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">Useful Company Docs & Forms</h2>
          <p className="text-gray-600 text-sm">Store helpful links to policies, forms, SOPs, and templates.</p>
        </div>
        <div className="relative">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search docs..."
            className="w-64 pl-3 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-blue focus:border-transparent"
          />
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg p-4 grid gap-3 md:grid-cols-12">
        <div className="md:col-span-4">
          <label className="text-sm text-gray-600">Title</label>
          <input
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-medium-blue focus:border-transparent"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g., Delivery SOP"
          />
        </div>
        <div className="md:col-span-5">
          <label className="text-sm text-gray-600">URL</label>
          <input
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-medium-blue focus:border-transparent"
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            placeholder="https://... (Google Drive, PDF, Sheet, etc.)"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Type</label>
          <select
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-medium-blue focus:border-transparent"
            value={form.kind}
            onChange={e => setForm(f => ({ ...f, kind: e.target.value }))}
          >
            <option value="doc">Doc</option>
            <option value="form">Form</option>
            <option value="policy">Policy</option>
            <option value="template">Template</option>
          </select>
        </div>
        <div className="md:col-span-1 flex items-end gap-2">
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-md bg-medium-blue text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? (form.id ? 'Updating...' : 'Adding...') : (form.id ? 'Update' : 'Add')}
          </button>
        </div>
        {form.id && (
          <div className="md:col-span-12 -mt-2">
            <button type="button" className="text-xs text-gray-500 hover:underline" onClick={resetForm}>Cancel edit</button>
          </div>
        )}
      </form>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading && <div className="p-4 text-sm text-gray-500">Loading...</div>}
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        <div className="hidden md:grid grid-cols-12 gap-2 p-3 text-xs font-medium text-gray-500 border-b">
          <div className="col-span-5">Title</div>
          <div className="col-span-5">Link</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <ul className="divide-y">
          {!loading && filtered.length === 0 && (
            <li className="p-4 text-sm text-gray-500">No docs yet. Add your first doc above.</li>
          )}
          {filtered.map(item => (
            <li key={item._id} className="grid md:grid-cols-12 gap-2 p-3 items-center">
              <div className="md:col-span-5">
                <div className="text-sm font-medium text-primary">{item.title}</div>
                <div className="text-xs text-gray-500">{(item.kind || 'doc').toUpperCase()}</div>
              </div>
              <div className="md:col-span-5 overflow-hidden">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {item.url}
                </a>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <button
                  className="px-2 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-50"
                  onClick={() => onEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 text-xs rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
