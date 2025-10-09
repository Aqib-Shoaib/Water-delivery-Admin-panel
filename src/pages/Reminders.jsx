import React from 'react'
import RemindersTab from '../components/reminders/RemindersTab.jsx'

export default function Reminders() {
  return (
    <div className="space-y-6">
      <div className="border-b">
        <div className="flex gap-2">
          <div className="px-4 py-2 text-sm rounded-t-md border-b-2 border-transparent text-primary">
            Reminders
          </div>
        </div>
      </div>

      <RemindersTab />
    </div>
  )
}
