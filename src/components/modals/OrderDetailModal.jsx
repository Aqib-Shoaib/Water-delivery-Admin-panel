import React from 'react'

export default function OrderDetailModal({ order, onClose, open = true }) {
  if (!open || !order) return null

  const assignee = order.assignedDriver || {}
  const approver = order.approvedBy || {}
  const customer = order.customer || {}
  const items = Array.isArray(order.items) ? order.items : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">Order Details</h3>
            <p className="text-xs text-gray-500">View order, assignee, customer and approver information</p>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Close</button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-sm text-gray-800">
            <div>
              <div className="font-semibold text-primary">Assignee</div>
              <div><span className="text-gray-500">Name:</span> {assignee.name || '—'}</div>
              <div><span className="text-gray-500">ID:</span> {assignee.employeeId || assignee._id || '—'}</div>
              <div><span className="text-gray-500">Designation:</span> {assignee.designation || '—'}</div>
              <div><span className="text-gray-500">Department:</span> {assignee.department || '—'}</div>
            </div>
            <div>
              <div className="font-semibold text-primary">Order</div>
              <div><span className="text-gray-500">Status:</span> {order.status || '—'}</div>
              <div><span className="text-gray-500">Payment Method:</span> {order.paymentMethod || '—'}</div>
              <div><span className="text-gray-500">Address:</span> {order.address || '—'}</div>
              <div><span className="text-gray-500">Remarks:</span> {order.remarks || order.notes || '—'}</div>
            </div>
            <div>
              <div className="font-semibold text-primary">Customer</div>
              <div><span className="text-gray-500">Name:</span> {customer.name || '—'}</div>
              <div><span className="text-gray-500">Customer ID:</span> {customer._id || '—'}</div>
              <div><span className="text-gray-500">Mobile:</span> {customer.phone || '—'}</div>
              <div><span className="text-gray-500">Address:</span> {customer.address || '—'}</div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-800">
            <div>
              <div className="font-semibold text-primary">Products</div>
              {items.length ? (
                <ul className="list-disc pl-5 space-y-1">
                  {items.map((it, idx) => (
                    <li key={idx}>
                      <div className="font-medium">{it.product?.name || '—'} × {it.quantity}</div>
                      <div className="text-xs text-gray-600">Product Code: {it.product?.code || '—'}</div>
                      <div className="text-xs text-gray-600">Type: {it.product?.type || '—'} | Condition: {it.product?.condition || '—'}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">No items</div>
              )}
            </div>

            <div>
              <div className="font-semibold text-primary">Approver</div>
              <div><span className="text-gray-500">Approved By:</span> {approver.name || '—'}</div>
              <div><span className="text-gray-500">Designation:</span> {approver.designation || approver.roleName || '—'}</div>
              <div><span className="text-gray-500">Company Mobile:</span> {approver.companyPhone || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
