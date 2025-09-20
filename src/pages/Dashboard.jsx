import React, { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Dashboard() {
  const [health, setHealth] = useState({ status: 'unknown', timestamp: null, error: null })

  useEffect(() => {
    let cancelled = false
    async function checkHealth() {
      try {
        const res = await fetch(`${API_BASE}/api/health`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) setHealth({ status: data.status || 'ok', timestamp: data.timestamp, error: null })
      } catch (err) {
        if (!cancelled) setHealth({ status: 'down', timestamp: null, error: err.message })
      }
    }
    checkHealth()
    const id = setInterval(checkHealth, 15000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Orders Today</div>
          <div className="text-2xl font-semibold">—</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Active Drivers</div>
          <div className="text-2xl font-semibold">—</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Products</div>
          <div className="text-2xl font-semibold">—</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Regions</div>
          <div className="text-2xl font-semibold">—</div>
        </Card>
      </div>

      <Card className="mt-8 p-4">
        <h2 className="text-lg font-medium mb-2">System</h2>
        <div className="text-sm text-gray-600">Backend base URL: <code className="text-gray-800">{API_BASE}</code></div>
        <div className="mt-2">
          <Badge variant={health.status === 'ok' ? 'success' : health.status === 'down' ? 'danger' : 'default'}>
            {health.status}
          </Badge>
        </div>
        {health.timestamp && (
          <div className="text-sm text-gray-600 mt-1">Last checked: {new Date(health.timestamp).toLocaleString()}</div>
        )}
        {health.error && (
          <div className="text-sm text-red-600 mt-1">Error: {health.error}</div>
        )}
      </Card>
    </div>
  )
}
