import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function EditProductModal({ open, onClose, onSaved, apiBase, product }) {
  const { token } = useAuth()
  const [form, setForm] = useState({ name: '', sizeLiters: '', price: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setForm({ name: product.name || '', sizeLiters: String(product.sizeLiters ?? ''), price: String(product.price ?? '') })
    }
  }, [product])

  if (!open || !product) return null

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: form.name.trim(),
          sizeLiters: Number(form.sizeLiters),
          price: Number(form.price),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      onSaved && onSaved()
      onClose()
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">Edit Product</h3>
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
