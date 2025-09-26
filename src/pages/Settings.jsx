import React, { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import SiteSettingsModal from '../components/modals/SiteSettingsModal.jsx'
import { useSettings } from '../context/SettingsContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function Settings() {
  const { settings, loading, error, refresh } = useSettings()
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Site Settings</h2>
            <p className="text-xs text-gray-500">Manage site branding and contact information</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
            <button onClick={() => setOpen(true)} className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary">Edit Settings</button>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-600">{error}</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm"><span className="font-medium text-primary">Site Name:</span> {settings?.siteName || '—'}</div>
              <div className="text-sm"><span className="font-medium text-primary">Contact Email:</span> {settings?.contactEmail || '—'}</div>
              <div className="text-sm"><span className="font-medium text-primary">Contact Phone:</span> {settings?.contactPhone || '—'}</div>
              <div className="text-sm"><span className="font-medium text-primary">Address:</span> {settings?.address || '—'}</div>
              <div className="text-sm"><span className="font-medium text-primary">WhatsApp Link:</span> {settings?.whatsappLink ? <a className="text-medium-blue underline" href={settings.whatsappLink} target="_blank" rel="noreferrer">{settings.whatsappLink}</a> : '—'}</div>
              <div className="text-sm"><span className="font-medium text-primary">WhatsApp Phone:</span> {settings?.whatsappPhone || '—'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-primary mb-1">Logo</div>
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-14 object-contain" />
              ) : (
                <div className="h-14 w-28 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs">No logo</div>
              )}
            </div>
          </div>
        )}
      </Card>

      <SiteSettingsModal open={open} onClose={(changed) => { setOpen(false); if (changed) refresh() }} apiBase={API_BASE} initial={settings || {}} />
    </div>
  )
}
