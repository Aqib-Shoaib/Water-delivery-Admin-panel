import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function Donut({ value = 0, label = '' }) {
  return (
    <div className="p-3 border rounded-md bg-white flex items-center gap-3">
      <div className="w-12 h-12 rounded-full grid place-items-center border-4 border-blue-100 text-base font-semibold text-primary">
        {Number(value || 0).toLocaleString()}
      </div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  )
}

export default function History() {
  const { token } = useAuth()
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  const [range, setRange] = useState('month')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    codOrders: 0,
    inHandDispensers: 0,
    outHandDispensers: 0,
    damagedDispensers: 0,
    clients: 0,
    newClients: 0,
    discontinuedClients: 0,
    inboundBottles: 0,
    outboundBottles: 0,
    suppliers: 0,
    workingEmployees: 0,
    rejectedEmployees: 0,
    terminatedEmployees: 0,
    waitingEmployees: 0,
    revenue: 0,
  })
  const [pl, setPL] = useState({ revenue: 0, expenses: 0, profit: 0 })
  const [vendorsPaid, setVendorsPaid] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (range) params.set('range', range)
      if (range === 'custom') { if (from) params.set('from', from); if (to) params.set('to', to) }
      const [resHist, resPL, resVendors] = await Promise.all([
        fetch(`${API_BASE}/api/history/summary?${params.toString()}`, { headers }),
        fetch(`${API_BASE}/api/finance/reports/profit-loss`, { headers }),
        fetch(`${API_BASE}/api/finance/reports/vendors-paid`, { headers }),
      ])
      if (resHist.ok) {
        const json = await resHist.json()
        setData(d => ({ ...d, ...json }))
      }
      if (resPL.ok) {
        const json = await resPL.json()
        setPL({ revenue: json.revenue||0, expenses: json.expenses||0, profit: json.profit||0 })
      }
      if (resVendors.ok) {
        const json = await resVendors.json()
        setVendorsPaid(json.totalPaid||0)
      }
    } finally { setLoading(false) }
  }, [headers, range, from, to])

  useEffect(() => { if (token) load() }, [token, load])

  function downloadPDF() {
    // Simple print-to-PDF approach (no extra deps). Opens a printable view.
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return
    const html = `<!DOCTYPE html><html><head><title>History Summary</title>
      <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:16px;color:#111}
        h1{font-size:18px;margin:0 0 12px}
        table{border-collapse:collapse;width:100%;font-size:12px}
        th,td{border:1px solid #e5e7eb;padding:6px;text-align:left}
        .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
        .card{border:1px solid #e5e7eb;border-radius:8px;padding:8px}
        .label{font-size:11px;color:#6b7280}
        .val{font-size:14px;color:#111}
      </style></head><body>
      <h1>History Summary</h1>
      <div class="grid">
        ${[
          ['Total completed orders', data.completedOrders],
          ['Total pending orders', data.pendingOrders],
          ['Total cancelled orders', data.cancelledOrders],
          ['Total in hand dispensers', data.inHandDispensers],
          ['Total out hand dispensers', data.outHandDispensers],
          ['Total damaged dispensers', data.damagedDispensers],
          ['Total clients', data.clients],
          ['Total discontinued clients', data.discontinuedClients],
          ['Total in bound bottles', data.inboundBottles],
          ['Total out bound bottles', data.outboundBottles],
          ['Total number of suppliers', data.suppliers],
          ['Total working employee', data.workingEmployees],
          ['Total rejected employee', data.rejectedEmployees],
          ['Total terminated employee', data.terminatedEmployees],
          ['Total waiting list', data.waitingEmployees],
          ['Total revenue', data.revenue],
        ].map(([l,v]) => `<div class=card><div class=label>${l}</div><div class=val>${(v??0).toLocaleString?.()||v}</div></div>`).join('')}
      </div>
      </body></html>`
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-primary">History & Reports</h2>
          <p className="text-sm text-gray-600">Aggregated metrics with charts and time filters.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadPDF} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Download PDF</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <div className="text-primary mb-1">Range</div>
          <select className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={range} onChange={e=>setRange(e.target.value)}>
            <option value="day">Daily (last 24h)</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        {range==='custom' && (<>
          <label className="text-sm"><div className="text-primary mb-1">From</div><input type="date" className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={from} onChange={e=>setFrom(e.target.value)} /></label>
          <label className="text-sm"><div className="text-primary mb-1">To</div><input type="date" className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" value={to} onChange={e=>setTo(e.target.value)} /></label>
        </>)}
        <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Apply</button>
      </div>

      {loading ? <div className="p-3 text-sm text-gray-500">Loading...</div> : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Orders group */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-semibold mb-2">Orders</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ label: 'Orders', completed: data.completedOrders, pending: data.pendingOrders, cancelled: data.cancelledOrders, cod: data.codOrders }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#34d399" name="Completed" />
                  <Bar dataKey="pending" fill="#60a5fa" name="Pending" />
                  <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
                  <Bar dataKey="cod" fill="#f59e0b" name="Cash on Delivery" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dispensers group */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-semibold mb-2">Dispensers</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ label: 'Dispensers', inHand: data.inHandDispensers, outBound: data.outHandDispensers, damaged: data.damagedDispensers }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inHand" fill="#60a5fa" name="In hand" />
                  <Bar dataKey="outBound" fill="#34d399" name="Out bound" />
                  <Bar dataKey="damaged" fill="#ef4444" name="Damaged" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clients group */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-semibold mb-2">Clients</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ label: 'Clients', total: data.clients, new: data.newClients, discontinued: data.discontinuedClients }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#60a5fa" name="Total" />
                  <Bar dataKey="new" fill="#34d399" name="New (15 days)" />
                  <Bar dataKey="discontinued" fill="#ef4444" name="Discontinued" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottles group */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-semibold mb-2">Bottles</div>
            <div className="h-64">
              {(() => {
                const inHand = Math.max(0, (data.inboundBottles||0) - (data.outboundBottles||0))
                const rows = [{ label: 'Bottles', inbound: data.inboundBottles, outbound: data.outboundBottles, inHand }]
                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rows}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="inbound" fill="#34d399" name="Inbound" />
                      <Bar dataKey="outbound" fill="#60a5fa" name="Outbound" />
                      <Bar dataKey="inHand" fill="#f59e0b" name="In hand" />
                    </BarChart>
                  </ResponsiveContainer>
                )
              })()}
            </div>
          </div>

          {/* Company & Areas group (placeholders if unavailable) */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-semibold mb-2">Suppliers & Areas</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ label: 'Counts', suppliers: data.suppliers, areas: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="suppliers" fill="#60a5fa" name="Suppliers" />
                  <Bar dataKey="areas" fill="#a78bfa" name="Areas/Locations" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Employees group */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-semibold mb-2">Employees</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ label: 'Employees', working: data.workingEmployees, cancelled: data.rejectedEmployees, terminated: data.terminatedEmployees, waiting: data.waitingEmployees }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="working" fill="#34d399" name="Working" />
                  <Bar dataKey="cancelled" fill="#f59e0b" name="Cancelled" />
                  <Bar dataKey="terminated" fill="#ef4444" name="Terminated" />
                  <Bar dataKey="waiting" fill="#60a5fa" name="Waiting" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Finance group */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-semibold mb-2">Finance</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ label: 'Finance', revenue: pl.revenue||0, expenses: pl.expenses||0, vendorsPaid: vendorsPaid||0 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#34d399" name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  <Bar dataKey="vendorsPaid" fill="#60a5fa" name="Paid to Vendors" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
