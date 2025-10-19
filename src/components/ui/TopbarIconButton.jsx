import { NavLink } from 'react-router-dom'

export default function TopbarIconButton({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `group relative inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-md ${isActive ? 'text-primary' : 'text-gray-700'}`}
    >
      <span className='font-bold text-xl' >
        {icon}
      </span>
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow group-hover:opacity-100">
        {label}
      </span>
    </NavLink>
  )
}
