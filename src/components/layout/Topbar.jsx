import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { NavLink } from "react-router-dom"

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Topbar({ onMenu, onRequestLogout, settings }) {
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
  
            {/* Products shortcut */}
            <NavLink
              to="/products"
              className={({isActive}) => `inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-md ${isActive ? 'text-primary' : 'text-gray-700'}`}
              title="Products"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </NavLink>
  
            {/* Docs & Forms */}
            <NavLink
              to="/docs"
              className={({isActive}) => `inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-md ${isActive ? 'text-primary' : 'text-gray-700'}`}
              title="Docs & Forms"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6M7 8h10M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
            </NavLink>
  
            {/* Offers & Deals button */}
            <NavLink
              to="/reminders?tab=deals"
              className={({isActive}) => `inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-md ${isActive ? 'text-primary' : 'text-gray-700'}`}
              title="Offers & Deals"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </NavLink>
  
            {/* Reminders button */}
            <NavLink
              to="/reminders"
              className={({isActive}) => `inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-md ${isActive ? 'text-primary' : 'text-gray-700'}`}
              title="Reminders"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M12 22a10 10 0 110-20 10 10 0 010 20z" />
              </svg>
            </NavLink>

            {/* Messages button */}
            <NavLink
              to="/messages"
              className={({isActive}) => `inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-md ${isActive ? 'text-primary' : 'text-gray-700'}`}
              title="Messages"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h8M8 14h6M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 21l1.8-4A8.9 8.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
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
