import React from 'react'

export default function ConfirmModal({ open, title = 'Confirm', description, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onCancel} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">{cancelText}</button>
          <button type="button" onClick={onConfirm} className="login-btn bg-primary text-white px-4 py-2 rounded-md">{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
