import React from 'react'
import Card from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">My Profile</h2>
            <p className="text-xs text-gray-500">View your account details</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm"><span className="font-medium text-primary">Email:</span> {user?.email || '—'}</div>
            <div className="text-sm"><span className="font-medium text-primary">Role:</span> {user?.role || '—'}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
