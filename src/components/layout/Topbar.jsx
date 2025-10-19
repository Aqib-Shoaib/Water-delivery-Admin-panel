import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { NavLink } from "react-router-dom"
import { FaRegClock, FaRegMessage } from "react-icons/fa6";
import TopbarIconButton from "../ui/TopbarIconButton.jsx";
import { BiSupport } from "react-icons/bi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { SlDocs } from "react-icons/sl";
import { FiShoppingBag } from "react-icons/fi";

export default function Topbar({ onMenu, onRequestLogout }) {
  const { user } = useAuth()
  const initials = (user?.email || 'AD').slice(0, 2).toUpperCase()
  const [menuOpen, setMenuOpen] = useState(false)

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

          {/* Products shortcut */}
          <TopbarIconButton
            to="/products"
            label="Products"
            icon={<FiShoppingBag />}
          />

          {/* Docs & Forms */}
          <TopbarIconButton
            to="/docs"
            label="Docs & Forms"
            icon={<SlDocs />}
          />

          {/* Offers & Deals button */}
          <TopbarIconButton
            to="/deals"
            label="Offers & Deals"
            icon={<MdOutlineLocalOffer />}
          />

          {/* Reminders button */}
          <TopbarIconButton
            to="/reminders"
            label="Reminders"
            icon={<FaRegClock />}
          />

          {/* Messages button */}
          <TopbarIconButton to="/messages" label="Messages" icon={<FaRegMessage />} />

          {/* Help Center button */}
          <TopbarIconButton
            to="/help-center"
            label="Help Center"
            icon={<BiSupport />}
          />

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
                <NavLink to="/settings" className={({ isActive }) => `block px-3 py-2 text-sm hover:bg-gray-50 ${isActive ? 'text-primary' : 'text-gray-700'}`} onClick={() => setMenuOpen(false)}>
                  Settings
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `block px-3 py-2 text-sm hover:bg-gray-50 ${isActive ? 'text-primary' : 'text-gray-700'}`} onClick={() => setMenuOpen(false)}>
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
