import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function useQueryTab(defaultTab) {
  const location = useLocation()
  const navigate = useNavigate()
  const tab = new URLSearchParams(location.search).get('tab') || defaultTab
  const setTab = (t) => {
    const qs = new URLSearchParams(location.search)
    qs.set('tab', t)
    navigate({ pathname: location.pathname, search: qs.toString() }, { replace: true })
  }
  return [tab, setTab]
}

function NumberCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{Number(value || 0).toLocaleString()}</div>
    </div>
  )
}

export default function Finance() {
  const { token, hasPermission } = useAuth()
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
  const [tab, setTab] = useQueryTab('dashboard')

  const canSee = useMemo(() => ({
    dashboard: hasPermission && hasPermission('finance:read'),
    expenses: hasPermission && hasPermission('expenses:read'),
    vendors: hasPermission && hasPermission('vendors:read'),
    bank: hasPermission && hasPermission('bank:read'),
    pos: hasPermission && hasPermission('purchaseOrders:read'),
    reports: hasPermission && hasPermission('reports:read'),
  }), [hasPermission])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [overview, setOverview] = useState(null)
  const [expenses, setExpenses] = useState({ items: [], total: 0 })
  const [vendors, setVendors] = useState({ items: [], total: 0 })
  const [accounts, setAccounts] = useState([])
  const [pos, setPOs] = useState({ items: [], total: 0 })
  const [pl, setPL] = useState(null)
  const [range, setRange] = useState({ start: '', end: '' })
  const [reloadKey, setReloadKey] = useState(0)

  // Add modals state
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [showBankModal, setShowBankModal] = useState(false)

  const [expenseForm, setExpenseForm] = useState({ date: '', category: '', amount: '', vendorId: '', paymentMethod: 'cash', notes: '' })
  const [vendorForm, setVendorForm] = useState({ name: '', email: '', phone: '', address: '', paymentTermsDays: 30 })
  const [bankForm, setBankForm] = useState({ name: '', type: 'bank', bankName: '', accountNumber: '', openingBalance: '', currency: 'USD' })

  useEffect(() => {
    async function run() {
      try {
        setLoading(true)
        setError(null)
        const headers = { Authorization: `Bearer ${token}` }
        const qs = []
        if (range.start) qs.push(`start=${encodeURIComponent(range.start)}`)
        if (range.end) qs.push(`end=${encodeURIComponent(range.end)}`)
        const qstr = qs.length ? `?${qs.join('&')}` : ''
        const tasks = []
        if (canSee.dashboard) tasks.push(fetch(`${API_BASE}/api/finance/dashboard/overview${qstr}`, { headers }))
        if (canSee.expenses) tasks.push(fetch(`${API_BASE}/api/finance/expenses`, { headers }))
        if (canSee.vendors) tasks.push(fetch(`${API_BASE}/api/finance/vendors`, { headers }))
        if (canSee.bank) tasks.push(fetch(`${API_BASE}/api/finance/bank/accounts`, { headers }))
        if (canSee.pos) tasks.push(fetch(`${API_BASE}/api/finance/purchase-orders`, { headers }))
        if (canSee.reports) tasks.push(fetch(`${API_BASE}/api/finance/reports/profit-loss${qstr}`, { headers }))
        const resps = await Promise.all(tasks)
        let i = 0
        if (canSee.dashboard) { const d = await resps[i++].json(); setOverview(d) }
        if (canSee.expenses) { const d = await resps[i++].json(); setExpenses(d) }
        if (canSee.vendors) { const d = await resps[i++].json(); setVendors(d) }
        if (canSee.bank) { const d = await resps[i++].json(); setAccounts(d.items || []) }
        if (canSee.pos) { const d = await resps[i++].json(); setPOs(d) }
        if (canSee.reports) { const d = await resps[i++].json(); setPL(d) }
      } catch (e) {
        setError(e.message || 'Error')
      } finally {
        setLoading(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tab, range.start, range.end, reloadKey])

  async function submitExpense(e) {
    e?.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/api/finance/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...expenseForm, amount: Number(expenseForm.amount || 0) })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setShowExpenseModal(false)
      setExpenseForm({ date: '', category: '', amount: '', vendorId: '', paymentMethod: 'cash', notes: '' })
      setReloadKey(k => k + 1)
    } catch {
      alert('Failed to add expense')
    }
  }

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
      setReloadKey(k => k + 1)
    } catch {
      alert('Failed to add vendor')
    }
  }

  async function submitBank(e) {
    e?.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/api/finance/bank/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...bankForm, openingBalance: Number(bankForm.openingBalance || 0) })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setShowBankModal(false)
      setBankForm({ name: '', type: 'bank', bankName: '', accountNumber: '', openingBalance: '', currency: 'USD' })
      setReloadKey(k => k + 1)
    } catch {
      alert('Failed to add bank account')
    }
  }

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', show: canSee.dashboard },
    { key: 'expenses', label: 'Expenses', show: canSee.expenses },
    { key: 'vendors', label: 'Vendors', show: canSee.vendors },
    { key: 'bank', label: 'Bank & Cash', show: canSee.bank },
    { key: 'pos', label: 'Purchase Orders', show: canSee.pos },
    { key: 'reports', label: 'Reports', show: canSee.reports },
  ].filter(t => t.show)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold">Finance</h1>
        <div className="flex items-center space-x-2">
          <input type="date" value={range.start} onChange={e=>setRange(r=>({...r,start:e.target.value}))} className="border rounded px-2 py-1" />
          <input type="date" value={range.end} onChange={e=>setRange(r=>({...r,end:e.target.value}))} className="border rounded px-2 py-1" />
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2 rounded-md text-sm border ${tab===t.key?'bg-primary text-white border-primary':'bg-white text-gray-700 hover:bg-gray-50'}`}>{t.label}</button>
        ))}
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {loading && <div className="text-gray-600 text-sm">Loading...</div>}

      {tab==='dashboard' && overview && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <NumberCard label="Total Revenue" value={overview?.kpis?.totalRevenue} />
            <NumberCard label="Total Expenses" value={overview?.kpis?.totalExpenses} />
            <NumberCard label="Profit / Loss" value={overview?.kpis?.profitLoss} />
            <NumberCard label="Pending Invoices" value={overview?.kpis?.pendingInvoices} />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-semibold mb-2">Sales by Product</div>
            <div className="divide-y">
              {(overview?.salesByProduct||[]).map((p) => (
                <div key={p.productId} className="flex items-center justify-between py-2">
                  <div className="text-gray-700">{p.name}</div>
                  <div className="text-gray-500 text-sm">{p.quantity} | {Number(p.amount||0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow w-full max-w-md">
            <form onSubmit={submitExpense}>
              <div className="px-4 py-3 border-b font-semibold">Add Expense</div>
              <div className="p-4 space-y-3 text-sm">
                <label className="block">
                  <div className="mb-1 text-gray-700">Date</div>
                  <input type="date" required className="w-full border rounded px-2 py-1" value={expenseForm.date} onChange={e=>setExpenseForm(f=>({...f,date:e.target.value}))} />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Category</div>
                  <input type="text" required className="w-full border rounded px-2 py-1" value={expenseForm.category} onChange={e=>setExpenseForm(f=>({...f,category:e.target.value}))} />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Amount</div>
                  <input type="number" min="0" step="0.01" required className="w-full border rounded px-2 py-1" value={expenseForm.amount} onChange={e=>setExpenseForm(f=>({...f,amount:e.target.value}))} />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Vendor ID (optional)</div>
                  <input type="text" className="w-full border rounded px-2 py-1" value={expenseForm.vendorId} onChange={e=>setExpenseForm(f=>({...f,vendorId:e.target.value}))} />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Payment Method</div>
                  <select className="w-full border rounded px-2 py-1" value={expenseForm.paymentMethod} onChange={e=>setExpenseForm(f=>({...f,paymentMethod:e.target.value}))}>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="card">Card</option>
                  </select>
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Notes</div>
                  <textarea rows="3" className="w-full border rounded px-2 py-1" value={expenseForm.notes} onChange={e=>setExpenseForm(f=>({...f,notes:e.target.value}))}></textarea>
                </label>
              </div>
              <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                <button type="button" onClick={()=>setShowExpenseModal(false)} className="px-3 py-1.5 rounded border">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-primary text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVendorModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow w-full max-w-md">
            <form onSubmit={submitVendor}>
              <div className="px-4 py-3 border-b font-semibold">Add Vendor</div>
              <div className="p-4 space-y-3 text-sm">
                <label className="block">
                  <div className="mb-1 text-gray-700">Name</div>
                  <input type="text" required className="w-full border rounded px-2 py-1" value={vendorForm.name} onChange={e=>setVendorForm(f=>({...f,name:e.target.value}))} />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Email</div>
                  <input type="email" className="w-full border rounded px-2 py-1" value={vendorForm.email} onChange={e=>setVendorForm(f=>({...f,email:e.target.value}))} />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Phone</div>
                  <input type="text" className="w-full border rounded px-2 py-1" value={vendorForm.phone} onChange={e=>setVendorForm(f=>({...f,phone:e.target.value}))} />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Address</div>
                  <textarea rows="2" className="w-full border rounded px-2 py-1" value={vendorForm.address} onChange={e=>setVendorForm(f=>({...f,address:e.target.value}))}></textarea>
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Payment Terms (days)</div>
                  <input type="number" min="0" className="w-full border rounded px-2 py-1" value={vendorForm.paymentTermsDays} onChange={e=>setVendorForm(f=>({...f,paymentTermsDays:Number(e.target.value||0)}))} />
                </label>
              </div>
              <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                <button type="button" onClick={()=>setShowVendorModal(false)} className="px-3 py-1.5 rounded border">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-primary text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBankModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow w-full max-w-md">
            <form onSubmit={submitBank}>
              <div className="px-4 py-3 border-b font-semibold">Add Bank Account</div>
              <div className="p-4 space-y-3 text-sm">
                <label className="block">
                  <div className="mb-1 text-gray-700">Name</div>
                  <input type="text" required className="w-full border rounded px-2 py-1" value={bankForm.name} onChange={e=>setBankForm(f=>({...f,name:e.target.value}))} />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Type</div>
                  <select className="w-full border rounded px-2 py-1" value={bankForm.type} onChange={e=>setBankForm(f=>({...f,type:e.target.value}))}>
                    <option value="bank">Bank</option>
                    <option value="cash">Cash</option>
                  </select>
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Bank Name</div>
                  <input type="text" className="w-full border rounded px-2 py-1" value={bankForm.bankName} onChange={e=>setBankForm(f=>({...f,bankName:e.target.value}))} />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Account Number</div>
                  <input type="text" className="w-full border rounded px-2 py-1" value={bankForm.accountNumber} onChange={e=>setBankForm(f=>({...f,accountNumber:e.target.value}))} />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Opening Balance</div>
                  <input type="number" min="0" step="0.01" className="w-full border rounded px-2 py-1" value={bankForm.openingBalance} onChange={e=>setBankForm(f=>({...f,openingBalance:e.target.value}))} />
                </label>
                <label className="block">
                  <div className="mb-1 text-gray-700">Currency</div>
                  <input type="text" className="w-full border rounded px-2 py-1" value={bankForm.currency} onChange={e=>setBankForm(f=>({...f,currency:e.target.value}))} />
                </label>
              </div>
              <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                <button type="button" onClick={()=>setShowBankModal(false)} className="px-3 py-1.5 rounded border">Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-primary text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab==='expenses' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="text-sm font-semibold">Expenses</span>
            <button type="button" onClick={() => setShowExpenseModal(true)} className="inline-flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-md text-xs hover:bg-primary/90">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
              Add Expense
            </button>
          </div>
          <div className="divide-y">
            {(expenses.items||[]).map(e => (
              <div key={e._id} className="p-4 grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
                <div className="font-medium">{e.category||'-'}</div>
                <div>{new Date(e.date).toLocaleDateString()}</div>
                <div>{e.vendor?.name||'-'}</div>
                <div>{e.paymentMethod}</div>
                <div>{e.status}</div>
                <div className="text-right">{Number(e.amount||0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='vendors' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="text-sm font-semibold">Vendors</span>
            <button type="button" onClick={() => setShowVendorModal(true)} className="inline-flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-md text-xs hover:bg-primary/90">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
              Add Vendor
            </button>
          </div>
          <div className="divide-y">
            {(vendors.items||[]).map(v => (
              <div key={v._id} className="p-4 grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                <div className="font-medium">{v.name}</div>
                <div>{v.email||'-'}</div>
                <div>{v.phone||'-'}</div>
                <div>{v.paymentTermsDays} days</div>
                <div className="text-right">{Number(v.balance||0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='bank' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="text-sm font-semibold">Bank & Cash Accounts</span>
            <button type="button" onClick={() => setShowBankModal(true)} className="inline-flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-md text-xs hover:bg-primary/90">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
              Add Bank Account
            </button>
          </div>
          <div className="divide-y">
            {(accounts||[]).map(a => (
              <div key={a._id} className="p-4 grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                <div className="font-medium">{a.name}</div>
                <div>{a.type}</div>
                <div>{a.bankName||'-'}</div>
                <div>{a.accountNumber||'-'}</div>
                <div className="text-right">{Number(a.currentBalance||0).toLocaleString()} {a.currency||''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='pos' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b text-sm font-semibold">Purchase Orders</div>
          <div className="divide-y">
            {(pos.items||[]).map(po => (
              <div key={po._id} className="p-4 grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
                <div className="font-medium">{po.number}</div>
                <div>{po.vendor?.name||'-'}</div>
                <div>{po.status}</div>
                <div>{po.currency}</div>
                <div>{new Date(po.createdAt).toLocaleDateString()}</div>
                <div className="text-right">{Number(po.total||0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-semibold mb-2">Profit & Loss</div>
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between"><span>Revenue</span><span>{Number(pl?.revenue||0).toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span>Expenses</span><span>{Number(pl?.expenses||0).toLocaleString()}</span></div>
              <div className="flex items-center justify-between font-semibold"><span>Profit</span><span>{Number(pl?.profit||0).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
