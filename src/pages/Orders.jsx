import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useTableControls from '../hooks/useTableControls'
import TableControls from '../components/ui/TableControls.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Orders() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const searchable = ['customer.name','customer.email','status','address','assignedDriver.name','items.product.name']
  const { items: view, controls } = useTableControls(items, { initialPageSize: 10, searchableKeys: searchable })

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (!ordersRes.ok) throw new Error(`Orders HTTP ${ordersRes.status}`)
      if (!usersRes.ok) throw new Error(`Users HTTP ${usersRes.status}`)
      const orders = await ordersRes.json()
      const users = await usersRes.json()
      setItems(orders)
      setDrivers(users.filter(u => u.role === 'driver'))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateOrder = async (id, patch) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(patch) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) {
      alert(e.message)
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Orders</h2>
        <Button variant="secondary" onClick={load}>Refresh</Button>
      </div>

      <Card className="p-4">
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="mt-2">
            <>
              <TableControls controls={controls} className="mb-3" />
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Items</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Address</th>
                  <th className="py-2 pr-4">Driver</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {view.map(o => (
                  <tr key={o._id} className="border-b last:border-b-0 align-top">
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(o.createdAt || o._id?.toString()?.substring(0,8) * 1000).toLocaleString()}</td>
                    <td className="py-2 pr-4">{o.customer?.name || '—'}<div className="text-xs text-gray-500">{o.customer?.email}</div></td>
                    <td className="py-2 pr-4">
                      <ul className="list-disc pl-4">
                        {(o.items || []).map((it, idx) => (
                          <li key={idx}>{it.product?.name} × {it.quantity} ({it.product?.sizeLiters}L)</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap">${'{'}o.totalAmount?.toFixed ? o.totalAmount.toFixed(2) : o.totalAmount{'}'}</td>
                    <td className="py-2 pr-4 max-w-xs">{o.address || '—'}</td>
                    <td className="py-2 pr-4">
                      <select
                        className="block w-40 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        value={o.assignedDriver?._id || ''}
                        onChange={e => updateOrder(o._id, { assignedDriver: e.target.value || null })}
                        disabled={!!updatingId}
                      >
                        <option value="">Unassigned</option>
                        {drivers.map(d => (
                          <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-4">
                      <select
                        className="block w-36 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        value={o.status || 'pending'}
                        onChange={e => updateOrder(o._id, { status: e.target.value })}
                        disabled={!!updatingId}
                      >
                        <option value="pending">pending</option>
                        <option value="processing">processing</option>
                        <option value="out_for_delivery">out_for_delivery</option>
                        <option value="delivered">delivered</option>
                        <option value="canceled">canceled</option>
                      </select>
                    </td>
                    <td className="py-2 pr-4">
                      <Button variant="secondary" disabled={!!updatingId} onClick={() => load()}>Reload</Button>
                    </td>
                  </tr>
                ))}
                {view.length === 0 && (
                  <tr><td className="py-6 text-gray-500" colSpan={8}>No orders</td></tr>
                )}
              </tbody>
                </table>
              </div>
            </>
          </div>
        )}
      </Card>
    </div>
  )
}
