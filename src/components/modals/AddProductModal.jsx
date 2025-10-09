import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AddProductModal({ open, onClose, onCreated, apiBase }) {
  const { token } = useAuth()
  const [form, setForm] = useState({ name: '', sizeLiters: '', price: '' })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  async function onPickImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(`${apiBase}/api/products/upload-image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setImages(prev => [...prev, data.url])
    } catch (err) {
      setError(err.message)
    } finally { setUploading(false); e.target.value = '' }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: form.name.trim(),
          sizeLiters: Number(form.sizeLiters),
          price: Number(form.price),
          active: true,
          images,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setForm({ name: '', sizeLiters: '', price: '' }); setImages([])
      onCreated && onCreated()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">Add Product</h3>
        <p className="text-sm text-gray-600 mt-1">Create a new product.</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Size (L)</label>
              <input type="number" min="0" step="0.1" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.sizeLiters} onChange={e => setForm({ ...form, sizeLiters: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Price</label>
              <input type="number" min="0" step="0.01" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Images</label>
            <div className="flex items-center gap-2 mb-2">
              <input type="file" accept="image/*" onChange={onPickImage} disabled={uploading} />
              {uploading && <span className="text-xs text-gray-500">Uploading...</span>}
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((url, idx) => (
                  <div key={url} className="relative">
                    <img src={url} alt="product" className="h-16 w-16 object-cover rounded border" />
                    <button type="button" className="absolute -top-2 -right-2 bg-white border rounded-full text-xs px-1"
                            onClick={() => setImages(images.filter((_,i)=>i!==idx))}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="login-btn bg-primary text-white px-4 py-2 rounded-md">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
