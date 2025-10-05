import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import TableControls from '../components/ui/TableControls.jsx'
import useTableControls from '../hooks/useTableControls'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Invoices() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(20)
  const searchable = ['number','status','order.customer.name','order.customer.email']
  const { items: view, controls } = useTableControls(items, { initialPageSize: 10, searchableKeys: searchable })

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  async function load(p = page) {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) })
      const res = await fetch(`${API_BASE}/api/invoices?${params.toString()}`, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data.items)
      setTotal(data.total)
      setPage(data.page)
      setLimit(data.limit)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  useEffect(() => { load(1) }, [])

  const markPaid = async (inv) => {
    if (!confirm(`Mark invoice ${inv.number} as paid?`)) return
    try {
      const res = await fetch(`${API_BASE}/api/invoices/${inv._id}/mark-paid`, { method: 'POST', headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load(page)
    } catch (e) { alert(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Invoices</h2>
        <button onClick={() => load(page)} className="px-3 py-2 text-sm rounded-md border">Refresh</button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="bg-white border rounded-lg p-4">
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <TableControls controls={controls} className="mb-3" />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Number</th>
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {view.map(inv => (
                    <tr key={inv._id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">{inv.number}</td>
                      <td className="py-2 pr-4">{inv.order?._id || '—'}<div className="text-xs text-gray-500">{inv.order?.status}</div></td>
                      <td className="py-2 pr-4">{inv.customer?.name || inv.order?.customer?.name || '—'}<div className="text-xs text-gray-500">{inv.customer?.email || inv.order?.customer?.email}</div></td>
                      <td className="py-2 pr-4">${'{'}inv.total?.toFixed ? inv.total.toFixed(2) : inv.total{'}'}</td>
                      <td className="py-2 pr-4">{inv.status}</td>
                      <td className="py-2 pr-4">
                        {inv.status !== 'paid' && (
                          <button onClick={() => markPaid(inv)} className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50">Mark Paid</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {view.length === 0 && (
                    <tr><td className="py-6 text-gray-500" colSpan={6}>No invoices</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
