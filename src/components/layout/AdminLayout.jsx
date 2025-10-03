import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import ConfirmModal from '../modals/ConfirmModal.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'
import NotificationsContainer from '../ui/NotificationsContainer.jsx'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function Sidebar({ open, onClose, settings }) {
  const { user, hasPermission } = useAuth()
  const navCls = ({ isActive }) =>
    `nav-item flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      isActive ? 'bg-light-blue text-primary border-r-4 border-medium-blue' : 'text-gray-600 hover:bg-blue-50'
    }`

  const initials = (user?.email || 'AD').slice(0, 2).toUpperCase()

  return (
    <div className={`w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 fixed inset-y-0 left-0 md:static ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:h-screen overflow-y-auto`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white" />
          ) : (
            <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-primary">{settings?.siteName || 'AdminPanel'}</h2>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
          <button className="ml-auto md:hidden p-2 rounded hover:bg-gray-100" onClick={onClose} aria-label="Close sidebar">✕</button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 pb-10">
        <NavLink to="/" end className={navCls}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
          </svg>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/users" className={navCls}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span>Users</span>
          <div className="notification-dot" />
        </NavLink>
        <NavLink to="/orders" className={navCls}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Orders</span>
        </NavLink>
        {hasPermission && hasPermission('assets:read') && (
          <NavLink to="/assets" className={navCls}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l9-4 9 4-9 4-9-4m0 6l9 4 9-4" />
            </svg>
            <span>Asset Management</span>
          </NavLink>
        )}
        {hasPermission && hasPermission('analytics:read') && (
          <NavLink to="/history" className={navCls}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3v10H3m8 0l4 4 8-8" />
            </svg>
            <span>History</span>
          </NavLink>
        )}
        {hasPermission && hasPermission('settings:write') && (
          <NavLink to="/about" className={navCls}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <span>About</span>
          </NavLink>
        )}
        {hasPermission && hasPermission('settings:write') && (
          <NavLink to="/contact" className={navCls}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 8a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v3z" />
            </svg>
            <span>Contact</span>
          </NavLink>
        )}
        {hasPermission && hasPermission('users:write') && (
          <NavLink to="/invite" className={navCls}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v5m0 0v5m0-5h5m-5 0H7" />
            </svg>
            <span>Invite</span>
          </NavLink>
        )}
        {false && (
          <NavLink to="/drivers" className={navCls}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>Drivers</span>
          </NavLink>
        )}
        {false && (
          <NavLink to="/customers" className={navCls}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V8H2v12h5m10 0V8m0 12H7m0 0v-2a3 3 0 013-3h4a3 3 0 013 3v2" />
            </svg>
            <span>Customers</span>
          </NavLink>
        )}
        <NavLink to="/zones" className={navCls}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4" />
          </svg>
          <span>Zones</span>
        </NavLink>
        <NavLink to="/health-reminders" className={navCls}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M12 22a10 10 0 110-20 10 10 0 010 20z" />
          </svg>
          <span>Health Reminders</span>
        </NavLink>
        <NavLink to="/audit-logs" className={navCls}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6a2 2 0 012-2h6m-6 8H5a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v2" />
          </svg>
          <span>Audit Logs</span>
        </NavLink>
        <NavLink to="/invoices" className={navCls}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6M7 8h10M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
          </svg>
          <span>Invoices</span>
        </NavLink>
      </nav>

      {/* Removed bottom user card and watermark to allow full-height scrolling */}
    </div>
  )
}

function Topbar({ onMenu, onRequestLogout, settings }) {
  const { user, token } = useAuth()
  const initials = (user?.email || 'AD').slice(0, 2).toUpperCase()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dealsOpen, setDealsOpen] = useState(false)
  const [remindersOpen, setRemindersOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deals, setDeals] = useState([])
  const [reminders, setReminders] = useState([])
  const [loadingDeals, setLoadingDeals] = useState(false)
  const [loadingReminders, setLoadingReminders] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const whatsappHref = (() => {
    const link = settings?.whatsappLink
    const phone = settings?.whatsappPhone
    if (link) return link
    if (phone) {
      const digits = String(phone).replace(/[^0-9]/g, '')
      if (digits) return `https://wa.me/${digits}`
    }
    return null
  })()

  useEffect(() => {
    async function loadDeals() {
      setLoadingDeals(true)
      try {
        const res = await fetch(`${API_BASE}/api/deals`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setDeals(data.slice(0, 5))
        }
      } finally { setLoadingDeals(false) }
    }
    async function loadReminders() {
      setLoadingReminders(true)
      try {
        const res = await fetch(`${API_BASE}/api/reminders`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setReminders(data.slice(0, 5))
        }
      } finally { setLoadingReminders(false) }
    }
    async function loadNotifications() {
      setLoadingNotifications(true)
      try {
        const res = await fetch(`${API_BASE}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.slice(0, 7))
        }
      } finally { setLoadingNotifications(false) }
    }
    if (token) {
      loadDeals()
      loadReminders()
      loadNotifications()
    }
  }, [token])
  return (
    <header className="topbar sticky top-0 z-30 px-6 py-4 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={onMenu} aria-label="Open sidebar">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back!</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-blue focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Help dropdown */}
          <div className="relative">
            <button
              className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
              title="Help"
              onClick={() => setHelpOpen(o => !o)}
            >
              Help
            </button>
            {helpOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-3 py-2 text-sm font-medium text-primary border-b">Support</div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">WhatsApp Number</div>
                      <div className="text-sm text-primary font-medium">{settings?.whatsappPhone || 'Not set'}</div>
                    </div>
                    <button
                      className="px-2 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-50"
                      onClick={async () => {
                        const num = settings?.whatsappPhone || ''
                        if (!num) return
                        try {
                          await navigator.clipboard.writeText(num)
                          setCopied(true)
                          setTimeout(() => setCopied(false), 1500)
                        } catch {}
                      }}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <a
                    href={whatsappHref || '/settings'}
                    target={whatsappHref ? '_blank' : undefined}
                    rel={whatsappHref ? 'noopener noreferrer' : undefined}
                    className={`block text-center px-3 py-2 text-sm rounded-md ${whatsappHref ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    onClick={() => setHelpOpen(false)}
                  >
                    {whatsappHref ? 'Open WhatsApp' : 'Set WhatsApp in Settings'}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Deals */}
          <div className="relative">
            <button className="relative p-2 rounded-lg hover:bg-gray-100" title="Deals" onClick={() => { setDealsOpen(o => !o); setRemindersOpen(false) }}>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
            {dealsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-3 py-2 text-sm font-medium text-primary border-b">Latest Deals</div>
                <div className="max-h-64 overflow-y-auto">
                  {loadingDeals ? (
                    <div className="p-3 text-sm text-gray-500">Loading...</div>
                  ) : deals.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No deals</div>
                  ) : (
                    deals.map(d => (
                      <div key={d._id} className="p-3 border-b last:border-b-0">
                        <div className="text-sm font-medium text-primary truncate">{d.title}</div>
                        {d.description && <div className="text-xs text-gray-600 truncate">{d.description}</div>}
                        <div className="text-[11px] text-gray-400 mt-0.5">{d.active ? 'Active' : 'Inactive'}</div>
                      </div>
                    ))
                  )}
                </div>
                <NavLink to="/deals" className={({isActive}) => `block px-3 py-2 text-sm hover:bg-gray-50 ${isActive ? 'text-primary' : 'text-gray-700'}`} onClick={() => setDealsOpen(false)}>
                  View all deals
                </NavLink>
              </div>
            )}
          </div>

          {/* Reminders */}
          <div className="relative">
            <button className="relative p-2 rounded-lg hover:bg-gray-100" title="Reminders" onClick={() => { setRemindersOpen(o => !o); setDealsOpen(false) }}>
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M12 22a10 10 0 110-20 10 10 0 010 20z" />
              </svg>
            </button>
            {remindersOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-3 py-2 text-sm font-medium text-primary border-b">Upcoming Reminders</div>
                <div className="max-h-64 overflow-y-auto">
                  {loadingReminders ? (
                    <div className="p-3 text-sm text-gray-500">Loading...</div>
                  ) : reminders.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No reminders</div>
                  ) : (
                    reminders.map(r => (
                      <div key={r._id} className="p-3 border-b last:border-b-0">
                        <div className="text-sm font-medium text-primary truncate">{r.title}</div>
                        {r.description && <div className="text-xs text-gray-600 truncate">{r.description}</div>}
                        <div className="text-[11px] text-gray-400 mt-0.5">{new Date(r.remindAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
                <NavLink to="/reminders" className={({isActive}) => `block px-3 py-2 text-sm hover:bg-gray-50 ${isActive ? 'text-primary' : 'text-gray-700'}`} onClick={() => setRemindersOpen(false)}>
                  View all reminders
                </NavLink>
              </div>
            )}
          </div>

          {/* Products shortcut */}
          <NavLink
            to="/products"
            className={({isActive}) => `inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-md border ${isActive ? 'border-medium-blue text-primary' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            title="Products"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Products</span>
          </NavLink>

          {/* Docs & Forms */}
          <NavLink
            to="/docs"
            className={({isActive}) => `inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-md border ${isActive ? 'border-medium-blue text-primary' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            title="Docs & Forms"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6M7 8h10M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
            <span>Docs & Forms</span>
          </NavLink>

          {/* Offers & Deals button */}
          <NavLink
            to="/deals"
            className={({isActive}) => `inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-md border ${isActive ? 'border-medium-blue text-primary' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            title="Offers & Deals"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Offers & Deals</span>
          </NavLink>

          {/* Reminders button */}
          <NavLink
            to="/reminders"
            className={({isActive}) => `inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-md border ${isActive ? 'border-medium-blue text-primary' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            title="Reminders"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M12 22a10 10 0 110-20 10 10 0 010 20z" />
            </svg>
            <span>Reminders</span>
          </NavLink>

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100"
              title="Notifications"
              onClick={() => { setNotificationsOpen(o => !o); setDealsOpen(false); setRemindersOpen(false); setHelpOpen(false) }}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM10.07 2.82l3.12 3.12M7.05 5.84l3.12 3.12M4.03 8.86l3.12 3.12M1.01 11.88l3.12 3.12" />
              </svg>
              {notifications?.length > 0 && (
                <span className="notification-dot absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-3 py-2 text-sm font-medium text-primary border-b">Notifications</div>
                <div className="max-h-72 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="p-3 text-sm text-gray-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} className="p-3 border-b last:border-b-0">
                        <div className="text-sm font-medium text-primary truncate">{n.title}</div>
                        {n.message && <div className="text-xs text-gray-600 truncate">{n.message}</div>}
                        <div className="text-[11px] text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button onClick={() => setMenuOpen(o => !o)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 bg-medium-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
                {initials}
              </div>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <NavLink to="/settings" className={({isActive}) => `block px-3 py-2 text-sm hover:bg-gray-50 ${isActive ? 'text-primary' : 'text-gray-700'}`} onClick={() => setMenuOpen(false)}>
                  Settings
                </NavLink>
                <NavLink to="/profile" className={({isActive}) => `block px-3 py-2 text-sm hover:bg-gray-50 ${isActive ? 'text-primary' : 'text-gray-700'}`} onClick={() => setMenuOpen(false)}>
                  Profile
                </NavLink>
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => { setMenuOpen(false); onRequestLogout && onRequestLogout() }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { logout } = useAuth()
  const { settings } = useSettings()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar open={open} onClose={() => setOpen(false)} settings={settings} />

      <div className="flex-1">
        <Topbar onMenu={() => setOpen(true)} onRequestLogout={() => setShowLogoutConfirm(true)} settings={settings} />

        <main className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
      )}

      <ConfirmModal
        open={showLogoutConfirm}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => { setShowLogoutConfirm(false); logout(); }}
      />

      {/* Notifications UI */}
      <NotificationsContainer />
    </div>
  )
}
