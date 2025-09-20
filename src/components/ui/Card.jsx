import React from 'react'

export default function Card({ className = '', children }) {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {children}
    </div>
  )}
