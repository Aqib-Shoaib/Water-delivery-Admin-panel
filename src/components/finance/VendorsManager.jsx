import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function VendorsManager() {
  const { token } = useAuth()
  const [vendors, setVendors] = useState({ items: [], total: 0 })
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [vendorForm, setVendorForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    paymentTermsDays: 30 
  })
  const [loading, setLoading] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

  const loadVendors = async () => {
    try {
      setLoading(true)
      const headers = { Authorization: `Bearer ${token}` }
      const res = await fetch(`${API_BASE}/api/finance/vendors`, { headers })
      if (res.ok) {
        const data = await res.json()
        setVendors(data)
      }
    } catch (error) {
      console.error('Failed to load vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadVendors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submitVendor(e) {
    e?.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/api/finance/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(vendorForm)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setShowVendorModal(false)
      setVendorForm({ name: '', email: '', phone: '', address: '', paymentTermsDays: 30 })
      loadVendors() // Refresh the list
    } catch {
      alert('Failed to add vendor')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <span className="text-sm font-semibold">Vendors</span>
          <button 
            type="button" 
            onClick={() => setShowVendorModal(true)} 
            className="inline-flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-md text-xs hover:bg-primary/90"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
            Add Vendor
          </button>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading vendors...</div>
          ) : vendors.items?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No vendors found</div>
          ) : (
            vendors.items?.map(v => (
              <div key={v._id} className="p-4 grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                <div className="font-medium">{v.name}</div>
                <div>{v.email||'-'}</div>
                <div>{v.phone||'-'}</div>
                <div>{v.address||'-'}</div>
                <div>{v.paymentTermsDays || 30} days</div>
              </div>
            ))
          )}
        </div>
      </div>

      {showVendorModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow w-full max-w-md">
            <form onSubmit={submitVendor}>
              <div className="px-4 py-3 border-b font-semibold">Add Vendor</div>
              <div className="p-4 space-y-3 text-sm">
                <label className="block">
                  <div className="mb-1 text-gray-700">Name</div>
                  <input 
                    type="text" 
                    required 
                    className="w-full border rounded px-2 py-1" 
                    value={vendorForm.name} 
                    onChange={e=>setVendorForm(f=>({...f,name:e.target.value}))} 
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Email</div>
                  <input 
                    type="email" 
                    className="w-full border rounded px-2 py-1" 
                    value={vendorForm.email} 
                    onChange={e=>setVendorForm(f=>({...f,email:e.target.value}))} 
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Phone</div>
                  <input 
                    type="tel" 
                    className="w-full border rounded px-2 py-1" 
                    value={vendorForm.phone} 
                    onChange={e=>setVendorForm(f=>({...f,phone:e.target.value}))} 
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Address</div>
                  <textarea 
                    className="w-full border rounded px-2 py-1" 
                    rows={2}
                    value={vendorForm.address} 
                    onChange={e=>setVendorForm(f=>({...f,address:e.target.value}))} 
                  />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Payment Terms (days)</div>
                  <input 
                    type="number" 
                    min="0" 
                    className="w-full border rounded px-2 py-1" 
                    value={vendorForm.paymentTermsDays} 
                    onChange={e=>setVendorForm(f=>({...f,paymentTermsDays:Number(e.target.value)}))} 
                  />
                </label>
              </div>
              <div className="px-4 py-3 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowVendorModal(false)} 
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
