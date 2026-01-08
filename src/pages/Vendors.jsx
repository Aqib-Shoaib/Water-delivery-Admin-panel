import React from 'react'
import { useAuth } from '../context/AuthContext'
import VendorsManager from '../components/finance/VendorsManager.jsx'

export default function Vendors() {
  const { hasPermission } = useAuth()

  // Check if user has permission to access vendors
  if (!hasPermission('vendors:read')) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-gray-600 mt-2">You don't have permission to access vendor management.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Vendor Management</h1>
        <p className="text-gray-500 mt-1">Manage your vendors and supplier information</p>
      </div>
      
      <VendorsManager />
    </div>
  )
}
