import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

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
    inHandDispensers: 0,
    outHandDispensers: 0,
    damagedDispensers: 0,
    clients: 0,
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

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (range) params.set('range', range)
      if (range === 'custom') { if (from) params.set('from', from); if (to) params.set('to', to) }
      const res = await fetch(`${API_BASE}/api/history/summary?${params.toString()}`, { headers })
      if (res.ok) {
        const json = await res.json()
        setData(d => ({ ...d, ...json }))
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { if (token) load() }, [token])

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
          <h2 className="text-lg font-semibold text-primary">History</h2>
          <p className="text-sm text-gray-600">Aggregated historical metrics with time filters.</p>
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
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <Donut value={data.completedOrders} label="Total completed orders" />
            <Donut value={data.pendingOrders} label="Total pending orders" />
            <Donut value={data.cancelledOrders} label="Total cancelled orders" />
            <Donut value={data.inHandDispensers} label="Total in hand dispensers" />
            <Donut value={data.outHandDispensers} label="Total out hand dispensers" />
            <Donut value={data.damagedDispensers} label="Total damaged dispensers" />
            <Donut value={data.clients} label="Total clients" />
            <Donut value={data.discontinuedClients} label="Total discontinued clients" />
            <Donut value={data.inboundBottles} label="Total in bound bottles" />
            <Donut value={data.outboundBottles} label="Total out bound bottles" />
            <Donut value={data.suppliers} label="Total number of suppliers" />
            <Donut value={data.workingEmployees} label="Total working employee" />
            <Donut value={data.rejectedEmployees} label="Total rejected employee" />
            <Donut value={data.terminatedEmployees} label="Total terminated employee" />
            <Donut value={data.waitingEmployees} label="Total waiting list" />
            <Donut value={data.revenue} label="Total revenue" />
          </div>
        </>
      )}
    </div>
  )
}
