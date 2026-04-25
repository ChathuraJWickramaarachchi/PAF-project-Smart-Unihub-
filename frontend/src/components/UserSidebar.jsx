import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaHome, FaTicketAlt, FaCalendarCheck, FaUserCircle, FaSignOutAlt } from 'react-icons/fa'

export default function UserSidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { name: 'Dashboard', path: '/user-dashboard', icon: FaHome },
    { name: 'My Tickets', path: '/user/tickets', icon: FaTicketAlt },
    { name: 'My Bookings', path: '/user/bookings', icon: FaCalendarCheck },
    { name: 'Profile Settings', path: '/user/profile', icon: FaUserCircle },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="w-64 h-screen bg-white flex flex-col shrink-0 border-r border-gray-200 shadow-sm">
      {/* Brand Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-blue-600/30">
            🎓
          </div>
          <div>
            <div className="text-base font-bold text-gray-900">SmartUni</div>
            <div className="text-xs text-gray-500 font-medium">User Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <Icon className={`text-lg ${active ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>{item.name}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom User Profile */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {user?.fullName || 'User'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user?.email || 'user@smartuni.edu'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-100"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
