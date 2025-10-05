import { NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

export default function Sidebar({ open, onClose, settings }) {
  const { hasPermission } = useAuth()
  const navCls = ({ isActive }) =>
    `nav-item flex w-full items-center whitespace-nowrap border-b space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      isActive ? 'bg-light-blue text-primary border-r-4 border-medium-blue' : 'text-gray-600 hover:bg-blue-50 border-b-transparent'
    }`

  return (
    <div className={`w-64 bg-white shadow-xl z-40 relative pb-20 overflow-y-scroll`}>
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
      <nav className="p-4 space-y-2">
        <NavLink to="/" end className={navCls}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
          </svg>
          <span>Dashboard</span>
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

      {/* add logo water mark here */}
      <div className="w-full flex items-center justify-center opacity-15">
        <img src={settings?.logoUrl} alt="Logo" className="w-16 h-16 object-cover" />
      </div>
    </div>
  )
}