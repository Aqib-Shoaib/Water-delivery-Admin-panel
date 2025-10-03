import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import AddUserModal from '../components/modals/AddUserModal.jsx'
import Customers from './Customers.jsx'
import Drivers from './Drivers.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

// Lightweight UI helpers
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded border">✕</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  )
}

function Button({ children, primary, className = '', ...props }) {
  const base = primary ? 'bg-primary text-white' : 'border border-gray-300 hover:bg-gray-50'
  return <button className={`px-3 py-2 text-sm rounded-md ${base} ${className}`} {...props}>{children}</button>
}

function Input({ label, className = '', type = 'text', value, onChange }) {
  return (
    <label className={`text-sm ${className}`}>
      <div className="text-primary mb-1">{label}</div>
      <input type={type} className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={value} onChange={e=>onChange(e.target.value)} />
    </label>
  )
}

function Textarea({ label, className = '', value, onChange }) {
  return (
    <label className={`text-sm ${className}`}>
      <div className="text-primary mb-1">{label}</div>
      <textarea className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue min-h-[90px]" value={value} onChange={e=>onChange(e.target.value)} />
    </label>
  )
}

// Small read-only field display for details modals
function Field({ label, value }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-900">{value ?? '—'}</div>
    </div>
  )
}

function Donut({ value = 0, label = '' }) {
  const max = Math.max(1, value)
  const pct = value / max
  const radius = 28
  const circ = 2 * Math.PI * radius
  const dash = circ * pct
  return (
    <div className="p-3 border rounded-md flex items-center gap-3">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} stroke="#e5e7eb" strokeWidth="8" fill="none" />
        <circle cx="36" cy="36" r={radius} stroke="#2563eb" strokeWidth="8" fill="none" strokeDasharray={`${dash} ${circ-dash}`} transform="rotate(-90 36 36)" />
        <text x="36" y="41" fontSize="14" textAnchor="middle" fill="#111827">{value}</text>
      </svg>
      <div className="text-xs text-gray-700 max-w-[10rem]">{label}</div>
    </div>
  )
}

