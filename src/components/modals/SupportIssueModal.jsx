import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function SupportIssueModal({ open, onClose, apiBase }) {
  const { token } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  if (!open) return null

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDone(false)
    try {
      const res = await fetch(`${apiBase}/api/support-issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), priority })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setDone(true)
      setTitle('')
      setDescription('')
      setPriority('medium')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">Contact Support</h3>
        <p className="text-sm text-gray-600 mt-1">Create an issue for the admin team to review.</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Title</label>
            <input
              className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue"
              placeholder="Short summary"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Description</label>
            <textarea
              className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue min-h-28"
              placeholder="Describe the problem or request..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Priority</label>
            <select
              className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue"
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {done && <p className="text-sm text-green-600">Issue submitted successfully.</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Close</button>
            <button type="submit" disabled={loading} className="login-btn bg-primary text-white px-4 py-2 rounded-md">
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
