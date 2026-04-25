import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminSidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin-dashboard', icon: '📊' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Pending Approvals', path: '/admin/pending-approvals', icon: '✅' },
    { name: 'Resources', path: '/resources', icon: '🏢' },
    { name: 'Notifications', path: '/notifications', icon: '🔔' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
  ]

  return (
    <aside className="w-64 h-screen bg-white flex flex-col shrink-0 border-r border-gray-200">
      {/* Brand Section */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-lg">🎓</div>
          <div>
            <div className="text-base font-semibold text-gray-900">SmartUni Portal</div>
            <div className="text-xs text-gray-500 mt-0.5">Admin Dashboard</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive(item.path) 
                ? 'bg-primary/5 text-primary border-l-2 border-primary' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{user?.fullName || 'Administrator'}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email || 'admin@smartuni.edu'}</div>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center gap-2 px-4 py-2.5 mt-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
