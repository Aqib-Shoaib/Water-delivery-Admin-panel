import React, { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  const login = async ({ email, password }) => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) throw new Error('Invalid credentials')
    const data = await res.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function refreshMe() {
    if (!token) return
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.user) {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
    }
  }

  async function updateMe(updates) {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data?.user) {
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data?.user
  }

  const hasRole = (role) => {
    const r = (user?.role || '').toLowerCase()
    return r === role.toLowerCase()
  }
  const hasPermission = (perm) => {
    if (hasRole('superadmin')) return true
    const perms = Array.isArray(user?.permissions) ? user.permissions : []
    return perms.map(p => String(p).toLowerCase()).includes(String(perm).toLowerCase())
  }

  const value = useMemo(() => ({ token, user, login, logout, isAuthed: !!token, hasRole, hasPermission, refreshMe, updateMe }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
   [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

//eslint-disable-next-line
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
