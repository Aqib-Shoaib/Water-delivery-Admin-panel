import React, { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Products() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({ name: '', sizeLiters: '', price: '' })
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createProduct(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: form.name,
          sizeLiters: Number(form.sizeLiters),
          price: Number(form.price),
          active: true,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setForm({ name: '', sizeLiters: '', price: '' })
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Add Product</h2>
        <form onSubmit={createProduct} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Size (L)" value={form.sizeLiters} onChange={(e) => setForm({ ...form, sizeLiters: e.target.value })} type="number" min="0" step="0.1" required />
          <Input label="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} type="number" min="0" step="0.01" required />
          <div className="flex items-end"><Button disabled={submitting} type="submit">{submitting ? 'Saving...' : 'Save'}</Button></div>
        </form>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <Button variant="secondary" onClick={load}>Refresh</Button>
        </div>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((p) => (
              <div key={p._id} className="border rounded-md p-3">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">{p.sizeLiters} L</div>
                <div className="text-sm font-semibold mt-1">${p.price}</div>
              </div>
            ))}
            {items.length === 0 && <div className="text-gray-500">No products</div>}
          </div>
        )}
      </Card>
    </div>
  )
}
