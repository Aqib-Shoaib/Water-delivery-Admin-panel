import React from 'react'

export default function TableControls({ controls, className = '' }) {
  const { query, setQuery, page, totalPages, prev, next, pageSize, setPageSize, total } = controls
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <input
        placeholder="Search..."
        className="w-64 max-w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medium-blue"
        value={query}
        onChange={e => { setQuery(e.target.value); controls.setPage(1) }}
      />
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-gray-500">Rows per page</span>
        <select
          className="px-2 py-1 border border-gray-300 rounded-md"
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value) || 10); controls.setPage(1) }}
        >
          {[5,10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="text-sm text-gray-600">{(total === 0) ? '0' : ((page - 1) * pageSize + 1)}–{Math.min(page * pageSize, total)} of {total}</span>
        <button className="px-2 py-1 border rounded-md hover:bg-gray-50" onClick={prev} disabled={page <= 1}>Prev</button>
        <button className="px-2 py-1 border rounded-md hover:bg-gray-50" onClick={next} disabled={page >= totalPages}>Next</button>
      </div>
    </div>
  )
}
