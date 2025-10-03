import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function AddUserModal({ open, onClose, onCreated, apiBase }) {
  const { token } = useAuth()
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'customer', roleName: '', phone: '', cnic: '', permissions: [],
    firstName: '', lastName: '', employeeId: '', dob: '', cnicOrPassport: '', jobTitle: '', gender: '', joiningDate: '', designation: '', address: '', duties: '', companyPhone: '', companyEmail: '', companyBelongings: '', remarks: '',
    education: '', department: '', employeeType: '', shiftTimings: '', workLocation: '', basicSalary: '', allowances: '', deductions: '', status: 'working'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availablePerms, setAvailablePerms] = useState([])
  const [availableRoles, setAvailableRoles] = useState(['admin','customer','driver'])
  const [selectAll, setSelectAll] = useState(false)

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  useEffect(() => {
    async function loadPermissions() {
      try {
        const res = await fetch(`${apiBase || API_BASE}/api/permissions`, { headers })
        if (res.ok) {
          const data = await res.json()
          setAvailablePerms(data.permissions || [])
          setAvailableRoles(data.roles?.filter(Boolean) || ['admin','customer','driver'])
        }
      } catch { /* ignore */ }
    }
    if (open) {
      loadPermissions();
    }
  }, [open])

  if (!open) return null

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        roleName: form.roleName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        cnic: form.cnic.trim() || undefined,
        permissions: Array.isArray(form.permissions) ? form.permissions : [],
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        employeeId: form.employeeId.trim() || undefined,
        dob: form.dob || undefined,
        cnicOrPassport: form.cnicOrPassport.trim() || undefined,
        jobTitle: form.jobTitle.trim() || undefined,
        gender: form.gender || undefined,
        joiningDate: form.joiningDate || undefined,
        designation: form.designation.trim() || undefined,
        address: form.address.trim() || undefined,
        duties: form.duties.trim() || undefined,
        companyPhone: form.companyPhone.trim() || undefined,
        companyEmail: form.companyEmail.trim() || undefined,
        companyBelongings: form.companyBelongings.trim() || undefined,
        remarks: form.remarks.trim() || undefined,
        education: form.education.trim() || undefined,
        department: form.department.trim() || undefined,
        employeeType: form.employeeType.trim() || undefined,
        shiftTimings: form.shiftTimings.trim() || undefined,
        workLocation: form.workLocation.trim() || undefined,
        basicSalary: form.basicSalary !== '' ? Number(form.basicSalary) : undefined,
        allowances: form.allowances !== '' ? Number(form.allowances) : undefined,
        deductions: form.deductions !== '' ? Number(form.deductions) : undefined,
        status: form.status || undefined,
      }
      const res = await fetch(`${apiBase}/api/admin/users`, { method: 'POST', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setForm({ name: '', email: '', password: '', role: 'customer', roleName: '', phone: '', cnic: '', permissions: [], firstName: '', lastName: '', employeeId: '', dob: '', cnicOrPassport: '', jobTitle: '', gender: '', joiningDate: '', designation: '', address: '', duties: '', companyPhone: '', companyEmail: '', companyBelongings: '', remarks: '', education: '', department: '', employeeType: '', shiftTimings: '', workLocation: '', basicSalary: '', allowances: '', deductions: '', status: 'working' })
      onCreated && onCreated()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">Add User</h3>
        <p className="text-sm text-gray-600 mt-1">Create a new user account.</p>

        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">First Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Last Name</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Email</label>
            <input type="email" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">CNIC</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="e.g. 12345-1234567-1" value={form.cnic} onChange={e => setForm({ ...form, cnic: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">CNIC/Passport</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.cnicOrPassport} onChange={e => setForm({ ...form, cnicOrPassport: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Password</label>
            <input type="password" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Phone</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Employee ID</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">D.O.B.</label>
            <input type="date" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Role</label>
            <select className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Custom Role Name (optional)</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="e.g. Inventory Manager" value={form.roleName} onChange={e => setForm({ ...form, roleName: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Job Title</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Gender</label>
            <select className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="">—</option>
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="other">other</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Joining Date</label>
            <input type="date" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Status</label>
            <select className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="working">working</option>
              <option value="waiting">waiting</option>
              <option value="terminated">terminated</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Designation</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Education</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Department</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Employee Type</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="e.g. Full-time / Part-time / Contract" value={form.employeeType} onChange={e => setForm({ ...form, employeeType: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Shift Timings</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" placeholder="e.g. 9 AM - 6 PM" value={form.shiftTimings} onChange={e => setForm({ ...form, shiftTimings: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Work Location</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.workLocation} onChange={e => setForm({ ...form, workLocation: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Basic Salary (per month)</label>
            <input type="number" step="0.01" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.basicSalary} onChange={e => setForm({ ...form, basicSalary: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Allowances</label>
            <input type="number" step="0.01" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.allowances} onChange={e => setForm({ ...form, allowances: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Deductions</label>
            <input type="number" step="0.01" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Resi. Address</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Duties / Assigned Role</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.duties} onChange={e => setForm({ ...form, duties: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Company Mobile No.</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.companyPhone} onChange={e => setForm({ ...form, companyPhone: e.target.value })} />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-primary mb-1">Company Email ID</label>
            <input type="email" className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.companyEmail} onChange={e => setForm({ ...form, companyEmail: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Company Other Belongings</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.companyBelongings} onChange={e => setForm({ ...form, companyBelongings: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Remarks</label>
            <input className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-primary">Permissions</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectAll} onChange={(e) => {
                const checked = e.target.checked; setSelectAll(checked);
                setForm({ ...form, permissions: checked ? [...availablePerms] : [] })
              }} /> Select all</label>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded p-2">
              {availablePerms.map(p => (
                <label key={p} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(p)}
                    onChange={(e) => {
                      if (e.target.checked) setForm({ ...form, permissions: [...form.permissions, p] })
                      else setForm({ ...form, permissions: form.permissions.filter(x => x !== p) })
                    }}
                  />
                  <span>{p}</span>
                </label>
              ))}
              {availablePerms.length === 0 && <div className="text-xs text-gray-500">No permissions loaded</div>}
            </div>
          </div>
          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="login-btn bg-primary text-white px-4 py-2 rounded-md">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
