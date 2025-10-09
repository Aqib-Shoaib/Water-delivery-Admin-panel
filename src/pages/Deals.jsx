import React from 'react'
import DealsTab from '../components/reminders/DealsTab.jsx'

export default function Deals() {
  return (
    <div className="space-y-6">
      <div className="border-b">
        <div className="flex gap-2">
          <div className="px-4 py-2 text-sm rounded-t-md border-b-2 border-transparent text-primary">
            Offers & Deals
          </div>
        </div>
      </div>

      <DealsTab />
    </div>
  )
}
