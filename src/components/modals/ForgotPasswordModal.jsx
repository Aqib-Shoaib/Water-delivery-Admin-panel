import React, { useEffect, useState } from 'react'

export default function ForgotPasswordModal({ open, onClose, emailDefault, apiBase }) {
  const [email, setEmail] = useState(emailDefault || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => { setEmail(emailDefault || '') }, [emailDefault])

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDone(false)
    try {
      const res = await fetch(`${apiBase}/api/password-resets/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-primary">Forgot Password</h3>
        <p className="text-sm text-gray-600 mt-1">Enter your account email to receive a password reset link.</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Email</label>
            <input
              type="email"
              className="form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-medium-blue"
              placeholder="you@example.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {done && <p className="text-sm text-green-600">If an account exists for this email, a reset link has been sent.</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Close</button>
            <button type="submit" disabled={loading} className="login-btn bg-primary text-white px-4 py-2 rounded-md">
              {loading ? 'Sending...' : 'Send link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
