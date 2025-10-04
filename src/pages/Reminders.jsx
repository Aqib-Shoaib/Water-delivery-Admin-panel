import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import RemindersTab from '../components/reminders/RemindersTab.jsx'
import DealsTab from '../components/reminders/DealsTab.jsx'

export default function Reminders() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const tab = (params.get('tab') || 'reminders').toLowerCase()

  function setTab(next) {
    const p = new URLSearchParams(params)
    p.set('tab', next)
    setParams(p)
  }

  React.useEffect(() => {
    if (tab !== 'reminders' && tab !== 'deals') {
      navigate('/reminders?tab=reminders', { replace: true })
    }
  }, [tab, navigate])

  return (
    <div className="space-y-6">
      <div className="border-b">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 text-sm rounded-t-md border-b-2 ${tab === 'reminders' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'}`}
            onClick={() => setTab('reminders')}
          >
            Reminders
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-t-md border-b-2 ${tab === 'deals' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'}`}
            onClick={() => setTab('deals')}
          >
            Deals
          </button>
        </div>
      </div>

      {tab === 'reminders' ? <RemindersTab /> : <DealsTab />}
    </div>
  )
}
