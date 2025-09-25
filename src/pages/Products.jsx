import React, { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import AddProductModal from '../components/modals/AddProductModal.jsx'
import EditProductModal from '../components/modals/EditProductModal.jsx'
import ConfirmModal from '../components/modals/ConfirmModal.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Products() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toDelete, setToDelete] = useState(null)

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
            <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
            <button onClick={() => setShowAdd(true)} className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary">Add Product</button>
          </div>
        </div>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((p) => (
              <div key={p._id} className="card border rounded-lg p-4 hover:shadow-lg transition relative">
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    title="Edit"
                    className="p-1 rounded hover:bg-gray-100"
                    onClick={() => { setSelected(p); setShowEdit(true) }}
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h2m-6 7l-2 6 6-2 8-8a2.828 2.828 0 10-4-4l-8 8z" />
                    </svg>
                  </button>
                  <button
                    title="Delete"
                    className="p-1 rounded hover:bg-red-50"
                    onClick={() => { setToDelete(p); setConfirmDelete(true) }}
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
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
