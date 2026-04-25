import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function TechnicianSidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { name: 'Dashboard Overview', path: '/technician-dashboard', icon: '📊' },
    { name: 'Tickets', path: '/tech/tickets', icon: '🔧' },
    { name: 'Analytics', path: '/tech/analytics', icon: '📈' },
  ]

  return (
    <aside className="w-72 h-screen bg-white flex flex-col shrink-0 border-r border-gray-100 selection:bg-primary/10">
      {/* Brand Section */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-xl shadow-lg shadow-primary/20">🎓</div>
          <div>
            <div className="text-gray-900 font-black text-base tracking-tight leading-none italic">SmartUniPortal</div>
            <div className="text-gray-400 font-bold text-[8px] uppercase tracking-widest mt-1">Technician Portal</div>
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
            <div className="flex items-center gap-4">
              <span className={`text-lg opacity-60 group-hover:opacity-100 transition-opacity ${isActive(item.path) ? 'opacity-100' : ''}`}>{item.icon}</span>
              <span className="font-bold text-[13px] tracking-tight">{item.name}</span>
            </div>
            {isActive(item.path) && <span className="text-gray-400 text-xs">›</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom User Profile */}
      <div className="p-4 border-t border-gray-100 space-y-4">
        <div className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 text-xs uppercase shadow-inner">
            {user?.fullName?.charAt(0) || 'T'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-gray-900 font-bold text-[12px] truncate">{user?.fullName || 'Technician'}</div>
            <div className="text-gray-400 font-medium text-[10px] truncate">{user?.email || 'tech@smartuni.edu'}</div>
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
