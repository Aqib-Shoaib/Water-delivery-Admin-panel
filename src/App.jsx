import React from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products.jsx'
import Orders from './pages/Orders.jsx'
import Drivers from './pages/Drivers.jsx'
import Regions from './pages/Regions.jsx'
import Login from './pages/Login.jsx'
import { useAuth } from './context/AuthContext.jsx'

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
  const { isAuthed, user, logout } = useAuth()
  const navLinkCls = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-semibold">Water Delivery Admin</h1>
              <nav className="flex items-center gap-2">
                {isAuthed ? (
                  <>
                    <NavLink to="/" className={navLinkCls} end>Dashboard</NavLink>
                    <NavLink to="/products" className={navLinkCls}>Products</NavLink>
                    <NavLink to="/orders" className={navLinkCls}>Orders</NavLink>
                    <NavLink to="/drivers" className={navLinkCls}>Drivers</NavLink>
                    <NavLink to="/regions" className={navLinkCls}>Regions</NavLink>
                    <span className="text-sm text-gray-600 ml-2">{user?.email} ({user?.role})</span>
                    <button onClick={logout} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Logout</button>
                  </>
                ) : (
                  <NavLink to="/login" className={navLinkCls}>Login</NavLink>
                )}
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
            <Route path="/products" element={<RequireAdmin><Products /></RequireAdmin>} />
            <Route path="/orders" element={<RequireAdmin><Orders /></RequireAdmin>} />
            <Route path="/drivers" element={<RequireAdmin><Drivers /></RequireAdmin>} />
            <Route path="/regions" element={<RequireAdmin><Regions /></RequireAdmin>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App