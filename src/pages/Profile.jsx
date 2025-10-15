import React, { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { user, token, refreshMe, updateMe } = useAuth()
  const [form, setForm] = useState({
    name: '',
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    gender: '',
    education: '',
    address: '',
    // superadmin-only extended fields
    employeeId: '',
    cnic: '',
    cnicOrPassport: '',
    jobTitle: '',
    joiningDate: '',
    designation: '',
    duties: '',
    companyPhone: '',
    companyEmail: '',
    companyBelongings: '',
    remarks: '',
    department: '',
    employeeType: '',
    shiftTimings: '',
    workLocation: '',
    basicSalary: '',
    allowances: '',
    deductions: '',
    status: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // HR action modals state (moved from Zones/Divisions)
  const [openLoan, setOpenLoan] = useState(false)
  const [openLeaveSalary, setOpenLeaveSalary] = useState(false)
  const [openResignation, setOpenResignation] = useState(false)
  const [loanForm, setLoanForm] = useState({ amount:'', date:'', note:'' })
  const [leaveForm, setLeaveForm] = useState({ amount:'', date:'', note:'' })
  const [resignationForm, setResignationForm] = useState({ date:'', reason:'', finalSettlement:'', fileUrl:'' })

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

  useEffect(() => { refreshMe?.() }, [refreshMe])

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      dob: user.dob ? new Date(user.dob).toISOString().slice(0,10) : '',
      gender: user.gender || '',
      education: user.education || '',
      address: user.address || '',
      employeeId: user.employeeId || '',
      cnic: user.cnic || '',
      cnicOrPassport: user.cnicOrPassport || '',
      jobTitle: user.jobTitle || '',
      joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().slice(0,10) : '',
      designation: user.designation || '',
      duties: user.duties || '',
      companyPhone: user.companyPhone || '',
      companyEmail: user.companyEmail || '',
      companyBelongings: user.companyBelongings || '',
      remarks: user.remarks || '',
      department: user.department || '',
      employeeType: user.employeeType || '',
      shiftTimings: user.shiftTimings || '',
      workLocation: user.workLocation || '',
      basicSalary: user.basicSalary ?? '',
      allowances: user.allowances ?? '',
      deductions: user.deductions ?? '',
      status: user.status || ''
    })
  }, [user])

  const readOnly = useMemo(() => ({
    email: user?.email || '',
    role: user?.role || '',
    roleName: user?.roleName || '',
    employeeId: user?.employeeId || '',
    cnic: user?.cnic || '',
    department: user?.department || '',
    status: user?.status || '',
    joiningDate: user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : '',
    designation: user?.designation || '',
    jobTitle: user?.jobTitle || '',
    companyEmail: user?.companyEmail || '',
    companyPhone: user?.companyPhone || ''
  }), [user])

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        name: form.name?.trim?.(),
        firstName: form.firstName?.trim?.(),
        lastName: form.lastName?.trim?.(),
        phone: form.phone?.trim?.(),
        dob: form.dob || undefined,
        gender: form.gender || undefined,
        education: form.education?.trim?.(),
        address: form.address?.trim?.()
      }
      if (user?.role === 'superadmin') {
        Object.assign(payload, {
          employeeId: form.employeeId?.trim?.() || undefined,
          cnic: form.cnic?.trim?.() || undefined,
          cnicOrPassport: form.cnicOrPassport?.trim?.() || undefined,
          jobTitle: form.jobTitle?.trim?.() || undefined,
          joiningDate: form.joiningDate || undefined,
          designation: form.designation?.trim?.() || undefined,
          duties: form.duties?.trim?.() || undefined,
          companyPhone: form.companyPhone?.trim?.() || undefined,
          companyEmail: form.companyEmail?.trim?.() || undefined,
          companyBelongings: form.companyBelongings?.trim?.() || undefined,
          remarks: form.remarks?.trim?.() || undefined,
          department: form.department?.trim?.() || undefined,
          employeeType: form.employeeType?.trim?.() || undefined,
          shiftTimings: form.shiftTimings?.trim?.() || undefined,
          workLocation: form.workLocation?.trim?.() || undefined,
          basicSalary: form.basicSalary === '' ? undefined : Number(form.basicSalary),
          allowances: form.allowances === '' ? undefined : Number(form.allowances),
          deductions: form.deductions === '' ? undefined : Number(form.deductions),
          status: form.status || undefined,
        })
      }
      await updateMe(payload)
      setSuccess('Profile updated')
    } catch (err) {
      setError(err?.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-semibold text-primary">My Profile</h2>
            <p className="text-xs text-gray-500">View and edit your account details</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setOpenLoan(true)} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Loan Form</button>
            <button onClick={()=>setOpenLeaveSalary(true)} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Leave Salary</button>
            <button onClick={()=>setOpenResignation(true)} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Resignation</button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
            <input type="date" className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="">—</option>
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="other">other</option>
            </select>
          </div>
          <Input label="Education" value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} />
          <div className="md:col-span-2">
            <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>

          {user?.role === 'superadmin' && (
            <>
              <div className="md:col-span-2 pt-2">
                <h3 className="text-md font-semibold text-primary">Employee & Company Details</h3>
              </div>
              <Input label="Employee ID" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} />
              <Input label="CNIC" value={form.cnic} onChange={e => setForm({ ...form, cnic: e.target.value })} />
              <Input label="CNIC/Passport" value={form.cnicOrPassport} onChange={e => setForm({ ...form, cnicOrPassport: e.target.value })} />
              <Input label="Job Title" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                <input type="date" className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })} />
              </div>
              <Input label="Designation" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
              <Input label="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="">—</option>
                  <option value="working">working</option>
                  <option value="terminated">terminated</option>
                  <option value="waiting">waiting</option>
                </select>
              </div>
              <Input label="Duties / Assigned Role" value={form.duties} onChange={e => setForm({ ...form, duties: e.target.value })} />
              <Input label="Company Phone" value={form.companyPhone} onChange={e => setForm({ ...form, companyPhone: e.target.value })} />
              <Input type="email" label="Company Email" value={form.companyEmail} onChange={e => setForm({ ...form, companyEmail: e.target.value })} />
              <Input label="Company Belongings" value={form.companyBelongings} onChange={e => setForm({ ...form, companyBelongings: e.target.value })} />
              <Input label="Remarks" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} className="md:col-span-2" />
              <Input label="Employee Type" value={form.employeeType} onChange={e => setForm({ ...form, employeeType: e.target.value })} />
              <Input label="Shift Timings" value={form.shiftTimings} onChange={e => setForm({ ...form, shiftTimings: e.target.value })} />
              <Input label="Work Location" value={form.workLocation} onChange={e => setForm({ ...form, workLocation: e.target.value })} />
              <Input type="number" label="Basic Salary" value={form.basicSalary} onChange={e => setForm({ ...form, basicSalary: e.target.value })} />
              <Input type="number" label="Allowances" value={form.allowances} onChange={e => setForm({ ...form, allowances: e.target.value })} />
              <Input type="number" label="Deductions" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} />
            </>
          )}

          {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}
          {success && <div className="md:col-span-2 text-sm text-green-600">{success}</div>}
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </form>
      </Card>

      

      {/* Loan Modal */}
      {openLoan && (
        <Modal title="Create Loan" onClose={()=>setOpenLoan(false)}>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
            const payload = { user: user?._id, amount: Number(loanForm.amount||0), date: loanForm.date, note: loanForm.note, type: 'loan' }
            const res = await fetch(`${API_BASE}/api/payments`, { method:'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
            if(!res.ok) throw new Error('Failed')
            setOpenLoan(false); setLoanForm({ amount:'', date:'', note:'' })
          } catch(err){ alert(err.message) } }}>
            <Input label="Amount" value={loanForm.amount} onChange={e=>setLoanForm({...loanForm, amount: e.target.value})} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" value={loanForm.date} onChange={e=>setLoanForm({...loanForm, date: e.target.value})} />
            </div>
            <Input className="md:col-span-3" label="Note" value={loanForm.note} onChange={e=>setLoanForm({...loanForm, note: e.target.value})} />
            <div className="md:col-span-3 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenLoan(false)}>Cancel</Button><Button type="submit">Create</Button></div>
          </form>
        </Modal>
      )}

      {/* Leave Salary Modal */}
      {openLeaveSalary && (
        <Modal title="Create Leave Salary" onClose={()=>setOpenLeaveSalary(false)}>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
            const payload = { user: user?._id, amount: Number(leaveForm.amount||0), date: leaveForm.date, note: leaveForm.note, type: 'leave-salary' }
            const res = await fetch(`${API_BASE}/api/payments`, { method:'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
            if(!res.ok) throw new Error('Failed')
            setOpenLeaveSalary(false); setLeaveForm({ amount:'', date:'', note:'' })
          } catch(err){ alert(err.message) } }}>
            <Input label="Amount" value={leaveForm.amount} onChange={e=>setLeaveForm({...leaveForm, amount: e.target.value})} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" value={leaveForm.date} onChange={e=>setLeaveForm({...leaveForm, date: e.target.value})} />
            </div>
            <Input className="md:col-span-3" label="Note" value={leaveForm.note} onChange={e=>setLeaveForm({...leaveForm, note: e.target.value})} />
            <div className="md:col-span-3 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenLeaveSalary(false)}>Cancel</Button><Button type="submit">Create</Button></div>
          </form>
        </Modal>
      )}

      {/* Resignation Modal */}
      {openResignation && (
        <Modal title="Record Resignation" onClose={()=>setOpenResignation(false)}>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-2" onSubmit={async(e)=>{ e.preventDefault(); try {
            const payload = { user: user?._id, date: resignationForm.date, reason: resignationForm.reason, finalSettlement: Number(resignationForm.finalSettlement||0), fileUrl: resignationForm.fileUrl }
            const res = await fetch(`${API_BASE}/api/resignations`, { method:'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
            if(!res.ok) throw new Error('Failed')
            setOpenResignation(false); setResignationForm({ date:'', reason:'', finalSettlement:'', fileUrl:'' })
          } catch(err){ alert(err.message) } }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500" value={resignationForm.date} onChange={e=>setResignationForm({...resignationForm, date: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 min-h-[90px]" value={resignationForm.reason} onChange={e=>setResignationForm({...resignationForm, reason: e.target.value})} />
            </div>
            <Input label="Final Settlement" value={resignationForm.finalSettlement} onChange={e=>setResignationForm({...resignationForm, finalSettlement: e.target.value})} />
            <Input label="File URL" value={resignationForm.fileUrl} onChange={e=>setResignationForm({...resignationForm, fileUrl: e.target.value})} />
            <div className="md:col-span-2 flex justify-end gap-2"><Button type="button" onClick={()=>setOpenResignation(false)}>Cancel</Button><Button type="submit">Save</Button></div>
          </form>
        </Modal>
      )}

      {user?.role !== 'superadmin' && (
        <Card className="p-4">
          <h3 className="text-md font-semibold text-primary">Other details</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Detail label="Email" value={readOnly.email} />
            <Detail label="Role" value={readOnly.role} />
            <Detail label="Custom Role" value={readOnly.roleName} />
            <Detail label="Employee ID" value={readOnly.employeeId} />
            <Detail label="CNIC" value={readOnly.cnic} />
            <Detail label="Department" value={readOnly.department} />
            <Detail label="Status" value={readOnly.status} />
            <Detail label="Joining Date" value={readOnly.joiningDate} />
            <Detail label="Designation" value={readOnly.designation} />
            <Detail label="Job Title" value={readOnly.jobTitle} />
            <Detail label="Company Email" value={readOnly.companyEmail} />
            <Detail label="Company Phone" value={readOnly.companyPhone} />
          </div>
        </Card>
      )}
    </div>
  )
}

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

function Detail({ label, value }) {
  return (
    <div className="text-sm">
      <div className="font-medium text-primary">{label}</div>
      <div className="text-gray-700">{value || '—'}</div>
    </div>
  )
}
