import React, { useEffect, useState, useCallback } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import AddProductModal from '../components/modals/AddProductModal.jsx'
import EditProductModal from '../components/modals/EditProductModal.jsx'
import ConfirmModal from '../components/modals/ConfirmModal.jsx'
import ProductDetailModal from '../components/modals/ProductDetailModal.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Products() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  // Single modal (EditProductModal) will serve view/edit/delete

  const load = useCallback(async () => {
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
  }, [token])

  useEffect(() => { load() }, [load])
  const onCreated = async () => { await load() }
  const onSaved = async () => { await load() }

  async function onDeleteConfirmed() {
    if (!toDelete) return
    try {
      const res = await fetch(`${API_BASE}/api/products/${toDelete._id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setConfirmDelete(false)
      setToDelete(null)
      await load()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Products</h2>
            <p className="text-xs text-gray-500">Manage your catalog</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={load}>Refresh</Button>
            <Button onClick={() => setShowAdd(true)}>Add Product</Button>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm flex items-start justify-between gap-3">
            <span>Error loading products: {error}</span>
            <button className="text-red-700 underline text-xs" onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((p) => (
              <div key={p._id} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition relative">
                <div className="flex items-center gap-2 justify-end mb-2">
                  <Button variant="secondary" className="px-2 py-1" onClick={() => { setSelected(p); setShowEdit(true) }}>Manage</Button>
                </div>
                {Array.isArray(p.images) && p.images.length > 0 ? (
                  <div className="mb-3 relative">
                    <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover rounded-md shadow-sm" />
                    {p.images.length > 1 && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                        +{p.images.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-3 w-full h-40 rounded-md bg-gray-50 shadow-inner flex items-center justify-center text-gray-500 text-sm">
                    No images for this product found
                  </div>
                )}
                <div className="font-semibold text-primary text-base">{p.name}</div>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                  <span className="px-2 py-0.5 rounded-full border border-medium-blue text-medium-blue">{p.sizeLiters} L</span>
                  <span className="px-2 py-0.5 rounded-full border border-gray-200 text-gray-700">${p.price}</span>
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="text-gray-500">No products</div>}
          </div>
        )}
      </Card>

      <AddProductModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={onCreated} apiBase={API_BASE} />
      <EditProductModal open={showEdit} onClose={() => { setShowEdit(false); setSelected(null) }} onSaved={onSaved} apiBase={API_BASE} product={selected} />
      <ProductDetailModal open={showDetail} onClose={() => { setShowDetail(false); setSelected(null) }} product={selected} />
      <ConfirmModal
        open={confirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete ${toDelete?.name || 'this product'}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => { setConfirmDelete(false); setToDelete(null) }}
        onConfirm={onDeleteConfirmed}
      />
    </div>
  )
}
