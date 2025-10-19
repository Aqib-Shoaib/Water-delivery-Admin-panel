import React from 'react'
import Card from '../components/ui/Card.jsx'

const DEPARTMENTS = [
  'Human Resources',
  'Admin',
  'Operations',
  'Finance',
  'Marketing',
  'Sales and Purchase',
  'Customer relations',
  'info tech',
  'learning develop',
]

export default function Departments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Departments</h2>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEPARTMENTS.map((name) => (
            <button
              key={name}
              type="button"
              className="w-full h-28 sm:h-32 rounded-xl border-2 border-gray-200 hover:border-medium-blue hover:shadow transition bg-white flex items-center justify-center text-center px-4"
            >
              <span className="text-lg sm:text-xl font-semibold text-primary">{name}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
