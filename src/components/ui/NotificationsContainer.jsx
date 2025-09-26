import React from 'react'
import { useNotifications } from '../../context/NotificationsContext.jsx'

export default function NotificationsContainer() {
  const { items, remove } = useNotifications()
  if (!items || items.length === 0) return null
  return (
    <div className="fixed z-[1000] top-4 right-4 flex flex-col gap-2">
      {items.map(n => (
        <div key={n.id} className={`min-w-[260px] max-w-[360px] rounded-lg shadow-lg px-4 py-3 border text-sm bg-white ${
          n.type === 'success' ? 'border-green-200 text-green-800 bg-green-50' :
          n.type === 'error' ? 'border-red-200 text-red-800 bg-red-50' :
          n.type === 'warning' ? 'border-yellow-200 text-yellow-800 bg-yellow-50' :
          'border-gray-200 text-gray-800'
        }`}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5">
              {n.type === 'success' && (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              )}
              {n.type === 'error' && (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              {n.type === 'warning' && (
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M4.93 19h14.14L12 5 4.93 19z" /></svg>
              )}
              {(!n.type || n.type === 'info') && (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
              )}
            </span>
            <div className="flex-1 leading-5">{n.message}</div>
            <button className="ml-2 text-gray-400 hover:text-gray-600" onClick={() => remove(n.id)} aria-label="Dismiss">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
