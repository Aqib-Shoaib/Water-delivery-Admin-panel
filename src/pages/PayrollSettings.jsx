import React, { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function PayrollSettings() {
  const { token } = useAuth()
  const [form, setForm] = useState({
    hourlyRate: 0,
    overtimeRate: 0,
    commissionPerBottle: 1.5,
    referralRate: 1000,
    workingDaysPerMonth: 26,
    workingHoursPerDay: 10,
    vatRate: 0,
    applyVatTo: 'none',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/payroll/settings`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setForm(prev => ({ ...prev, ...data }))
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [token])

  const onChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name.endsWith('Rate') || name.includes('Hours') || name.includes('Days') ? Number(value) : value }))
  }

  const onSubmit = async e => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/payroll/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setMessage('Saved')
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 border-l-4 border-primary">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary">Payroll Settings</h2>
            <p className="text-base text-gray-500">Admin-configured rates and rules for salary calculations</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
            <button onClick={onSubmit} disabled={saving} className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm">Hourly Rate</label>
              <input type="number" step="0.01" name="hourlyRate" value={form.hourlyRate} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Overtime Hourly Rate</label>
              <input type="number" step="0.01" name="overtimeRate" value={form.overtimeRate} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Commission Per Bottle</label>
              <input type="number" step="0.01" name="commissionPerBottle" value={form.commissionPerBottle} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Referral Rate</label>
              <input type="number" step="1" name="referralRate" value={form.referralRate} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Working Days / Month</label>
              <input type="number" step="1" name="workingDaysPerMonth" value={form.workingDaysPerMonth} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Working Hours / Day</label>
              <input type="number" step="0.1" name="workingHoursPerDay" value={form.workingHoursPerDay} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">VAT Rate (%)</label>
              <input type="number" step="0.01" name="vatRate" value={form.vatRate} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">VAT Application</label>
              <select name="applyVatTo" value={form.applyVatTo} onChange={onChange} className="w-full border rounded px-3 py-2">
                <option value="none">None</option>
                <option value="gross_addon">Add to Gross</option>
                <option value="deduct_from_net">Deduct from Net</option>
              </select>
            </div>
            {error && <div className="md:col-span-2 text-red-600">{error}</div>}
            {message && <div className="md:col-span-2 text-green-700">{message}</div>}
          </form>
        )}
      </Card>
    </div>
  )
}
