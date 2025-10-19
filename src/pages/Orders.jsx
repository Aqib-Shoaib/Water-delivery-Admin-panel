import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useTableControls from '../hooks/useTableControls'
import TableControls from '../components/ui/TableControls.jsx'
import { NavLink } from 'react-router-dom'
import OrderDetailModal from '../components/modals/OrderDetailModal.jsx'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Orders() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [stats, setStats] = useState(null)
  const [selected, setSelected] = useState(null)
  const [statusData, setStatusData] = useState([])
  const searchable = ['customer.name','customer.email','status','address','assignedDriver.name','items.product.name']
  const { items: view, controls } = useTableControls(items, { initialPageSize: 10, searchableKeys: searchable })

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token])

  const COLORS = ['#1d4ed8', '#059669', '#f59e0b', '#ef4444', '#7c3aed', '#0ea5e9', '#14b8a6', '#9333ea']

  // Backend status options
  const STATUS_OPTIONS = [
    { value: 'pending_payment', label: 'pending_payment' },
    { value: 'placed', label: 'placed' },
    { value: 'assigned', label: 'assigned' },
    { value: 'driver_assigned', label: 'driver_assigned' },
    { value: 'en_route', label: 'en_route' },
    { value: 'delivered', label: 'delivered' },
    { value: 'cancelled', label: 'cancelled' },
    { value: 'failed', label: 'failed' },
  ]

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const [ordersRes, usersRes, statsRes, statusRes] = await Promise.all([
        fetch(`${API_BASE}/api/orders`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/admin/users`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/analytics/order-management-stats`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/analytics/status-breakdown?range=month`, { headers: authHeaders }),
      ])
      if (!ordersRes.ok) throw new Error(`Orders HTTP ${ordersRes.status}`)
      if (!usersRes.ok) throw new Error(`Users HTTP ${usersRes.status}`)
      if (!statsRes.ok) throw new Error(`Stats HTTP ${statsRes.status}`)
      if (!statusRes.ok) throw new Error(`Status HTTP ${statusRes.status}`)
      const orders = await ordersRes.json()
      const users = await usersRes.json()
      const statsJson = await statsRes.json()
      setItems(orders)
      setDrivers(users.filter(u => u.role === 'driver'))
      setStats(statsJson)
      const statusJson = await statusRes.json()
      const sd = Object.entries(statusJson || {}).map(([k,v]) => ({ name: k, count: v }))
      setStatusData(sd)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Debounced server-side search for names and status
  useEffect(() => {
    if (!token) return
    const q = (controls.query || '').trim()
    const t = setTimeout(async () => {
      try {
        const url = `${API_BASE}/api/orders${q ? `?q=${encodeURIComponent(q)}` : ''}`
        const res = await fetch(url, { headers: authHeaders })
        if (res.ok) {
          const data = await res.json()
          setItems(data)
        }
      } catch {
        /* ignore */
      }
    }, 400)
    return () => clearTimeout(t)
  }, [controls.query, token, authHeaders])

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
        <h2 className="text-xl font-semibold">Order Management</h2>
        <Button variant="secondary" onClick={load}>Refresh</Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-2">On-time vs Delayed</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} data={[
                    { name: 'On-time', value: stats.totals?.totalOnTimeDeliveredOrders || 0 },
                    { name: 'Delayed', value: stats.totals?.totalDelayedOrders || 0 },
                  ]}>
                    {[0,1].map(i => <Cell key={`cell-ontime-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-2">Complaints Breakdown</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" nameKey="name" outerRadius={90} data={(() => {
                    const total = stats.totals?.totalComplaints || 0
                    const staff = stats.totals?.staffComplaints || 0
                    const product = stats.totals?.productComplaints || 0
                    const other = Math.max(0, total - staff - product)
                    const rows = [
                      { name: 'Staff', value: staff },
                      { name: 'Product', value: product },
                      { name: 'Other', value: other },
                    ]
                    return rows.every(r => r.value === 0) ? [{ name: 'No data', value: 1 }] : rows
                  })()}>
                    {[0,1,2].map(i => <Cell key={`cell-compl-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-2">Payment Method</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" nameKey="name" outerRadius={90} data={(() => {
                    const total = stats.totals?.totalOrders || 0
                    const cod = stats.totals?.totalCashOnDeliveryOrders || 0
                    const non = Math.max(0, total - cod)
                    const rows = [
                      { name: 'COD', value: cod },
                      { name: 'Non-COD', value: non },
                    ]
                    return rows.every(r => r.value === 0) ? [{ name: 'No data', value: 1 }] : rows
                  })()}>
                    {[0,1].map(i => <Cell key={`cell-pay-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-2">Client Satisfaction</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} data={(() => {
                    const avg = Number(stats.satisfaction?.average || 0)
                    const val = Math.max(0, Math.min(5, avg))
                    const rows = [
                      { name: 'Average', value: val },
                      { name: 'Remaining', value: Math.max(0, 5 - val) },
                    ]
                    return val <= 0 ? [{ name: 'No votes', value: 1 }] : rows
                  })()}>
                    {[0,1].map(i => <Cell key={`cell-sat-${i}`} fill={COLORS[(i+4) % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-xs text-gray-600">Avg: {Number(stats.satisfaction?.average || 0)} ({stats.satisfaction?.votes || 0} votes)</div>
          </Card>
        </div>
      )}

      {statusData && statusData.length > 0 && (
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-2">Status Breakdown (Month)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Orders" fill="#1d4ed8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card className="p-4">
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="mt-2">
            <>
              <TableControls controls={controls} className="mb-3" />
              <div className="overflow-x-auto bg-white shadow rounded-md">
                <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50">
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
                  <tr key={o._id} className="align-top hover:bg-gray-50">
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
                        value={o.status || 'placed'}
                        onChange={e => updateOrder(o._id, { status: e.target.value })}
                        disabled={!!updatingId}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-4 space-x-2 whitespace-nowrap">
                      <Button variant="secondary" disabled={!!updatingId} onClick={() => setSelected(o)}>View</Button>
                      <Button variant="primary" disabled={!!updatingId} onClick={() => updateOrder(o._id, { assignedDriver: o.assignedDriver?._id || null })}>Update Assignee</Button>
                      <Button variant="secondary" disabled={!!updatingId} onClick={() => updateOrder(o._id, { assignedDriver: o.assignedDriver?._id || null, status: 'driver_assigned' })}>Order to Assignee</Button>
                      <NavLink to="/messages" className="inline-block"><Button variant="secondary">Send Message</Button></NavLink>
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

      {/* Details Modal */}
      {!!selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
