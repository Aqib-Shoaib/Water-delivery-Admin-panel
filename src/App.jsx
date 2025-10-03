import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products.jsx'
import Orders from './pages/Orders.jsx'
import Drivers from './pages/Drivers.jsx'
import Customers from './pages/Customers.jsx'
import Settings from './pages/Settings.jsx'
import Deals from './pages/Deals.jsx'
import Reminders from './pages/Reminders.jsx'
import HealthReminders from './pages/HealthReminders.jsx'
import Login from './pages/Login.jsx'
import Users from './pages/Users.jsx'
import Profile from './pages/Profile.jsx'
import AuditLogs from './pages/AuditLogs.jsx'
import Invoices from './pages/Invoices.jsx'
import Docs from './pages/Docs.jsx'
import Divisions from './pages/Divisions.jsx'
import Assets from './pages/Assets.jsx'
import History from './pages/History.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Invite from './pages/Invite.jsx'
import { useAuth } from './context/AuthContext.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'

function RequireAuth({ children }) {
  const { isAuthed } = useAuth()
  if (!isAuthed) return <Login />
  return children
}

function RequireAdmin({ children }) {
  const { isAuthed, user, logout } = useAuth()
  if (!isAuthed) return <Login />
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-semibold">Not authorized</h2>
        <p className="text-gray-600 mt-2">You must be an admin to access this page.</p>
        <button onClick={logout} className="mt-4 px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Logout</button>
      </div>
    )
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAdmin><AdminLayout><Dashboard /></AdminLayout></RequireAdmin>} />
        <Route path="/products" element={<RequireAdmin><AdminLayout><Products /></AdminLayout></RequireAdmin>} />
        <Route path="/users" element={<RequireAdmin><AdminLayout><Users /></AdminLayout></RequireAdmin>} />
        <Route path="/orders" element={<RequireAdmin><AdminLayout><Orders /></AdminLayout></RequireAdmin>} />
        <Route path="/assets" element={<RequireAdmin><AdminLayout><Assets /></AdminLayout></RequireAdmin>} />
        <Route path="/history" element={<RequireAdmin><AdminLayout><History /></AdminLayout></RequireAdmin>} />
        <Route path="/about" element={<RequireAdmin><AdminLayout><About /></AdminLayout></RequireAdmin>} />
        <Route path="/contact" element={<RequireAdmin><AdminLayout><Contact /></AdminLayout></RequireAdmin>} />
        <Route path="/invite" element={<RequireAdmin><AdminLayout><Invite /></AdminLayout></RequireAdmin>} />
        <Route path="/drivers" element={<RequireAdmin><AdminLayout><Drivers /></AdminLayout></RequireAdmin>} />
        <Route path="/customers" element={<RequireAdmin><AdminLayout><Customers /></AdminLayout></RequireAdmin>} />
        <Route path="/settings" element={<RequireAdmin><AdminLayout><Settings /></AdminLayout></RequireAdmin>} />
        <Route path="/profile" element={<RequireAdmin><AdminLayout><Profile /></AdminLayout></RequireAdmin>} />
        <Route path="/deals" element={<RequireAdmin><AdminLayout><Deals /></AdminLayout></RequireAdmin>} />
        <Route path="/reminders" element={<RequireAdmin><AdminLayout><Reminders /></AdminLayout></RequireAdmin>} />
        <Route path="/health-reminders" element={<RequireAdmin><AdminLayout><HealthReminders /></AdminLayout></RequireAdmin>} />
        <Route path="/audit-logs" element={<RequireAdmin><AdminLayout><AuditLogs /></AdminLayout></RequireAdmin>} />
        <Route path="/invoices" element={<RequireAdmin><AdminLayout><Invoices /></AdminLayout></RequireAdmin>} />
        <Route path="/docs" element={<RequireAdmin><AdminLayout><Docs /></AdminLayout></RequireAdmin>} />
        <Route path="/zones" element={<RequireAdmin><AdminLayout><Divisions /></AdminLayout></RequireAdmin>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App