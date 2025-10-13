import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const COLORS = ['#1d4ed8', '#059669', '#f59e0b', '#ef4444', '#7c3aed', '#0ea5e9']

export default function Dashboard() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [statusBreakdown, setStatusBreakdown] = useState({})
  const [upcoming, setUpcoming] = useState([])
  const [topCustomers, setTopCustomers] = useState([])
  const [driverInsights, setDriverInsights] = useState([])
  const [range, setRange] = useState('month') // day | week | month

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      if (!token) return
      setLoading(true)
      setError('')
      try {
        const [sumRes, recentRes, brkRes, upcRes, topRes, drvRes] = await Promise.all([
          fetch(`${API_BASE}/api/analytics/summary?range=${encodeURIComponent(range)}`, { headers }),
          fetch(`${API_BASE}/api/analytics/recent-orders?limit=10`, { headers }),
          fetch(`${API_BASE}/api/analytics/status-breakdown?range=${encodeURIComponent(range)}`, { headers }),
          fetch(`${API_BASE}/api/analytics/upcoming-schedules`, { headers }),
          fetch(`${API_BASE}/api/analytics/top-customers?range=${encodeURIComponent(range)}&limit=10`, { headers }),
          fetch(`${API_BASE}/api/analytics/driver-insights?range=week`, { headers }),
        ])
        if (!sumRes.ok) throw new Error(`summary HTTP ${sumRes.status}`)
        if (!recentRes.ok) throw new Error(`recent HTTP ${recentRes.status}`)
        if (!brkRes.ok) throw new Error(`breakdown HTTP ${brkRes.status}`)
        if (!upcRes.ok) throw new Error(`upcoming HTTP ${upcRes.status}`)
        if (!topRes.ok) throw new Error(`top HTTP ${topRes.status}`)
        if (!drvRes.ok) throw new Error(`drivers HTTP ${drvRes.status}`)

        const [sum, recent, brk, upc, top, drv] = await Promise.all([
          sumRes.json(), recentRes.json(), brkRes.json(), upcRes.json(), topRes.json(), drvRes.json()
        ])
        if (cancelled) return
        setSummary(sum)
        setRecentOrders(recent)
        setStatusBreakdown(brk)
        setUpcoming(upc)
        setTopCustomers(top)
        setDriverInsights(drv)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [token, range, headers])

  const statusData = useMemo(() => Object.entries(statusBreakdown || {}).map(([name, value]) => ({ name, value })), [statusBreakdown])

  function ordersSum(obj) {
    if (!obj) return 0
    return Object.values(obj).reduce((a, b) => a + (b || 0), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Range</span>
          <select className="px-2 py-1 border border-gray-300 rounded-md" value={range} onChange={e => setRange(e.target.value)}>
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {error && <div className="p-3 text-sm text-red-600 border border-red-200 rounded-md">{error}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Orders Today</div>
          <div className="text-2xl font-semibold">{ordersSum(summary?.orders?.today) || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Orders This Week</div>
          <div className="text-2xl font-semibold">{ordersSum(summary?.orders?.week) || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Orders This Month</div>
          <div className="text-2xl font-semibold">{ordersSum(summary?.orders?.month) || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">On-time Rate</div>
          <div className="text-2xl font-semibold">{summary?.deliveryPerformance?.onTimeRate ?? 0}%</div>
        </Card>
      </div>

      {/* Revenue and Active Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">Revenue Summary ({range})</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Delivered</span><span>PKR {summary?.revenue?.delivered?.toFixed ? summary.revenue.delivered.toFixed(0) : summary?.revenue?.delivered || 0}</span></div>
            <div className="flex justify-between"><span>Pending</span><span>PKR {summary?.revenue?.pending?.toFixed ? summary.revenue.pending.toFixed(0) : summary?.revenue?.pending || 0}</span></div>
            <div className="flex justify-between"><span>Cancelled</span><span>PKR {summary?.revenue?.cancelled?.toFixed ? summary.revenue.cancelled.toFixed(0) : summary?.revenue?.cancelled || 0}</span></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">Active Users (since week start)</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Customers</span><span>{summary?.activeUsers?.customers ?? 0}</span></div>
            <div className="flex justify-between"><span>Drivers</span><span>{summary?.activeUsers?.drivers ?? 0}</span></div>
            <div className="flex justify-between"><span>Avg Delivery Time</span><span>{summary?.deliveryPerformance?.avgMinutes ? `${summary.deliveryPerformance.avgMinutes.toFixed(1)} min` : '—'}</span></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">Customer Acquisition ({range})</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>New Customers</span><span>{summary?.customerAcquisition?.newCustomers ?? 0}</span></div>
            <div className="flex justify-between"><span>Repeat Rate</span><span>{summary?.customerAcquisition?.repeatRate ?? 0}%</span></div>
          </div>
        </Card>
      </div>

      {/* Status Breakdown + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Order Status Breakdown ({range})</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Recent Orders</div>
          </div>
          <div className="overflow-x-auto bg-white shadow rounded-md">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="py-2 pr-4">Order ID</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Driver</th>
                  <th className="py-2 pr-4">Address</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders || []).slice(0, 10).map(o => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="py-2 pr-4">{o._id}</td>
                    <td className="py-2 pr-4">{o.customer?.name || '—'}</td>
                    <td className="py-2 pr-4">{o.assignedDriver?.name || '—'}</td>
                    <td className="py-2 pr-4 max-w-xs truncate" title={o.address}>{o.address}</td>
                    <td className="py-2 pr-4">{o.status}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td className="py-4 text-gray-500" colSpan={5}>No recent orders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Upcoming schedules + Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">Upcoming Schedules (next 7 days)</div>
          <div className="max-h-72 overflow-y-auto">
            {(upcoming || []).map(o => (
              <div key={o._id} className="py-2 border-b last:border-b-0">
                <div className="text-sm font-medium text-primary">{o.customer?.name || '—'} → {o.assignedDriver?.name || 'Unassigned'}</div>
                <div className="text-xs text-gray-500">{o.eta ? new Date(o.eta).toLocaleString() : 'No ETA'}</div>
                <div className="text-xs text-gray-500 truncate">{o.address}</div>
              </div>
            ))}
            {upcoming.length === 0 && <div className="py-4 text-sm text-gray-500">No upcoming schedules</div>}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">Top Customers ({range})</div>
          <div className="overflow-x-auto bg-white shadow rounded-md">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Orders</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Avg</th>
                </tr>
              </thead>
              <tbody>
                {(topCustomers || []).map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="py-2 pr-4">{c.name || '—'}</td>
                    <td className="py-2 pr-4">{c.orders}</td>
                    <td className="py-2 pr-4">PKR {c.amount?.toFixed ? c.amount.toFixed(0) : c.amount}</td>
                    <td className="py-2 pr-4">PKR {c.avgOrderValue?.toFixed ? c.avgOrderValue.toFixed(0) : c.avgOrderValue}</td>
                  </tr>
                ))}
                {topCustomers.length === 0 && (
                  <tr><td className="py-4 text-gray-500" colSpan={4}>No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Driver insights bar chart */}
      <Card className="p-4">
        <div className="text-sm text-gray-500 mb-2">Driver Insights (deliveries, last week)</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={driverInsights} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" hide={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="deliveries" fill="#1d4ed8" name="Deliveries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
