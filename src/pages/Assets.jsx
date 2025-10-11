import React, { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-primary">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

// Colors for charts
const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function Charts({ summary }) {
  const emptyData = useMemo(() => ([
    { name: 'Inbound Empty', value: Number(summary.inboundEmpty || 0) },
    { name: 'Outbound Empty', value: Number(summary.outboundEmpty || 0) },
    { name: 'In-hand Empty', value: Number(summary.inhandEmpty || 0) },
    { name: 'Damaged Bottles', value: Number(summary.damagedEmpty || 0) },
  ]), [summary])

  const dispData = useMemo(() => ([
    { name: 'Inbound Dispenser', value: Number(summary.inboundDisp || 0) },
    { name: 'Outbound Dispenser', value: Number(summary.outboundDisp || 0) },
    { name: 'In-hand Dispenser', value: Number(summary.inhandDisp || 0) },
    { name: 'Damaged Dispenser', value: Number(summary.damagedDisp || 0) },
  ]), [summary])

  const miscData = useMemo(() => ([
    { name: 'Available Products', value: Number(summary.availableProducts || 0) },
    { name: 'Upcoming Products', value: Number(summary.upcomingProducts || 0) },
    { name: 'Vendors', value: Number(summary.vendorsCount || 0) },
  ]), [summary])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white border rounded-md p-3">
        <div className="text-sm font-semibold text-primary mb-2">Empty Bottles</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {(() => {
                const isEmpty = emptyData.every(d => d.value === 0)
                const chartData = isEmpty ? [{ name: 'No data', value: 1 }] : emptyData
                return (
                  <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} stroke="#fff" strokeWidth={1}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-empty-${index}`} fill={isEmpty ? '#e5e7eb' : COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                )
              })()}
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border rounded-md p-3">
        <div className="text-sm font-semibold text-primary mb-2">Dispensers</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {(() => {
                const isEmpty = dispData.every(d => d.value === 0)
                const chartData = isEmpty ? [{ name: 'No data', value: 1 }] : dispData
                return (
                  <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} stroke="#fff" strokeWidth={1}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-disp-${index}`} fill={isEmpty ? '#e5e7eb' : COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                )
              })()}
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border rounded-md p-3">
        <div className="text-sm font-semibold text-primary mb-2">Misc</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={miscData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default function Assets() {
  const { token } = useAuth()
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({
    inboundEmpty: 0,
    outboundEmpty: 0,
    inhandEmpty: 0,
    damagedEmpty: 0,
    inboundDisp: 0,
    outboundDisp: 0,
    inhandDisp: 0,
    damagedDisp: 0,
    availableProducts: 0,
    upcomingProducts: 0,
    vendorsCount: 0,
  })
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ type: '', condition: '', vendor: '' })
  const [openDetail, setOpenDetail] = useState(false)
  const [detailRow, setDetailRow] = useState(null)

  async function loadSummary() {
    const res = await fetch(`${API_BASE}/api/assets/summary`, { headers })
    if (res.ok) {
      const data = await res.json()
      setSummary(s => ({ ...s, ...data }))
    }
  }
  async function loadStock() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/assets/stock`, { headers })
      if (res.ok) {
        const data = await res.json()
        setRows(Array.isArray(data) ? data : [])
      } else setRows([])
    } catch {
      setRows([])
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (!token) return
    loadSummary()
    loadStock()
    //eslint-disable-next-line
  }, [token])

  function showDetail(r) { setDetailRow(r); setOpenDetail(true) }

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      if (filters.type && String(r.itemType || '').toLowerCase() !== String(filters.type).toLowerCase()) return false
      if (filters.condition && String(r.itemCondition || '').toLowerCase() !== String(filters.condition).toLowerCase()) return false
      if (filters.vendor && String(r.vendorName || '').toLowerCase() !== String(filters.vendor).toLowerCase()) return false
      return true
    })
  }, [rows, filters])

  function downloadCSV() {
    const header = ['Item Name', 'Item Code', 'QTY', 'Item Type', 'Item Condition', 'Allot To (Depart)', 'Approved By', 'Vendor Name']
    const lines = filteredRows.map(r => [
      r.itemName || '', r.itemCode || '', r.qty ?? '', r.itemType || '', r.itemCondition || '', r.allotToDepartment || '', r.approvedBy || '', r.vendorName || ''
    ].map(v => `"${String(v).replaceAll('"', '""')}"`).join(','))
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assets.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-primary">Asset Management</h2>
          <p className="text-sm text-gray-600">Overview of stock and assets.</p>
        </div>
      </div>

      {/* Charts */}
      <Charts summary={summary} />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <div className="text-primary mb-1">Item Type</div>
          <input className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" placeholder="e.g. bottle, dispenser" value={filters.type} onChange={e => setFilters(s => ({ ...s, type: e.target.value }))} />
        </label>
        <label className="text-sm">
          <div className="text-primary mb-1">Condition</div>
          <input className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" placeholder="e.g. new, used, damaged" value={filters.condition} onChange={e => setFilters(s => ({ ...s, condition: e.target.value }))} />
        </label>
        <label className="text-sm">
          <div className="text-primary mb-1">Vendor</div>
          <input className="form-input px-3 py-2 border-2 border-gray-200 rounded-lg" placeholder="Vendor name" value={filters.vendor} onChange={e => setFilters(s => ({ ...s, vendor: e.target.value }))} />
        </label>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setFilters({ type: '', condition: '', vendor: '' })} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Reset</button>
          <button onClick={downloadCSV} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Download CSV</button>
        </div>
      </div>

      {/* Stock details table */}
      <div className="overflow-x-auto border rounded-md bg-white">
        {loading ? (
          <div className="p-3 text-sm text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-2 px-2 text-left">Item Name</th>
                <th className="py-2 px-2 text-left">Item Code</th>
                <th className="py-2 px-2 text-left">QTY</th>
                <th className="py-2 px-2 text-left">Item Type</th>
                <th className="py-2 px-2 text-left">Item Condition</th>
                <th className="py-2 px-2 text-left">Allot To (Depart)</th>
                <th className="py-2 px-2 text-left">Approved By</th>
                <th className="py-2 px-2 text-left">Vendor Name</th>
                <th className="py-2 px-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, idx) => (
                <tr key={r._id || idx} className="border-b">
                  <td className="py-2 px-2">{r.itemName || '—'}</td>
                  <td className="py-2 px-2">{r.itemCode || '—'}</td>
                  <td className="py-2 px-2">{r.qty != null ? r.qty : '—'}</td>
                  <td className="py-2 px-2">{r.itemType || '—'}</td>
                  <td className="py-2 px-2">{r.itemCondition || '—'}</td>
                  <td className="py-2 px-2">{r.allotToDepartment || '—'}</td>
                  <td className="py-2 px-2">{r.approvedBy || '—'}</td>
                  <td className="py-2 px-2">{r.vendorName || '—'}</td>
                  <td className="py-2 px-2"><button className="text-primary underline" onClick={() => showDetail(r)}>Details</button></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="py-3 px-2 text-gray-500" colSpan={9}>No items</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {openDetail && detailRow && (
        <Modal title="Asset Details" onClose={() => setOpenDetail(false)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <Detail label="Item Name" value={detailRow.itemName} />
            <Detail label="Item Code" value={detailRow.itemCode} />
            <Detail label="QTY" value={detailRow.qty} />
            <Detail label="Item Type" value={detailRow.itemType} />
            <Detail label="Item Condition" value={detailRow.itemCondition} />
            <Detail label="Allot To (Department)" value={detailRow.allotToDepartment} />
            <Detail label="Approved By" value={detailRow.approvedBy} />
            <Detail label="Designation" value={detailRow.designation} />
            <Detail label="Contact Details" value={detailRow.contactDetails} />
            <Detail label="Vendor Name" value={detailRow.vendorName} />
            <Detail label="Vendor Mobile" value={detailRow.vendorMobile} />
            <Detail label="Vendor Address" value={detailRow.vendorAddress} />
            <Detail label="Vendor Company" value={detailRow.vendorCompany} />
            <Detail label="Remarks" value={detailRow.remarks} />
          </div>
        </Modal>
      )}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-900">{value ?? '—'}</div>
    </div>
  )
}
