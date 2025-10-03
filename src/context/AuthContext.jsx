import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

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

  const hasRole = (role) => {
    const r = (user?.role || '').toLowerCase()
    return r === role.toLowerCase()
  }
  const hasPermission = (perm) => {
    if (hasRole('admin')) return true
    const perms = Array.isArray(user?.permissions) ? user.permissions : []
    return perms.map(p => String(p).toLowerCase()).includes(String(perm).toLowerCase())
  }

  const value = useMemo(() => ({ token, user, login, logout, isAuthed: !!token, hasRole, hasPermission }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