function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-200">
      {tabs.map(t => (
        <button
          key={t.value}
          className={`px-3 py-2 text-sm rounded-t-md border ${value===t.value ? 'bg-white border-gray-200 border-b-white text-primary' : 'bg-gray-50 border-transparent text-gray-700 hover:bg-gray-100'}`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function AdminSubtabs({ value, onChange }) {
  const { hasPermission } = useAuth()
  const tabs = [
    { value: 'employee-record', label: 'Employee Record' },
    { value: 'attendance-summary', label: 'Unit Attendance Log Summary' },
    hasPermission?.('payments:read') ? { value: 'payments-summary', label: 'Payments/Loans Summary' } : null,
    { value: 'salary-slip', label: 'Salary Slip Issuance' },
    hasPermission?.('users:read') ? { value: 'supervisor-assignment', label: 'User Role Assignment' } : null,
  ].filter(Boolean)
  return <Tabs tabs={tabs} value={value} onChange={onChange} />
}

export default function Divisions() {
  const { token, hasPermission } = useAuth()
  const [mainTab, setMainTab] = useState('admin') // admin | customer | staff
  const [adminTab, setAdminTab] = useState('employee-record')
  const [customerTab, setCustomerTab] = useState('customers') // future: add more
  const [staffTab, setStaffTab] = useState('drivers') // future: add more
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])
  const headersAuthOnly = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  // Employee record state
  const [empTotals, setEmpTotals] = useState({ working:0, terminated:0, waiting:0, slips:0, loans:0, leaveSalary:0, dutyResumptions:0, warnings:0, resignations:0, experiences:0 })
  const [empRows, setEmpRows] = useState([])
  const [empLoading, setEmpLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  // Role assignment state
  const [openRoleEdit, setOpenRoleEdit] = useState(false)
  const [roleForm, setRoleForm] = useState({ id:'', role:'', roleName:'', permissionsText:'' })

  const roleCounts = useMemo(() => {
    const rows = empRows || []
    const counts = { working:0, executive:0, staff:0, vendor:0, driver:0 }
    for (const u of rows) {
      if (u.status === 'working') counts.working++
      const r = (u.role||'').toLowerCase()
      if (r === 'executive') counts.executive++
      if (r === 'staff') counts.staff++
      if (r === 'vendor') counts.vendor++
      if (r === 'driver') counts.driver++
    }
    return counts
  }, [empRows])

  function openRoleEditor(user){
    setRoleForm({ id: user._id, role: user.role||'', roleName: user.roleName||'', permissionsText: (user.permissions||[]).join(',') })
    setOpenRoleEdit(true)
  }

  function downloadRolesCSV(){
    const chartPairs = [
      ['Working Employees', roleCounts.working||0],
      ['Executive Users', roleCounts.executive||0],
      ['Staff Users', roleCounts.staff||0],
      ['Vendor Users', roleCounts.vendor||0],
      ['Drivers', roleCounts.driver||0],
    ]
    const headers = ['Name','First Name','Last Name','Emp ID','Email','Phone','Role','Role Name','Department','Status']
    const csv = [
      'Role Assignment Chart Data',
      'Metric,Value',
      ...chartPairs.map(([k,v])=>`${JSON.stringify(k)},${JSON.stringify(v)}`),
      '',
      headers.join(','),
      ...empRows.map(u=>[
        JSON.stringify(u.name||''),
        JSON.stringify(u.firstName||''),
        JSON.stringify(u.lastName||''),
        JSON.stringify(u.employeeId||''),
        JSON.stringify(u.email||''),
        JSON.stringify(u.phone||''),
        JSON.stringify(u.role||''),
        JSON.stringify(u.roleName||''),
        JSON.stringify(u.department||''),
        JSON.stringify(u.status||'')
      ].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roles_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Action modals
  const [openSlip, setOpenSlip] = useState(false)
  const [openLoan, setOpenLoan] = useState(false)
  const [openLeaveSalary, setOpenLeaveSalary] = useState(false)
  const [openWarning, setOpenWarning] = useState(false)
  const [openResignation, setOpenResignation] = useState(false)
  const [openExperience, setOpenExperience] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)

  // Employee details modal
  const [openDetails, setOpenDetails] = useState(false)
  const [detailsUser, setDetailsUser] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Forms
  const [slipForm, setSlipForm] = useState({ user:'', month:'', gross:'', deductions:'', net:'', notes:'', fileUrl:'' })
  const [loanForm, setLoanForm] = useState({ user:'', amount:'', date:'', note:'' })
  const [leaveForm, setLeaveForm] = useState({ user:'', amount:'', date:'', note:'' })
  const [warningForm, setWarningForm] = useState({ user:'', date:'', subject:'', description:'', fileUrl:'' })
  const [resignationForm, setResignationForm] = useState({ user:'', date:'', reason:'', finalSettlement:'', fileUrl:'' })
  const [experienceForm, setExperienceForm] = useState({ user:'', date:'', companyName:'', remarks:'', fileUrl:'' })
  const [editForm, setEditForm] = useState({ id:'', phone:'', jobTitle:'', department:'', employeeType:'', shiftTimings:'', workLocation:'', basicSalary:'', allowances:'', deductions:'', status:'working', roleName:'' })

  function pickUser(id) {
    setSelectedUserId(id);
    setSlipForm(s => ({ ...s, user: id }));
    setLoanForm(s => ({ ...s, user: id }));
    setLeaveForm(s => ({ ...s, user: id }));
    setWarningForm(s => ({ ...s, user: id }));
    setResignationForm(s => ({ ...s, user: id }));
    setExperienceForm(s => ({ ...s, user: id }));
  }

  async function loadHolidays(){
    setHolidayLoading(true)
    try {
      const params = computeRangeParams()
      const qs = new URLSearchParams(Object.entries(params).filter(([,v])=>v)).toString()
      const res = await fetch(`${API_BASE}/api/holidays${qs?`?${qs}`:''}`, { headers })
      if (res.ok) setHolidays(await res.json())
    } catch {} finally { setHolidayLoading(false) }
  }

  function downloadAttendanceCSV() {
    const chartPairs = [
      ['Working Employees', attTotals.workingEmployees||0],
      ['Total Working Days', attTotals.workingDays||0],
      ['Total Working Hours', attTotals.workHours||0],
      ['Total Off Days', attTotals.offDays||0],
      ['Total Off Hours', attTotals.offHours||0],
      ['Total Overtime Hours', attTotals.overtimeHours||0],
      ['Public Holidays', attTotals.publicHolidays||0],
      ['Absences', attTotals.absents||0],
      ['Medical Leave', attTotals.medicalLeave||0],
    ]
    const headers = ['Name','Emp ID','Working Days','Off Days','Overtime (hrs)','Public Holidays','Absences','Medical Leave','Remarks']
    const csv = [
      'Attendance Chart Data',
      'Metric,Value',
      ...chartPairs.map(([k,v])=>`${JSON.stringify(k)},${JSON.stringify(v)}`),
      '',
      headers.join(','),
      ...attRows.map(r => [
        JSON.stringify(r.firstName||r.name||''),
        JSON.stringify(r.employeeId||''),
        JSON.stringify(r.workingDays||0),
        JSON.stringify(r.offDays||0),
        JSON.stringify(r.overtimeHours||0),
        JSON.stringify(attTotals.publicHolidays||0),
        JSON.stringify(r.absents||0),
        JSON.stringify(r.medicalLeave||0),
        JSON.stringify(r.remarks||'')
      ].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function downloadCSV() {
    const rows = empRows || []
    const chartPairs = [
      ['Working Employees', empTotals.working||empTotals.workingEmployees||0],
      ['Terminated', empTotals.terminated||0],
      ['Waiting', empTotals.waiting||0],
      ['Issued Salary Slips', empTotals.slips||0],
      ['Issued Loans', empTotals.loans||0],
      ['Leave Salary Issued', empTotals.leaveSalary||0],
      ['Duty Resumption Recv.', empTotals.dutyResumptions||0],
      ['Warning Letters', empTotals.warnings||0],
      ['Resignations', empTotals.resignations||0],
      ['Experience Letters', empTotals.experiences||0],
    ]
    const headers = ['Name','First Name','Last Name','Employee ID','Email','Phone','Role','Role Name','Job Title','Department','Employee Type','Status','Basic Salary','Allowances','Deductions','Joining Date']
    const csv = [
      'Employee Chart Data',
      'Metric,Value',
      ...chartPairs.map(([k,v])=>`${JSON.stringify(k)},${JSON.stringify(v)}`),
      '',
      headers.join(','),
    ].concat(rows.map(u => [
      JSON.stringify(u.name||''),
      JSON.stringify(u.firstName||''),
      JSON.stringify(u.lastName||''),
      JSON.stringify(u.employeeId||''),
      JSON.stringify(u.email||''),
      JSON.stringify(u.phone||''),
      JSON.stringify(u.role||''),
      JSON.stringify(u.roleName||''),
      JSON.stringify(u.jobTitle||''),
      JSON.stringify(u.department||''),
      JSON.stringify(u.employeeType||''),
      JSON.stringify(u.status||''),
      JSON.stringify(u.basicSalary??''),
      JSON.stringify(u.allowances??''),
      JSON.stringify(u.deductions??''),
      JSON.stringify(u.joiningDate?new Date(u.joiningDate).toISOString().slice(0,10):'')
    ].join(','))).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `employees_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function openEditFor(user) {
    setEditForm({
      id: user._id,
      phone: user.phone || '',
      jobTitle: user.jobTitle || '',
      department: user.department || '',
      employeeType: user.employeeType || '',
      shiftTimings: user.shiftTimings || '',
      workLocation: user.workLocation || '',
      basicSalary: user.basicSalary ?? '',
      allowances: user.allowances ?? '',
      deductions: user.deductions ?? '',
      status: user.status || 'working',
      roleName: user.roleName || ''
    })
    setOpenEdit(true)
  }

  async function uploadFileReturnUrl(file) {
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch(`${API_BASE}/api/uploads`, { method:'POST', headers: headersAuthOnly, body: fd })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json(); return data.url
  }

  async function openDetailsFor(id) {
    setOpenDetails(true)
    setDetailsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, { headers })
      if (!res.ok) throw new Error('Failed to load user')
      setDetailsUser(await res.json())
    } catch (e) { alert(e.message) } finally { setDetailsLoading(false) }
  }

  // Time filters
  const [range, setRange] = useState('month') // day|week|month|year|custom
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  function computeRangeParams() {
    if (range !== 'custom') {
      const now = new Date()
      const end = new Date(now)
      const start = new Date(now)
      if (range === 'day') start.setDate(now.getDate()-1)
      if (range === 'week') start.setDate(now.getDate()-7)
      if (range === 'month') start.setMonth(now.getMonth()-1)
      if (range === 'year') start.setFullYear(now.getFullYear()-1)
      return { from: start.toISOString(), to: end.toISOString() }
    }
    return { from, to }
  }

  async function loadEmployeeTotals() {
    try {
      const params = computeRangeParams()
      const qs = new URLSearchParams(Object.entries(params).filter(([,v])=>v)).toString()
      const res = await fetch(`${API_BASE}/api/employee-analytics/totals${qs?`?${qs}`:''}`, { headers })
      if (res.ok) setEmpTotals(await res.json())
    } catch {}
  }
  async function loadEmployees() {
    setEmpLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/users?role=driver,admin,customer`, { headers })
      if (res.ok) {
        const data = await res.json()
        setEmpRows(Array.isArray(data?.users) ? data.users : data)
      }
    } catch {} finally { setEmpLoading(false) }
  }

  // Attendance state
  const [attTotals, setAttTotals] = useState({ workingEmployees:0, workingDays:0, workHours:0, offDays:0, offHours:0, overtimeHours:0, publicHolidays:0, absents:0, medicalLeave:0 })
  const [attRows, setAttRows] = useState([])
  const [attLoading, setAttLoading] = useState(false)
  const [openAddAttendance, setOpenAddAttendance] = useState(false)
  const [attEntryForm, setAttEntryForm] = useState({ user:'', date:'', unit:'', status:'present', workHours:'', overtimeHours:'', leaveType:'', remarks:'' })
  // Holidays management
  const [holidays, setHolidays] = useState([])
  const [holidayForm, setHolidayForm] = useState({ date:'', name:'' })
  const [holidayLoading, setHolidayLoading] = useState(false)

  // Payments analytics state
  const [payTotals, setPayTotals] = useState({ employeeCount:0, totalLoanApplications:0, approvedLoans:0, pendingLoans:0, rejectedLoans:0, totalPaidAmount:0 })
  const [payRows, setPayRows] = useState([])
  const [payLoading, setPayLoading] = useState(false)
  const [openPayDetails, setOpenPayDetails] = useState(false)
  const [payDetailsRow, setPayDetailsRow] = useState(null)
  const [openLoanApp, setOpenLoanApp] = useState(false)
  const [loanAppForm, setLoanAppForm] = useState({ user:'', appliedAmount:'', applicationStatus:'pending', approvedAmount:'', monthlyInstallment:'', installmentsTotal:'', durationMonths:'', approvedByName:'', approvedByDesignation:'', approvedByPhone:'', confirmedByName:'', confirmedByDesignation:'', confirmedByPhone:'', approvalDate:'', receiptUrl:'', note:'' })

  // Salary slips tab state
  const [slipTabForm, setSlipTabForm] = useState({ user: '', month: '', gross: '', deductions: '', net: '', notes: '', fileUrl: '' })
  const [slipItems, setSlipItems] = useState([])
  const [slipLoading, setSlipLoading] = useState(false)

  // (removed) supervisors state; using employee list for role assignment

  async function loadAttendance() {
    setAttLoading(true)
    try {
      const params = computeRangeParams()
      const qs = new URLSearchParams(Object.entries(params).filter(([,v])=>v)).toString()
      const [tRes, rRes] = await Promise.all([
        fetch(`${API_BASE}/api/attendance-analytics/totals${qs?`?${qs}`:''}`, { headers }),
        fetch(`${API_BASE}/api/attendance-analytics/rows${qs?`?${qs}`:''}`, { headers }),
      ])
      if (tRes.ok) setAttTotals(await tRes.json())
      if (rRes.ok) {
        const data = await rRes.json()
        setAttRows(Array.isArray(data?.rows) ? data.rows : [])
      }
    } catch {} finally { setAttLoading(false) }
  }
  async function loadPayments() {
    setPayLoading(true)
    try {
      const params = computeRangeParams()
      const qs = new URLSearchParams(Object.entries(params).filter(([,v])=>v)).toString()
      const [tRes, rRes] = await Promise.all([
        fetch(`${API_BASE}/api/payments-analytics/totals${qs?`?${qs}`:''}`, { headers }),
        fetch(`${API_BASE}/api/payments-analytics/rows${qs?`?${qs}`:''}`, { headers }),
      ])
      if (tRes.ok) setPayTotals(await tRes.json())
      if (rRes.ok) {
        const data = await rRes.json(); setPayRows(Array.isArray(data?.rows)?data.rows:[])
      }
    } catch {} finally { setPayLoading(false) }
  }

  function showPayDetails(row){ setPayDetailsRow(row); setOpenPayDetails(true) }

  function downloadPaymentsCSV(){
    const chartPairs = [
      ['Total Employees', payTotals.employeeCount||0],
      ['Total Loan Applications', payTotals.totalLoanApplications||0],
      ['Approved Loans', payTotals.approvedLoans||0],
      ['Pending Loans', payTotals.pendingLoans||0],
      ['Rejected Loans', payTotals.rejectedLoans||0],
      ['Total Paid Amount to Employees', payTotals.totalPaidAmount||0],
    ]
    const headers = ['Name','Sur Name','Emp ID','D.O.B.','CNIC/Passport','Mobile','Email','Job Title','Gender','Joining Date','Department','Empl. Type','Applied For (Loan) PKR','Application Status','Total Approved Amount (PKR)','Total Monthly Installments (PKR)','Total installments','Duration (Months)','Approved By (Name)','Designation','Phone','Confirmed By','Designation','Phone','Remarks','Approval Date','Total Received Salary (This Period)','Total Paid Installments (PKR) This Period','Receipt URL']
    const csv = [
      'Payments Chart Data',
      'Metric,Value',
      ...chartPairs.map(([k,v])=>`${JSON.stringify(k)},${JSON.stringify(v)}`),
      '',
      headers.join(','),
      ...payRows.map(r=>[
        JSON.stringify(r.firstName||r.name||''),
        JSON.stringify(r.lastName||''),
        JSON.stringify(r.employeeId||''),
        JSON.stringify(r.dob?new Date(r.dob).toISOString().slice(0,10):''),
        JSON.stringify(r.cnicOrPassport||''),
        JSON.stringify(r.phone||''),
        JSON.stringify(r.email||''),
        JSON.stringify(r.jobTitle||''),
        JSON.stringify(r.gender||''),
        JSON.stringify(r.joiningDate?new Date(r.joiningDate).toISOString().slice(0,10):''),
        JSON.stringify(r.department||''),
        JSON.stringify(r.employeeType||''),
        JSON.stringify(r.appliedAmount||0),
        JSON.stringify(r.applicationStatus||''),
        JSON.stringify(r.approvedAmount||0),
        JSON.stringify(r.monthlyInstallment||0),
        JSON.stringify(r.installmentsTotal||0),
        JSON.stringify(r.durationMonths||0),
        JSON.stringify(r.approvedByName||''),
        JSON.stringify(r.approvedByDesignation||''),
        JSON.stringify(r.approvedByPhone||''),
        JSON.stringify(r.confirmedByName||''),
        JSON.stringify(r.confirmedByDesignation||''),
        JSON.stringify(r.confirmedByPhone||''),
        JSON.stringify(r.remarks||''),
        JSON.stringify(r.approvalDate?new Date(r.approvalDate).toISOString().slice(0,10):''),
        JSON.stringify(r.totalReceivedSalaryThisMonth||0),
        JSON.stringify(r.totalPaidInstallmentsThisMonth||0),
        JSON.stringify(r.receiptUrl||'')
      ].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  async function loadSlips() {
    setSlipLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/salary-slips`, { headers })
      if (!res.ok) throw new Error('Failed')
      setSlipItems(await res.json())
    } catch {} finally { setSlipLoading(false) }
  }
  // (removed) loadSupervisors; role assignment uses users list only

  useEffect(() => {
    if (!token || mainTab !== 'admin') return
    if (adminTab === 'employee-record') { loadEmployeeTotals(); loadEmployees(); }
    if (adminTab === 'attendance-summary') { loadAttendance(); loadEmployees(); loadHolidays(); }
    if (adminTab === 'payments-summary') loadPayments()
    if (adminTab === 'salary-slip') loadSlips()
    if (adminTab === 'supervisor-assignment') loadEmployees()
  }, [token, mainTab, adminTab])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-primary">Divisions</h2>
        <p className="text-sm text-gray-600">Organize settings and management by Admin, Customer, and Staff divisions.</p>
      </div>

      {/* Main tabs */}
      <Tabs
        tabs={[
          { value: 'admin', label: 'Admin' },
          { value: 'customer', label: 'Customer' },
          { value: 'staff', label: 'Staff' },
        ]}
        value={mainTab}
        onChange={setMainTab}
      />

      <div className="bg-white border border-gray-200 rounded-b-md p-4">
        {mainTab === 'admin' && (
          <div className="space-y-4">
            <AdminSubtabs value={adminTab} onChange={setAdminTab} />
            <div className="pt-2">
              {adminTab === 'employee-record' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-base font-semibold text-primary">Employee Record</h3>
                      <p className="text-sm text-gray-600">Charts, table, quick actions, and filters.</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>setAddOpen(true)} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Add Employee</button>
                      <button onClick={()=>{ setOpenSlip(true) }} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Pay Slip</button>
                      <button onClick={()=>{ setOpenLoan(true) }} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Loan Form</button>
                      <button onClick={()=>{ setOpenLeaveSalary(true) }} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Leave Salary</button>
                      <button onClick={()=>{ setOpenWarning(true) }} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Warning Letter</button>
                      <button onClick={()=>{ setOpenResignation(true) }} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Resignation</button>
                      <button onClick={()=>{ setOpenExperience(true) }} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Experience Letter</button>
                      <button onClick={()=>downloadCSV()} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Download CSV</button>
                    </div>
                  </div>

                  {/* Time filters */}
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
                    {range==='custom' && (
                      <>
                        <Input type="date" label="From" value={from} onChange={setFrom} />
                        <Input type="date" label="To" value={to} onChange={setTo} />
                      </>
                    )}
                    <Button onClick={loadEmployeeTotals}>Apply</Button>
                  </div>

                  {/* Donut charts */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      { k:'working', label:'Working Employees' },
                      { k:'terminated', label:'Terminated' },
                      { k:'waiting', label:'Waiting List' },
                      { k:'slips', label:'Issued Salary Slips' },
                      { k:'loans', label:'Issued Loans' },
                      { k:'leaveSalary', label:'Leave Salary Issued' },
                      { k:'dutyResumptions', label:'Duty Resumption Recv.' },
                      { k:'warnings', label:'Warning Letters' },
                      { k:'resignations', label:'Resignations' },
                      { k:'experiences', label:'Experience Letters' },
                    ].map((c,i)=> (
                      <Donut key={i} value={empTotals[c.k]||0} label={c.label} />
                    ))}
                  </div>

                  {/* Employee table (condensed) */}
                  <div className="overflow-x-auto border rounded-md">
                    {empLoading ? <div className="p-3 text-sm text-gray-500">Loading employees...</div> : (
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="py-2 px-2 text-left">Name</th>
                            <th className="py-2 px-2 text-left">Emp ID</th>
                            <th className="py-2 px-2 text-left">Role/Department</th>
                            <th className="py-2 px-2 text-left">Phone</th>
                            <th className="py-2 px-2 text-left">Email</th>
                            <th className="py-2 px-2 text-left">Status</th>
                            <th className="py-2 px-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {empRows.map(u => (
                            <tr key={u._id} className="border-b">
                              <td className="py-2 px-2">{u.firstName || u.name || '—'}</td>
                              <td className="py-2 px-2">{u.employeeId || '—'}</td>
                              <td className="py-2 px-2">{u.roleName || u.jobTitle || u.department || u.role}</td>
                              <td className="py-2 px-2">{u.phone || '—'}</td>
                              <td className="py-2 px-2">{u.email}</td>
                              <td className="py-2 px-2">{u.status || '—'}</td>
                              <td className="py-2 px-2">
                                <div className="flex flex-wrap gap-1">
                                  <button className="text-primary underline" onClick={()=>{ pickUser(u._id); setOpenSlip(true); }}>Pay Slip</button>
                                  <button className="text-primary underline" onClick={()=>{ pickUser(u._id); setOpenLoan(true); }}>Loan</button>
                                  <button className="text-primary underline" onClick={()=>{ pickUser(u._id); setOpenLeaveSalary(true); }}>Leave Salary</button>
                                  <button className="text-primary underline" onClick={()=>{ pickUser(u._id); setOpenWarning(true); }}>Warning</button>
                                  <button className="text-primary underline" onClick={()=>{ pickUser(u._id); setOpenResignation(true); }}>Resignation</button>
                                  <button className="text-primary underline" onClick={()=>{ pickUser(u._id); setOpenExperience(true); }}>Experience</button>
                                  <button className="text-primary underline" onClick={()=>openDetailsFor(u._id)}>Details</button>
                                  <button className="text-primary underline" onClick={()=>openEditFor(u)}>Edit</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {empRows.length===0 && <tr><td className="py-3 px-2 text-gray-500" colSpan={15}>No employees found</td></tr>}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Employee Details modal */}
                  {openDetails && (
                    <Modal title="Employee Details" onClose={()=>{ setOpenDetails(false); setDetailsUser(null); }}>
                      {detailsLoading && <div className="text-sm text-gray-500">Loading...</div>}
                      {!detailsLoading && detailsUser && (
                        <div className="space-y-4 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Field label="Name" value={detailsUser.name} />
                            <Field label="First Name" value={detailsUser.firstName} />
                            <Field label="Last Name" value={detailsUser.lastName} />
                            <Field label="Employee ID" value={detailsUser.employeeId} />
                            <Field label="Email" value={detailsUser.email} />
                            <Field label="Phone" value={detailsUser.phone} />
                            <Field label="DOB" value={detailsUser.dob && new Date(detailsUser.dob).toLocaleDateString()} />
                            <Field label="CNIC/Passport" value={detailsUser.cnicOrPassport || detailsUser.cnic} />
                            <Field label="Role" value={detailsUser.role} />
                            <Field label="Role Name" value={detailsUser.roleName} />
                            <Field label="Job Title" value={detailsUser.jobTitle} />
                            <Field label="Gender" value={detailsUser.gender} />
                            <Field label="Joining Date" value={detailsUser.joiningDate && new Date(detailsUser.joiningDate).toLocaleDateString()} />
                            <Field label="Department" value={detailsUser.department} />
                            <Field label="Employee Type" value={detailsUser.employeeType} />
                            <Field label="Shift Timings" value={detailsUser.shiftTimings} />
                            <Field label="Work Location" value={detailsUser.workLocation} />
                            <Field label="Education" value={detailsUser.education} />
                            <Field label="Status" value={detailsUser.status} />
                            <Field label="Basic Salary" value={typeof detailsUser.basicSalary==='number' ? detailsUser.basicSalary.toLocaleString() : detailsUser.basicSalary} />
                            <Field label="Allowances" value={typeof detailsUser.allowances==='number' ? detailsUser.allowances.toLocaleString() : detailsUser.allowances} />
                            <Field label="Deductions" value={typeof detailsUser.deductions==='number' ? detailsUser.deductions.toLocaleString() : detailsUser.deductions} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Address" value={detailsUser.address} full />
                            <Field label="Duties" value={detailsUser.duties} full />
                            <Field label="Company Phone" value={detailsUser.companyPhone} />
                            <Field label="Company Email" value={detailsUser.companyEmail} />
                            <Field label="Company Belongings" value={detailsUser.companyBelongings} full />
                            <Field label="Remarks" value={detailsUser.remarks} full />
                          </div>
                          <div className="flex justify-end"><Button onClick={()=>setOpenDetails(false)}>Close</Button></div>
                        </div>
                      )}
                    </Modal>
                  )}

                  {/* Modals */}
                  {addOpen && (
                    <AddUserModal open={addOpen} onClose={()=>setAddOpen(false)} apiBase={API_BASE} onCreated={()=>{ setAddOpen(false); loadEmployees(); }} />
                  )}

                  {openSlip && (
                    <Modal title="Create Salary Slip" onClose={()=>setOpenSlip(false)}>
                      <form className="grid grid-cols-1 md:grid-cols-3 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
                        const payload = { ...slipForm, gross:Number(slipForm.gross||0), deductions:Number(slipForm.deductions||0), net:Number(slipForm.net||0) };
                        const res = await fetch(`${API_BASE}/api/salary-slips`, { method:'POST', headers, body: JSON.stringify(payload) });
                        if(!res.ok) throw new Error('Failed'); setOpenSlip(false); setSlipForm({ user:'', month:'', gross:'', deductions:'', net:'', notes:'', fileUrl:'' }); loadEmployeeTotals();
                      } catch(err){ alert(err.message) } }}>
                        <SearchableUserSelect items={empRows} value={slipForm.user} onChange={v=>setSlipForm({...slipForm,user:v})} label="User" />
                        <Input label="Month (YYYY-MM)" value={slipForm.month} onChange={v=>setSlipForm({...slipForm,month:v})} />
                        <Input type="number" label="Gross" value={slipForm.gross} onChange={v=>setSlipForm({...slipForm,gross:v})} />
                        <Input type="number" label="Deductions" value={slipForm.deductions} onChange={v=>setSlipForm({...slipForm,deductions:v})} />
                        <Input type="number" label="Net" value={slipForm.net} onChange={v=>setSlipForm({...slipForm,net:v})} />
                        <Input label="File URL" value={slipForm.fileUrl} onChange={v=>setSlipForm({...slipForm,fileUrl:v})} className="md:col-span-2" />
                        <label className="text-sm md:col-span-3"><div className="text-primary mb-1">Upload File</div><input type="file" onChange={async(e)=>{ const f=e.target.files?.[0]; if(f){ try{ const url=await uploadFileReturnUrl(f); setSlipForm(s=>({...s,fileUrl:url})) }catch(err){ alert(err.message) } } }} /></label>
                        <Input label="Notes" value={slipForm.notes} onChange={v=>setSlipForm({...slipForm,notes:v})} className="md:col-span-3" />
                        <div className="md:col-span-3 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenSlip(false)}>Cancel</Button><Button type="submit" primary>Create</Button></div>
                      </form>
                    </Modal>
                  )}

                  {openLoan && (
                    <Modal title="Create Loan" onClose={()=>setOpenLoan(false)}>
                      <form className="grid grid-cols-1 md:grid-cols-3 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
                        const payload = { ...loanForm, amount:Number(loanForm.amount||0), type:'loan' };
                        const res = await fetch(`${API_BASE}/api/payments`, { method:'POST', headers, body: JSON.stringify(payload) });
                        if(!res.ok) throw new Error('Failed'); setOpenLoan(false); setLoanForm({ user:'', amount:'', date:'', note:'' }); loadEmployeeTotals();
                      } catch(err){ alert(err.message) } }}>
                        <SearchableUserSelect items={empRows} value={loanForm.user} onChange={v=>setLoanForm({...loanForm,user:v})} />
                        <Input type="number" label="Amount" value={loanForm.amount} onChange={v=>setLoanForm({...loanForm,amount:v})} />
                        <Input type="date" label="Date" value={loanForm.date} onChange={v=>setLoanForm({...loanForm,date:v})} />
                        <Input label="Note" value={loanForm.note} onChange={v=>setLoanForm({...loanForm,note:v})} className="md:col-span-3" />
                        <div className="md:col-span-3 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenLoan(false)}>Cancel</Button><Button type="submit" primary>Create</Button></div>
                      </form>
                    </Modal>
                  )}

                  {openLeaveSalary && (
                    <Modal title="Create Leave Salary" onClose={()=>setOpenLeaveSalary(false)}>
                      <form className="grid grid-cols-1 md:grid-cols-3 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
                        const payload = { ...leaveForm, amount:Number(leaveForm.amount||0), type:'leave-salary' };
                        const res = await fetch(`${API_BASE}/api/payments`, { method:'POST', headers, body: JSON.stringify(payload) });
                        if(!res.ok) throw new Error('Failed'); setOpenLeaveSalary(false); setLeaveForm({ user:'', amount:'', date:'', note:'' }); loadEmployeeTotals();
                      } catch(err){ alert(err.message) } }}>
                        <SearchableUserSelect items={empRows} value={leaveForm.user} onChange={v=>setLeaveForm({...leaveForm,user:v})} />
                        <Input type="number" label="Amount" value={leaveForm.amount} onChange={v=>setLeaveForm({...leaveForm,amount:v})} />
                        <Input type="date" label="Date" value={leaveForm.date} onChange={v=>setLeaveForm({...leaveForm,date:v})} />
                        <Input label="Note" value={leaveForm.note} onChange={v=>setLeaveForm({...leaveForm,note:v})} className="md:col-span-3" />
                        <div className="md:col-span-3 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenLeaveSalary(false)}>Cancel</Button><Button type="submit" primary>Create</Button></div>
                      </form>
                    </Modal>
                  )}

                  {openWarning && (
                    <Modal title="Issue Warning Letter" onClose={()=>setOpenWarning(false)}>
                      <form className="grid grid-cols-1 md:grid-cols-2 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
                        const res = await fetch(`${API_BASE}/api/warnings`, { method:'POST', headers, body: JSON.stringify(warningForm) });
                        if(!res.ok) throw new Error('Failed'); setOpenWarning(false); setWarningForm({ user:'', date:'', subject:'', description:'', fileUrl:'' }); loadEmployeeTotals();
                      } catch(err){ alert(err.message) } }}>
                        <SearchableUserSelect items={empRows} value={warningForm.user} onChange={v=>setWarningForm({...warningForm,user:v})} />
                        <Input type="date" label="Date" value={warningForm.date} onChange={v=>setWarningForm({...warningForm,date:v})} />
                        <Input label="Subject" value={warningForm.subject} onChange={v=>setWarningForm({...warningForm,subject:v})} className="md:col-span-2" />
                        <Textarea label="Description" value={warningForm.description} onChange={v=>setWarningForm({...warningForm,description:v})} className="md:col-span-2" />
                        <Input label="File URL" value={warningForm.fileUrl} onChange={v=>setWarningForm({...warningForm,fileUrl:v})} className="md:col-span-2" />
                        <label className="text-sm md:col-span-2"><div className="text-primary mb-1">Upload File</div><input type="file" onChange={async(e)=>{ const f=e.target.files?.[0]; if(f){ try{ const url=await uploadFileReturnUrl(f); setWarningForm(s=>({...s,fileUrl:url})) }catch(err){ alert(err.message) } } }} /></label>
                        <div className="md:col-span-2 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenWarning(false)}>Cancel</Button><Button type="submit" primary>Issue</Button></div>
                      </form>
                    </Modal>
                  )}

                  {openResignation && (
                    <Modal title="Record Resignation" onClose={()=>setOpenResignation(false)}>
                      <form className="grid grid-cols-1 md:grid-cols-2 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
                        const payload = { ...resignationForm, finalSettlement:Number(resignationForm.finalSettlement||0) };
                        const res = await fetch(`${API_BASE}/api/resignations`, { method:'POST', headers, body: JSON.stringify(payload) });
                        if(!res.ok) throw new Error('Failed'); setOpenResignation(false); setResignationForm({ user:'', date:'', reason:'', finalSettlement:'', fileUrl:'' }); loadEmployeeTotals();
                      } catch(err){ alert(err.message) } }}>
                        <SearchableUserSelect items={empRows} value={resignationForm.user} onChange={v=>setResignationForm({...resignationForm,user:v})} />
                        <Input type="date" label="Date" value={resignationForm.date} onChange={v=>setResignationForm({...resignationForm,date:v})} />
                        <Textarea label="Reason" value={resignationForm.reason} onChange={v=>setResignationForm({...resignationForm,reason:v})} className="md:col-span-2" />
                        <Input type="number" label="Final Settlement" value={resignationForm.finalSettlement} onChange={v=>setResignationForm({...resignationForm,finalSettlement:v})} />
                        <Input label="File URL" value={resignationForm.fileUrl} onChange={v=>setResignationForm({...resignationForm,fileUrl:v})} />
                        <label className="text-sm"><div className="text-primary mb-1">Upload File</div><input type="file" onChange={async(e)=>{ const f=e.target.files?.[0]; if(f){ try{ const url=await uploadFileReturnUrl(f); setResignationForm(s=>({...s,fileUrl:url})) }catch(err){ alert(err.message) } } }} /></label>
                        <div className="md:col-span-2 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenResignation(false)}>Cancel</Button><Button type="submit" primary>Save</Button></div>
                      </form>
                    </Modal>
                  )}

                  {openExperience && (
                    <Modal title="Issue Experience Letter" onClose={()=>setOpenExperience(false)}>
                      <form className="grid grid-cols-1 md:grid-cols-2 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
                        const res = await fetch(`${API_BASE}/api/experience-letters`, { method:'POST', headers, body: JSON.stringify(experienceForm) });
                        if(!res.ok) throw new Error('Failed'); setOpenExperience(false); setExperienceForm({ user:'', date:'', companyName:'', remarks:'', fileUrl:'' }); loadEmployeeTotals();
                      } catch(err){ alert(err.message) } }}>
                        <SearchableUserSelect items={empRows} value={experienceForm.user} onChange={v=>setExperienceForm({...experienceForm,user:v})} />
                        <Input type="date" label="Date" value={experienceForm.date} onChange={v=>setExperienceForm({...experienceForm,date:v})} />
                        <Input label="Company Name" value={experienceForm.companyName} onChange={v=>setExperienceForm({...experienceForm,companyName:v})} />
                        <Input label="File URL" value={experienceForm.fileUrl} onChange={v=>setExperienceForm({...experienceForm,fileUrl:v})} />
                        <label className="text-sm"><div className="text-primary mb-1">Upload File</div><input type="file" onChange={async(e)=>{ const f=e.target.files?.[0]; if(f){ try{ const url=await uploadFileReturnUrl(f); setExperienceForm(s=>({...s,fileUrl:url})) }catch(err){ alert(err.message) } } }} /></label>
                        <Textarea label="Remarks" value={experienceForm.remarks} onChange={v=>setExperienceForm({...experienceForm,remarks:v})} className="md:col-span-2" />
                        <div className="md:col-span-2 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenExperience(false)}>Cancel</Button><Button type="submit" primary>Issue</Button></div>
                      </form>
                    </Modal>
                  )}

                  {/* Edit Employee modal */}
                  {openEdit && (
                    <Modal title="Edit Employee" onClose={()=>setOpenEdit(false)}>
                      <form className="grid grid-cols-1 md:grid-cols-3 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
                        const payload = { phone: editForm.phone||undefined, jobTitle: editForm.jobTitle||undefined, department: editForm.department||undefined, employeeType: editForm.employeeType||undefined, shiftTimings: editForm.shiftTimings||undefined, workLocation: editForm.workLocation||undefined, basicSalary: editForm.basicSalary!==''?Number(editForm.basicSalary):undefined, allowances: editForm.allowances!==''?Number(editForm.allowances):undefined, deductions: editForm.deductions!==''?Number(editForm.deductions):undefined, status: editForm.status||undefined, roleName: editForm.roleName||undefined }
                        const res = await fetch(`${API_BASE}/api/admin/users/${editForm.id}`, { method:'PUT', headers, body: JSON.stringify(payload) })
                        if(!res.ok) throw new Error('Failed')
                        setOpenEdit(false)
                        await loadEmployees()
                        if (detailsUser && detailsUser._id === editForm.id) { const r = await fetch(`${API_BASE}/api/admin/users/${editForm.id}`, { headers }); if (r.ok) setDetailsUser(await r.json()) }
                      } catch(err){ alert(err.message) } }}>
                        <Input label="Phone" value={editForm.phone} onChange={v=>setEditForm({...editForm,phone:v})} />
                        <Input label="Job Title" value={editForm.jobTitle} onChange={v=>setEditForm({...editForm,jobTitle:v})} />
                        <Input label="Role Name" value={editForm.roleName} onChange={v=>setEditForm({...editForm,roleName:v})} />
                        <Input label="Department" value={editForm.department} onChange={v=>setEditForm({...editForm,department:v})} />
                        <Input label="Employee Type" value={editForm.employeeType} onChange={v=>setEditForm({...editForm,employeeType:v})} />
                        <Input label="Shift Timings" value={editForm.shiftTimings} onChange={v=>setEditForm({...editForm,shiftTimings:v})} />
                        <Input label="Work Location" value={editForm.workLocation} onChange={v=>setEditForm({...editForm,workLocation:v})} />
                        <Input type="number" label="Basic Salary" value={editForm.basicSalary} onChange={v=>setEditForm({...editForm,basicSalary:v})} />
                        <Input type="number" label="Allowances" value={editForm.allowances} onChange={v=>setEditForm({...editForm,allowances:v})} />
                        <Input type="number" label="Deductions" value={editForm.deductions} onChange={v=>setEditForm({...editForm,deductions:v})} />
                        <label className="text-sm">
                          <div className="text-primary mb-1">Status</div>
                          <select className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={editForm.status} onChange={e=>setEditForm({...editForm,status:e.target.value})}>
                            <option value="working">working</option>
                            <option value="waiting">waiting</option>
                            <option value="terminated">terminated</option>
                          </select>
                        </label>
                        <div className="md:col-span-3 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenEdit(false)}>Cancel</Button><Button type="submit" primary>Save</Button></div>
                      </form>
                    </Modal>
                  )}
                </section>
              )}
              {adminTab === 'attendance-summary' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-base font-semibold text-primary">Attendance Summary</h3>
                      <p className="text-sm text-gray-600">Totals, per-user stats, same time filters as Employee Record.</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>setOpenAddAttendance(true)} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Add Attendance Entry</button>
                      <button onClick={()=>downloadAttendanceCSV()} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Download CSV</button>
                    </div>
                  </div>

                  {/* Reuse time filters */}
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
                    {range==='custom' && (
                      <>
                        <Input type="date" label="From" value={from} onChange={setFrom} />
                        <Input type="date" label="To" value={to} onChange={setTo} />
                      </>
                    )}
                    <Button onClick={loadAttendance}>Apply</Button>
                  </div>

                  {/* Donut charts */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Donut value={attTotals.workingEmployees||0} label="Working Employees" />
                    <Donut value={attTotals.workingDays||0} label="Total Working Days" />
                    <Donut value={attTotals.workHours||0} label="Total Working Hours" />
                    <Donut value={attTotals.offDays||0} label="Total Off Days" />
                    <Donut value={attTotals.offHours||0} label="Total Off Hours" />
                    <Donut value={attTotals.overtimeHours||0} label="Total Overtime Hours" />
                    <Donut value={attTotals.publicHolidays||0} label="Public Holidays" />
                    <Donut value={attTotals.absents||0} label="Absences" />
                    <Donut value={attTotals.medicalLeave||0} label="Medical Leave" />
                  </div>

                  {/* Per-user table (condensed) */}
                  <div className="overflow-x-auto border rounded-md">
                    {attLoading ? <div className="p-3 text-sm text-gray-500">Loading...</div> : (
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="py-2 px-2 text-left">Name</th>
                            <th className="py-2 px-2 text-left">Emp ID</th>
                            <th className="py-2 px-2 text-left">Working Days</th>
                            <th className="py-2 px-2 text-left">Off Days</th>
                            <th className="py-2 px-2 text-left">Overtime (hrs)</th>
                            <th className="py-2 px-2 text-left">Public Holidays</th>
                            <th className="py-2 px-2 text-left">Absences</th>
                            <th className="py-2 px-2 text-left">Medical Leave</th>
                            <th className="py-2 px-2 text-left">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attRows.map(r => (
                            <tr key={r.userId} className="border-b">
                              <td className="py-2 px-2">{r.firstName || r.name || '—'}</td>
                              <td className="py-2 px-2">{r.employeeId || '—'}</td>
                              <td className="py-2 px-2">{r.workingDays || 0}</td>
                              <td className="py-2 px-2">{r.offDays || 0}</td>
                              <td className="py-2 px-2">{r.overtimeHours || 0}</td>
                              <td className="py-2 px-2">{attTotals.publicHolidays || 0}</td>
                              <td className="py-2 px-2">{r.absents || 0}</td>
                              <td className="py-2 px-2">{r.medicalLeave || 0}</td>
                              <td className="py-2 px-2">{r.remarks || '—'}</td>
                            </tr>
                          ))}
                          {attRows.length===0 && <tr><td className="py-3 px-2 text-gray-500" colSpan={9}>No rows found</td></tr>}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Holidays manager */}
                  <div className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-primary">Public Holidays</h4>
                      <div className="flex gap-2">
                        <Input type="date" label="Date" value={holidayForm.date} onChange={v=>setHolidayForm({...holidayForm,date:v})} />
                        <Input label="Name" value={holidayForm.name} onChange={v=>setHolidayForm({...holidayForm,name:v})} />
                        <Button onClick={async()=>{ try{ const payload={ date: holidayForm.date, name: holidayForm.name }; const res = await fetch(`${API_BASE}/api/holidays`, { method:'POST', headers, body: JSON.stringify(payload) }); if(!res.ok) throw new Error('Failed'); setHolidayForm({ date:'', name:'' }); loadHolidays(); }catch(e){ alert(e.message) } }}>Add</Button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      {holidayLoading ? <div className="text-xs text-gray-500 p-2">Loading...</div> : (
                        <table className="min-w-full text-xs">
                          <thead><tr className="border-b bg-gray-50"><th className="py-2 px-2 text-left">Date</th><th className="py-2 px-2 text-left">Name</th><th className="py-2 px-2 text-left">Actions</th></tr></thead>
                          <tbody>
                            {holidays.map(h => (
                              <tr key={h._id} className="border-b">
                                <td className="py-2 px-2">{h.date && new Date(h.date).toLocaleDateString()}</td>
                                <td className="py-2 px-2">{h.name || '—'}</td>
                                <td className="py-2 px-2"><button className="text-red-600 underline" onClick={async()=>{ try{ const res=await fetch(`${API_BASE}/api/holidays/${h._id}`, { method:'DELETE', headers }); if(!res.ok) throw new Error('Failed'); loadHolidays(); }catch(e){ alert(e.message) } }}>Delete</button></td>
                              </tr>
                            ))}
                            {holidays.length===0 && <tr><td className="py-2 px-2 text-gray-500" colSpan={3}>No holidays</td></tr>}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Add Attendance Entry modal */}
                  {openAddAttendance && (
                    <Modal title="Add Attendance Entry" onClose={()=>setOpenAddAttendance(false)}>
                      <form className="grid grid-cols-1 md:grid-cols-3 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
                        const payload = { ...attEntryForm, workHours: attEntryForm.workHours!==''?Number(attEntryForm.workHours):undefined, overtimeHours: attEntryForm.overtimeHours!==''?Number(attEntryForm.overtimeHours):undefined }
                        const res = await fetch(`${API_BASE}/api/attendance`, { method:'POST', headers, body: JSON.stringify(payload) });
                        if(!res.ok) throw new Error('Failed'); setOpenAddAttendance(false); setAttEntryForm({ user:'', date:'', unit:'', status:'present', workHours:'', overtimeHours:'', leaveType:'', remarks:'' }); loadAttendance();
                      } catch(err){ alert(err.message) } }}>
                        <SearchableUserSelect items={empRows} value={attEntryForm.user} onChange={v=>setAttEntryForm({...attEntryForm,user:v})} />
                        <Input type="date" label="Date" value={attEntryForm.date} onChange={v=>setAttEntryForm({...attEntryForm,date:v})} />
                        <Input label="Unit" value={attEntryForm.unit} onChange={v=>setAttEntryForm({...attEntryForm,unit:v})} />
                        <label className="text-sm"><div className="text-primary mb-1">Status</div><select className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={attEntryForm.status} onChange={e=>setAttEntryForm({...attEntryForm,status:e.target.value})}><option value="present">present</option><option value="absent">absent</option><option value="leave">leave</option><option value="half-day">half-day</option></select></label>
                        <Input type="number" label="Work Hours" value={attEntryForm.workHours} onChange={v=>setAttEntryForm({...attEntryForm,workHours:v})} />
                        <Input type="number" label="Overtime Hours" value={attEntryForm.overtimeHours} onChange={v=>setAttEntryForm({...attEntryForm,overtimeHours:v})} />
                        <Input label="Leave Type (if leave)" value={attEntryForm.leaveType} onChange={v=>setAttEntryForm({...attEntryForm,leaveType:v})} />
                        <Input label="Remarks" value={attEntryForm.remarks} onChange={v=>setAttEntryForm({...attEntryForm,remarks:v})} className="md:col-span-3" />
                        <div className="md:col-span-3 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenAddAttendance(false)}>Cancel</Button><Button type="submit" primary>Save</Button></div>
                      </form>
                    </Modal>
                  )}
                </section>
              )}

              {adminTab === 'payments-summary' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-base font-semibold text-primary">Payments & Loans</h3>
                      <p className="text-sm text-gray-600">Analytics and loan applications overview.</p>
                    </div>
                    <div className="flex gap-2">
                      {hasPermission?.('payments:write') && (
                        <button onClick={()=>setOpenLoanApp(true)} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">New Loan Application</button>
                      )}
                      {hasPermission?.('payments:read') && (
                        <button onClick={()=>downloadPaymentsCSV()} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Download CSV</button>
                      )}
                    </div>
                  </div>

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
                    {range==='custom' && (<><Input type="date" label="From" value={from} onChange={setFrom} /><Input type="date" label="To" value={to} onChange={setTo} /></>)}
                    <Button onClick={loadPayments}>Apply</Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Donut value={payTotals.employeeCount||0} label="Total Employees" />
                    <Donut value={payTotals.totalLoanApplications||0} label="Loan Applications" />
                    <Donut value={payTotals.approvedLoans||0} label="Approved Loans" />
                    <Donut value={payTotals.pendingLoans||0} label="Pending Applications" />
                    <Donut value={payTotals.rejectedLoans||0} label="Rejected Applications" />
                    <Donut value={payTotals.totalPaidAmount||0} label="Total Paid Amount" />
                  </div>

                  <div className="overflow-x-auto border rounded-md">
                    {!hasPermission?.('payments:read') ? (
                      <div className="p-3 text-sm text-gray-500">You do not have permission to view payments.</div>
                    ) : payLoading ? <div className="p-3 text-sm text-gray-500">Loading...</div> : (
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="py-2 px-2 text-left">Name</th>
                            <th className="py-2 px-2 text-left">Emp ID</th>
                            <th className="py-2 px-2 text-left">Applied (PKR)</th>
                            <th className="py-2 px-2 text-left">Status</th>
                            <th className="py-2 px-2 text-left">Approved (PKR)</th>
                            <th className="py-2 px-2 text-left">Monthly (PKR)</th>
                            <th className="py-2 px-2 text-left">Installments</th>
                            <th className="py-2 px-2 text-left">Approval Date</th>
                            <th className="py-2 px-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payRows.map(r => (
                            <tr key={r.id} className="border-b">
                              <td className="py-2 px-2">{r.firstName || r.name || '—'}</td>
                              <td className="py-2 px-2">{r.employeeId || '—'}</td>
                              <td className="py-2 px-2">{Number(r.appliedAmount||0).toLocaleString()}</td>
                              <td className="py-2 px-2">{r.applicationStatus || '—'}</td>
                              <td className="py-2 px-2">{Number(r.approvedAmount||0).toLocaleString()}</td>
                              <td className="py-2 px-2">{Number(r.monthlyInstallment||0).toLocaleString()}</td>
                              <td className="py-2 px-2">{r.installmentsTotal || 0}</td>
                              <td className="py-2 px-2">{r.approvalDate?new Date(r.approvalDate).toLocaleDateString():'—'}</td>
                              <td className="py-2 px-2"><button className="text-primary underline" onClick={()=>showPayDetails(r)}>Details</button></td>
                            </tr>
                          ))}
                          {payRows.length===0 && <tr><td className="py-3 px-2 text-gray-500" colSpan={9}>No rows found</td></tr>}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {openPayDetails && payDetailsRow && (
                    <Modal title="Loan Application Details" onClose={()=>{ setOpenPayDetails(false); setPayDetailsRow(null); }}>
                      <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Field label="Name" value={payDetailsRow.firstName||payDetailsRow.name} />
                          <Field label="Sur Name" value={payDetailsRow.lastName} />
                          <Field label="Employee ID" value={payDetailsRow.employeeId} />
                          <Field label="DOB" value={payDetailsRow.dob && new Date(payDetailsRow.dob).toLocaleDateString()} />
                          <Field label="CNIC/Passport" value={payDetailsRow.cnicOrPassport} />
                          <Field label="Mobile" value={payDetailsRow.phone} />
                          <Field label="Email" value={payDetailsRow.email} />
                          <Field label="Job Title" value={payDetailsRow.jobTitle} />
                          <Field label="Gender" value={payDetailsRow.gender} />
                          <Field label="Joining Date" value={payDetailsRow.joiningDate && new Date(payDetailsRow.joiningDate).toLocaleDateString()} />
                          <Field label="Department" value={payDetailsRow.department} />
                          <Field label="Employee Type" value={payDetailsRow.employeeType} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Field label="Applied For (PKR)" value={payDetailsRow.appliedAmount} />
                          <Field label="Application Status" value={payDetailsRow.applicationStatus} />
                          <Field label="Approved Amount (PKR)" value={payDetailsRow.approvedAmount} />
                          <Field label="Monthly Installment (PKR)" value={payDetailsRow.monthlyInstallment} />
                          <Field label="Total Installments" value={payDetailsRow.installmentsTotal} />
                          <Field label="Duration (Months)" value={payDetailsRow.durationMonths} />
                          <Field label="Approved By (Name)" value={payDetailsRow.approvedByName} />
                          <Field label="Designation" value={payDetailsRow.approvedByDesignation} />
                          <Field label="Phone" value={payDetailsRow.approvedByPhone} />
                          <Field label="Confirmed By" value={payDetailsRow.confirmedByName} />
                          <Field label="Designation" value={payDetailsRow.confirmedByDesignation} />
                          <Field label="Phone" value={payDetailsRow.confirmedByPhone} />
                          <Field label="Approval Date" value={payDetailsRow.approvalDate && new Date(payDetailsRow.approvalDate).toLocaleDateString()} />
                          <Field label="Total Received Salary (This Period)" value={payDetailsRow.totalReceivedSalaryThisMonth} />
                          <Field label="Total Paid Installments (This Period)" value={payDetailsRow.totalPaidInstallmentsThisMonth} />
                        </div>
                        {payDetailsRow.receiptUrl && (
                          <div>
                            <div className="text-[11px] text-gray-500 mb-1">Receipt</div>
                            <a href={payDetailsRow.receiptUrl} target="_blank" rel="noreferrer" className="text-primary underline">Open receipt</a>
                            <div className="mt-2"><img src={payDetailsRow.receiptUrl} alt="Receipt" className="max-h-64 rounded border" /></div>
                          </div>
                        )}
                        <div className="flex justify-end"><Button onClick={()=>setOpenPayDetails(false)}>Close</Button></div>
                      </div>
                    </Modal>
                  )}

                  {openLoanApp && hasPermission?.('payments:write') && (
                    <Modal title="New Loan Application" onClose={()=>setOpenLoanApp(false)}>
                      <form className="grid grid-cols-1 md:grid-cols-3 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
                        const payload = { user: loanAppForm.user, type: 'loan', amount: Number(loanAppForm.appliedAmount||0), note: loanAppForm.note||undefined, date: loanAppForm.approvalDate||undefined, applicationStatus: loanAppForm.applicationStatus||undefined, approvedAmount: loanAppForm.approvedAmount!==''?Number(loanAppForm.approvedAmount):undefined, monthlyInstallment: loanAppForm.monthlyInstallment!==''?Number(loanAppForm.monthlyInstallment):undefined, installmentsTotal: loanAppForm.installmentsTotal!==''?Number(loanAppForm.installmentsTotal):undefined, durationMonths: loanAppForm.durationMonths!==''?Number(loanAppForm.durationMonths):undefined, approvedByName: loanAppForm.approvedByName||undefined, approvedByDesignation: loanAppForm.approvedByDesignation||undefined, approvedByPhone: loanAppForm.approvedByPhone||undefined, confirmedByName: loanAppForm.confirmedByName||undefined, confirmedByDesignation: loanAppForm.confirmedByDesignation||undefined, confirmedByPhone: loanAppForm.confirmedByPhone||undefined, receiptUrl: loanAppForm.receiptUrl||undefined }
                        const res = await fetch(`${API_BASE}/api/payments`, { method:'POST', headers, body: JSON.stringify(payload) });
                        if(!res.ok) throw new Error('Failed'); setOpenLoanApp(false); setLoanAppForm({ user:'', appliedAmount:'', applicationStatus:'pending', approvedAmount:'', monthlyInstallment:'', installmentsTotal:'', durationMonths:'', approvedByName:'', approvedByDesignation:'', approvedByPhone:'', confirmedByName:'', confirmedByDesignation:'', confirmedByPhone:'', approvalDate:'', receiptUrl:'', note:'' }); loadPayments();
                      } catch(err){ alert(err.message) } }}>
                        <SearchableUserSelect items={empRows} value={loanAppForm.user} onChange={v=>setLoanAppForm({...loanAppForm,user:v})} />
                        <Input type="number" label="Applied Amount (PKR)" value={loanAppForm.appliedAmount} onChange={v=>setLoanAppForm({...loanAppForm,appliedAmount:v})} />
                        <label className="text-sm"><div className="text-primary mb-1">Application Status</div><select className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={loanAppForm.applicationStatus} onChange={e=>setLoanAppForm({...loanAppForm,applicationStatus:e.target.value})}><option value="pending">pending</option><option value="approved">approved</option><option value="rejected">rejected</option></select></label>
                        <Input type="number" label="Approved Amount (PKR)" value={loanAppForm.approvedAmount} onChange={v=>setLoanAppForm({...loanAppForm,approvedAmount:v})} />
                        <Input type="number" label="Monthly Installment (PKR)" value={loanAppForm.monthlyInstallment} onChange={v=>setLoanAppForm({...loanAppForm,monthlyInstallment:v})} />
                        <Input type="number" label="Total Installments" value={loanAppForm.installmentsTotal} onChange={v=>setLoanAppForm({...loanAppForm,installmentsTotal:v})} />
                        <Input type="number" label="Duration (Months)" value={loanAppForm.durationMonths} onChange={v=>setLoanAppForm({...loanAppForm,durationMonths:v})} />
                        <Input label="Approved By (Name)" value={loanAppForm.approvedByName} onChange={v=>setLoanAppForm({...loanAppForm,approvedByName:v})} />
                        <Input label="Designation" value={loanAppForm.approvedByDesignation} onChange={v=>setLoanAppForm({...loanAppForm,approvedByDesignation:v})} />
                        <Input label="Phone" value={loanAppForm.approvedByPhone} onChange={v=>setLoanAppForm({...loanAppForm,approvedByPhone:v})} />
                        <Input label="Confirmed By (Name)" value={loanAppForm.confirmedByName} onChange={v=>setLoanAppForm({...loanAppForm,confirmedByName:v})} />
                        <Input label="Designation" value={loanAppForm.confirmedByDesignation} onChange={v=>setLoanAppForm({...loanAppForm,confirmedByDesignation:v})} />
                        <Input label="Phone" value={loanAppForm.confirmedByPhone} onChange={v=>setLoanAppForm({...loanAppForm,confirmedByPhone:v})} />
                        <Input type="date" label="Approval/Apply Date" value={loanAppForm.approvalDate} onChange={v=>setLoanAppForm({...loanAppForm,approvalDate:v})} />
                        <Input label="Receipt URL" value={loanAppForm.receiptUrl} onChange={v=>setLoanAppForm({...loanAppForm,receiptUrl:v})} className="md:col-span-2" />
                        <label className="text-sm md:col-span-3"><div className="text-primary mb-1">Upload Receipt</div><input type="file" onChange={async(e)=>{ const f=e.target.files?.[0]; if(f){ try{ const url=await uploadFileReturnUrl(f); setLoanAppForm(s=>({...s,receiptUrl:url})) }catch(err){ alert(err.message) } } }} /></label>
                        <Input label="Note" value={loanAppForm.note} onChange={v=>setLoanAppForm({...loanAppForm,note:v})} className="md:col-span-3" />
                        <div className="md:col-span-3 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenLoanApp(false)}>Cancel</Button><Button type="submit" primary>Submit</Button></div>
                      </form>
                    </Modal>
                  )}
                </section>
              )}

              {adminTab === 'salary-slip' && (
                <section className="space-y-3">
                  <h3 className="text-base font-semibold text-primary">Salary Slip Issuance</h3>
                  <p className="text-sm text-gray-600">Create and list salary slips.</p>
                  <form className="grid grid-cols-1 md:grid-cols-7 gap-2" onSubmit={async(e)=>{
                    e.preventDefault()
                    const payload = { ...slipTabForm, gross: Number(slipTabForm.gross||0), deductions: Number(slipTabForm.deductions||0), net: Number(slipTabForm.net||0) }
                    try {
                      const res = await fetch(`${API_BASE}/api/salary-slips`, { method:'POST', headers, body: JSON.stringify(payload) })
                      if (!res.ok) throw new Error('Failed')
                      setSlipTabForm({ user:'', month:'', gross:'', deductions:'', net:'', notes:'', fileUrl:'' })
                      await loadSlips()
                    } catch(e){ alert(e.message) }
                  }}>
                    <input className="form-input border rounded px-2 py-1" placeholder="User ID" value={slipTabForm.user} onChange={e=>setSlipTabForm({...slipTabForm,user:e.target.value})} />
                    <input className="form-input border rounded px-2 py-1" placeholder="YYYY-MM" value={slipTabForm.month} onChange={e=>setSlipTabForm({...slipTabForm,month:e.target.value})} />
                    <input type="number" step="0.01" className="form-input border rounded px-2 py-1" placeholder="Gross" value={slipTabForm.gross} onChange={e=>setSlipTabForm({...slipTabForm,gross:e.target.value})} />
                    <input type="number" step="0.01" className="form-input border rounded px-2 py-1" placeholder="Deductions" value={slipTabForm.deductions} onChange={e=>setSlipTabForm({...slipTabForm,deductions:e.target.value})} />
                    <input type="number" step="0.01" className="form-input border rounded px-2 py-1" placeholder="Net" value={slipTabForm.net} onChange={e=>setSlipTabForm({...slipTabForm,net:e.target.value})} />
                    <input className="form-input border rounded px-2 py-1" placeholder="File URL (optional)" value={slipTabForm.fileUrl} onChange={e=>setSlipTabForm({...slipTabForm,fileUrl:e.target.value})} />
                    <input className="form-input border rounded px-2 py-1 md:col-span-2" placeholder="Notes" value={slipTabForm.notes} onChange={e=>setSlipTabForm({...slipTabForm,notes:e.target.value})} />
                    <div className="md:col-span-7 flex justify-end"><button className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50" type="submit">Create</button></div>
                  </form>
                  <div className="overflow-x-auto">
                    {slipLoading ? <div className="text-sm text-gray-500 p-2">Loading...</div> : (
                      <table className="min-w-full text-xs">
                        <thead><tr className="border-b"><th className="py-2 pr-2">User</th><th className="py-2 pr-2">Month</th><th className="py-2 pr-2">Gross</th><th className="py-2 pr-2">Deductions</th><th className="py-2 pr-2">Net</th><th className="py-2 pr-2">File</th><th className="py-2 pr-2">Actions</th></tr></thead>
                        <tbody>
                          {slipItems.map(i => (
                            <tr key={i._id} className="border-b">
                              <td className="py-2 pr-2">{i.user}</td>
                              <td className="py-2 pr-2">{i.month}</td>
                              <td className="py-2 pr-2">{i.gross}</td>
                              <td className="py-2 pr-2">{i.deductions}</td>
                              <td className="py-2 pr-2">{i.net}</td>
                              <td className="py-2 pr-2">{i.fileUrl ? <a href={i.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open</a> : '—'}</td>
                              <td className="py-2 pr-2"><button className="text-red-600 border border-red-200 px-2 py-1 rounded" onClick={async()=>{await fetch(`${API_BASE}/api/salary-slips/${i._id}`, { method:'DELETE', headers }); await loadSlips()}}>Delete</button></td>
                            </tr>
                          ))}
                          {slipItems.length===0 && <tr><td className="py-3 text-gray-500" colSpan={7}>No entries</td></tr>}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>
              )}
              {adminTab === 'supervisor-assignment' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-base font-semibold text-primary">User Role Assignment</h3>
                      <p className="text-sm text-gray-600">View and edit user roles. Data derived from Users.</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>downloadRolesCSV()} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Download CSV</button>
                    </div>
                  </div>

                  {/* Donut charts */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Donut value={roleCounts.working||0} label="Working Employees" />
                    <Donut value={roleCounts.executive||0} label="Executive Users" />
                    <Donut value={roleCounts.staff||0} label="Staff Users" />
                    <Donut value={roleCounts.vendor||0} label="Vendor Users" />
                    <Donut value={roleCounts.driver||0} label="Drivers" />
                  </div>

                  {/* Users table */}
                  <div className="overflow-x-auto border rounded-md">
                    {empLoading ? <div className="p-3 text-sm text-gray-500">Loading...</div> : (
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="py-2 px-2 text-left">Name</th>
                            <th className="py-2 px-2 text-left">Emp ID</th>
                            <th className="py-2 px-2 text-left">Email</th>
                            <th className="py-2 px-2 text-left">Phone</th>
                            <th className="py-2 px-2 text-left">Role</th>
                            <th className="py-2 px-2 text-left">Role Name</th>
                            <th className="py-2 px-2 text-left">Status</th>
                            <th className="py-2 px-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {empRows.map(u => (
                            <tr key={u._id} className="border-b">
                              <td className="py-2 px-2">{u.firstName || u.name || '—'} {u.lastName||''}</td>
                              <td className="py-2 px-2">{u.employeeId || '—'}</td>
                              <td className="py-2 px-2">{u.email || '—'}</td>
                              <td className="py-2 px-2">{u.phone || '—'}</td>
                              <td className="py-2 px-2">{u.role || '—'}</td>
                              <td className="py-2 px-2">{u.roleName || '—'}</td>
                              <td className="py-2 px-2">{u.status || '—'}</td>
                              <td className="py-2 px-2">{hasPermission?.('users:write') && (<button className="text-primary underline" onClick={()=>openRoleEditor(u)}>Edit</button>)}</td>
                            </tr>
                          ))}
                          {empRows.length===0 && <tr><td className="py-3 px-2 text-gray-500" colSpan={8}>No users found</td></tr>}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Edit Role modal */}
                  {openRoleEdit && (
                    <Modal title="Edit User Role" onClose={()=>setOpenRoleEdit(false)}>
                      <form className="grid grid-cols-1 md:grid-cols-3 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
                        const payload = { role: roleForm.role||undefined, roleName: roleForm.roleName||undefined, permissions: roleForm.permissionsText?roleForm.permissionsText.split(',').map(s=>s.trim()).filter(Boolean):undefined }
                        const res = await fetch(`${API_BASE}/api/admin/users/${roleForm.id}`, { method:'PUT', headers, body: JSON.stringify(payload) })
                        if (!res.ok) throw new Error('Failed')
                        setOpenRoleEdit(false); await loadEmployees()
                      } catch(err){ alert(err.message) } }}>
                        <label className="text-sm">
                          <div className="text-primary mb-1">Role</div>
                          <select className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg" value={roleForm.role} onChange={e=>setRoleForm({...roleForm,role:e.target.value})}>
                            <option value="">(none)</option>
                            <option value="executive">executive</option>
                            <option value="staff">staff</option>
                            <option value="vendor">vendor</option>
                            <option value="driver">driver</option>
                            <option value="admin">admin</option>
                            <option value="customer">customer</option>
                          </select>
                        </label>
                        <Input label="Role Name" value={roleForm.roleName} onChange={v=>setRoleForm({...roleForm,roleName:v})} />
                        <label className="text-sm md:col-span-3">
                          <div className="text-primary mb-1">Permissions (comma separated)</div>
                          <textarea className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg min-h-[80px]" value={roleForm.permissionsText} onChange={e=>setRoleForm({...roleForm,permissionsText:e.target.value})} />
                        </label>
                        <div className="md:col-span-3 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenRoleEdit(false)}>Cancel</Button><Button type="submit" primary>Save</Button></div>
                      </form>
                    </Modal>
                  )}
                </section>
              )}
            </div>
          </div>
        )}

        {mainTab === 'customer' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-primary">Customer Zone</h3>
            <Tabs
              tabs={[{ value: 'customers', label: 'Customers' }]}
              value={customerTab}
              onChange={setCustomerTab}
            />
            <div className="pt-2">
              {customerTab === 'customers' && (
                <section className="space-y-3">
                  <Customers />
                </section>
              )}
            </div>
          </div>
        )}

        {mainTab === 'staff' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-primary">Staff Zone</h3>
            <Tabs
              tabs={[{ value: 'drivers', label: 'Drivers' }]}
              value={staffTab}
              onChange={setStaffTab}
            />
            <div className="pt-2">
              {staffTab === 'drivers' && (
                <section className="space-y-3">
                  <Drivers />
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
