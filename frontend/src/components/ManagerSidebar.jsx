import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ManagerSidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { name: 'Dashboard Overview', path: '/manager-dashboard', icon: '📊' },
    { name: 'Facility Management', path: '/manager/resources', icon: '🏢' },
    { name: 'Booking Control', path: '/bookings', icon: '📅' },
    { name: 'Real-time Analytics', path: '/manager/analytics', icon: '📈' },

  ]

  return (
    <aside className="w-64 h-screen bg-white flex flex-col shrink-0 border-r border-gray-200 selection:bg-primary/10">
      {/* Brand Section */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-lg">🎓</div>
          <div>
            <div className="text-gray-900 font-semibold text-gray-900">SmartUni Portal</div>
            <div className="text-gray-400 text-xs text-gray-500 mt-1">Manager Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between px-5 py-4 rounded-xl transition-all group ${isActive(item.path) ? 'bg-gray-50 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50/50 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg opacity-60 group-hover:opacity-100 transition-opacity ${isActive(item.path) ? 'opacity-100' : ''}`}>{item.icon}</span>
              <span className="font-bold text-[13px] tracking-tight">{item.name}</span>
            </div>
            {isActive(item.path) && <span className="text-gray-400 text-xs">›</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom User Profile */}
      <div className="p-4 border-t border-gray-200 space-y-4">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 text-xs uppercase shadow-inner">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-gray-900 font-bold text-[12px] truncate">{user?.fullName || 'Manager'}</div>
            <div className="text-gray-400 font-medium text-[10px] truncate">{user?.email || 'manager@smartuni.edu'}</div>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-6 py-4 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95 group font-bold text-[12px]"
        >
          <span className="opacity-40 group-hover:opacity-100 transition-opacity">🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
