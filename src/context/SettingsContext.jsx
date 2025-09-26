import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const SettingsContext = createContext({ settings: null, loading: true, error: '', refresh: () => {} })
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export function SettingsProvider({ children }) {
  const { token } = useAuth()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/site-settings`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setSettings(data)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  useEffect(() => { if (token) refresh() }, [token])

  const value = useMemo(() => ({ settings, loading, error, refresh, setSettings }), [settings, loading, error])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
