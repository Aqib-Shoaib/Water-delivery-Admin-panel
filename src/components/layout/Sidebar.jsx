import { useState } from "react"
import { NavLink, Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import SidebarNavItem from "../ui/SidebarNavItem.jsx"
import { MdOutlineAlternateEmail, MdOutlineDashboard, MdOutlineHealthAndSafety, MdOutlinePhone, MdOutlineShoppingBag, MdOutlineShoppingBasket } from "react-icons/md"
import { CiDatabase } from "react-icons/ci";
import { TbReportSearch } from "react-icons/tb";
import { AiOutlineIssuesClose } from "react-icons/ai";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { SiAmazonecs } from "react-icons/si";
import { LuLogs } from "react-icons/lu";
import { BsCashCoin } from "react-icons/bs";
import { RxSection } from "react-icons/rx";


export default function Sidebar({ settings }) {
  const { hasPermission } = useAuth()

  const [zonesOpen, setZonesOpen] = useState(false)
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') || 'admin'

  return (
    <div className={`w-80 bg-white shadow-xl z-40 relative pb-20 overflow-y-scroll no-scrollbar`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-lg bg-white" />
          ) : (
            <div className="bg-primary w-16 h-16 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-primary">{settings?.siteName || 'AdminPanel'}</h2>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        <SidebarNavItem to="/" end label="Dashboard" icon={<MdOutlineDashboard />} />
                <div className="w-full">
          <div className="flex w-full items-center justify-between">
            <NavLink
              to="/zones"
              className={({ isActive }) => `w-full nav-item flex items-center whitespace-nowrap space-x-3 px-2 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-light-blue text-primary shadow' : 'text-gray-600 hover:bg-blue-50 hover:shadow'
              }`}
            >
              <SiAmazonecs />
              <span>Zones</span>
            </NavLink>
            <button
              aria-label="Toggle Zones submenu"
              onClick={() => setZonesOpen(v => !v)}
              className="px-2 text-gray-600 hover:text-primary"
            >
              <svg className={`w-6 h-6 transition-transform ${zonesOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.293 7.293a1 1 0 011.414 0L12 11.586l-4.293 4.293a1 1 0 01-1.414-1.414L9.586 12 6.293 8.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
          {zonesOpen && (
            <div className="ml-6 mt-1 mb-2 rounded-md bg-white shadow p-1">
              <Link to="/zones?tab=admin" className={`flex items-center px-1.5 py-1 rounded text-sm ${currentTab==='admin'?'text-primary bg-blue-50':'text-gray-700 hover:bg-gray-50'}`}>Admin</Link>
              <Link to="/zones?tab=customer" className={`flex items-center px-1.5 py-1 rounded text-sm ${currentTab==='customer'?'text-primary bg-blue-50':'text-gray-700 hover:bg-gray-50'}`}>Customer</Link>
              <Link to="/zones?tab=staff" className={`flex items-center px-1.5 py-1 rounded text-sm ${currentTab==='staff'?'text-primary bg-blue-50':'text-gray-700 hover:bg-gray-50'}`}>Staff</Link>
            </div>
          )}
        </div>
        <SidebarNavItem to="/departments" label="Departments" icon={<RxSection />} />
        {hasPermission && hasPermission('finance:read') && (
          <SidebarNavItem to="/finance" label="Finance" icon={<BsCashCoin />} />
        )}
        <SidebarNavItem to="/products" label="Products & Services" icon={<MdOutlineShoppingBag />} />
        <SidebarNavItem to="/orders" label="Order Management" icon={<MdOutlineShoppingBasket />} />
        {hasPermission && hasPermission('assets:read') && (
          <SidebarNavItem to="/assets" label="Asset Management" icon={<CiDatabase />} />
        )}
        {hasPermission && hasPermission('analytics:read') && (
          <SidebarNavItem to="/history" label="History & Reports" icon={<TbReportSearch />} />
        )}
        <SidebarNavItem to="/communication" label="Communication & Complaints" icon={<AiOutlineIssuesClose />} />
        {hasPermission && hasPermission('settings:write') && (
          <SidebarNavItem to="/about" label="About" icon={<IoIosInformationCircleOutline />} />
        )}
        {hasPermission && hasPermission('settings:write') && (
          <SidebarNavItem to="/help-center" label="Help Center" icon={<BiSupport />} />
        )}
        {hasPermission && hasPermission('settings:write') && (
          <SidebarNavItem to="/contact" label="Contact" icon={<MdOutlinePhone />} />
        )}
        {hasPermission && hasPermission('users:write') && (
          <SidebarNavItem to="/invite" label="Invite" icon={<MdOutlineAlternateEmail />} />
        )}
        {/*
        <NavLink to="/drivers" className={navCls}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span>Drivers</span>
        </NavLink>
        */}
        {/*
        <NavLink to="/customers" className={navCls}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V8H2v12h5m10 0V8m0 12H7m0 0v-2a3 3 0 013-3h4a3 3 0 013 3v2" />
          </svg>
          <span>Customers</span>
        </NavLink>
        */}
        <SidebarNavItem to="/health-reminders" label="Health Reminders" icon={<MdOutlineHealthAndSafety />} />
        <SidebarNavItem to="/audit-logs" label="Audit Logs" icon={<LuLogs />} />
        {/* <SidebarNavItem to="/invoices" label="Invoices" icon={(
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6M7 8h10M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
          </svg>
        )} /> */}
        {/* {hasPermission && hasPermission('salarySlips:read') && (
          <SidebarNavItem to="/payroll" label="Payroll" icon={(
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.343-4 3s1.79 3 4 3 4 1.343 4 3-1.79 3-4 3m0-12V4m0 4v12" />
            </svg>
          )} />
        )}
        {hasPermission && hasPermission('settings:write') && (
          <SidebarNavItem to="/payroll-settings" label="Payroll Settings" icon={(
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2v2m0 0a4 4 0 100 8 4 4 0 000-8zm0 8v2m0-2V8" />
            </svg>
          )} />
        )} */}
      </nav>

      {/* add logo water mark here */}
      <div className="w-full flex items-center justify-center opacity-15">
        <img src={settings?.logoUrl} alt="Logo" className="w-16 h-16 object-cover" />
      </div>
    </div>
  )
}