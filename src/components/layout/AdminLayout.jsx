import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import ConfirmModal from '../modals/ConfirmModal.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'
import NotificationsContainer from '../ui/NotificationsContainer.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'


export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { logout } = useAuth()
  const { settings } = useSettings()

  return (
    <div className="h-screen bg-gray-50 text-gray-900 grid grid-cols-[250px_1fr] overflow-y-hidden w-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} settings={settings} />

      <div className="">
        <Topbar onMenu={() => setOpen(true)} onRequestLogout={() => setShowLogoutConfirm(true)} settings={settings} />

        <main className="py-4 md:py-6 px-4 h-full">
          <div className="w-full h-full overflow-y-scroll">
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
