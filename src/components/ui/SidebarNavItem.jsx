import { NavLink } from 'react-router-dom'

export default function SidebarNavItem({ to, label, icon, end = false }) {
  const cls = ({ isActive }) =>
    `nav-item flex w-full items-center whitespace-nowrap space-x-3 px-2 py-1.5 rounded-lg text-sm font-medium transition-all ${
      isActive ? 'bg-light-blue text-primary shadow' : 'text-gray-600 hover:bg-blue-50 hover:shadow'
    }`
  return (
    <NavLink to={to} end={end} className={cls}>
      <span className="w-5 h-5 inline-flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}
