import React, { createContext, useContext, useMemo, useRef, useState } from 'react'

const NotificationsContext = createContext({
  notify: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warnings: () => {},
  items: [],
})

let nextId = 1

export function NotificationsProvider({ children }) {
  const [items, setItems] = useState([])
  const timers = useRef({})

  const remove = (id) => {
    setItems((list) => list.filter((n) => n.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }

  const push = (type, message, duration = 4000) => {
    const id = nextId++
    setItems((list) => [...list, { id, type, message }])
    if (duration > 0) {
      timers.current[id] = setTimeout(() => remove(id), duration)
    }
    return id
  }

  const api = useMemo(() => ({
    notify: (message, duration) => push('info', message, duration),
    success: (message, duration) => push('success', message, duration),
    error: (message, duration) => push('error', message, duration),
    info: (message, duration) => push('info', message, duration),
    warning: (message, duration) => push('warning', message, duration),
    remove,
    items,
  }), [items])

  return (
    <NotificationsContext.Provider value={api}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationsContext)
}
