import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function ym(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export default function Payroll() {
  const { token, hasPermission } = useAuth()
  const [month, setMonth] = useState(ym())
  const [slips, setSlips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // quick generate form
  const [userId, setUserId] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const canWrite = useMemo(() => hasPermission && hasPermission('salarySlips:write'), [hasPermission])

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/salary-slips?month=${encodeURIComponent(month)}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setSlips(Array.isArray(data) ? data : [])
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }, [token, month])

  useEffect(() => { load() }, [load])

  const generate = async () => {
    if (!token || !userId) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/salary-slips/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, month, overrides: {} }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setMessage('Generated draft slip')
      setUserId('')
      await load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  const finalize = async (id) => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/salary-slips/${id}/finalize`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { setError(e.message) }
  }

  const pay = async (id) => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/salary-slips/${id}/pay`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await load()
    } catch (e) { setError(e.message) }
  }

  const exportCsv = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/salary-slips/export?month=${encodeURIComponent(month)}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `salary-slips-${month}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 border-l-4 border-primary">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold text-primary">Payroll</h2>
            <p className="text-base text-gray-500">Generate, finalize and pay salary slips by month</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="border rounded px-3 py-2" />
            <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
            <button onClick={exportCsv} className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary">Export CSV</button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="py-2 text-red-600">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2 pr-4">Employee</th>
                      <th className="py-2 pr-4">Month</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Worked</th>
                      <th className="py-2 pr-4">Overtime</th>
                      <th className="py-2 pr-4">Gross</th>
                      <th className="py-2 pr-4">Net</th>
                      {canWrite && <th className="py-2 pr-4">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {slips.map(s => (
                      <tr key={s._id} className="border-b">
                        <td className="py-2 pr-4">{s.user?.name || s.userName || '—'}</td>
                        <td className="py-2 pr-4">{s.month}</td>
                        <td className="py-2 pr-4">{s.status}</td>
                        <td className="py-2 pr-4">{s.components?.workedHours ?? 0}</td>
                        <td className="py-2 pr-4">{s.components?.overtimeHours ?? 0}</td>
                        <td className="py-2 pr-4">{(s.gross ?? 0).toLocaleString()}</td>
                        <td className="py-2 pr-4">{(s.net ?? 0).toLocaleString()}</td>
                        {canWrite && (
                          <td className="py-2 pr-4 space-x-2">
                            {s.status === 'draft' && (
                              <button onClick={() => finalize(s._id)} className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Finalize</button>
                            )}
                            {s.status === 'finalized' && (
                              <button onClick={() => pay(s._id)} className="px-2 py-1 text-xs rounded bg-green-600 text-white">Mark Paid</button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                    {slips.length === 0 && (
                      <tr><td className="py-4 text-gray-500" colSpan={8}>No slips found for {month}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div>
            <div className="p-3 border rounded">
              <div className="font-medium mb-2">Quick Generate</div>
              <div className="text-xs text-gray-500 mb-3">Generate or update a draft slip for the selected month.</div>
              <div className="space-y-2">
                <label className="block text-sm">Employee User ID</label>
                <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="MongoDB ObjectId" className="w-full border rounded px-3 py-2" />
                <button disabled={!canWrite || saving || !userId} onClick={generate} className="w-full px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary disabled:opacity-60">{saving ? 'Generating...' : 'Generate Draft'}</button>
                {message && <div className="text-green-700 text-sm">{message}</div>}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
