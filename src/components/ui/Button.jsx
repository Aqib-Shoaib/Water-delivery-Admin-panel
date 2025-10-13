import React from 'react'

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-shadow'
  const variants = {
    primary: 'bg-blue-600 text-white shadow hover:shadow-md hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-white text-gray-900 shadow hover:shadow-md hover:bg-gray-50 focus:ring-gray-400',
    danger: 'bg-red-600 text-white shadow hover:shadow-md hover:bg-red-700 focus:ring-red-500',
    outline: 'bg-white text-gray-900 shadow hover:shadow-md hover:bg-gray-50 focus:ring-gray-400',
  }
  const cls = `${base} ${variants[variant] ?? variants.primary} ${className}`
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}
