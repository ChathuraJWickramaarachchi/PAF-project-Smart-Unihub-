import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationPanel from './NotificationPanel'
import { FaUser, FaSignOutAlt, FaChevronDown, FaTachometerAlt } from 'react-icons/fa'

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  // Determine the dashboard path based on user role
  const getDashboardPath = () => {
    if (!user?.role) return '/user-dashboard'
    const role = user.role.toLowerCase()
    if (role.includes('admin')) return '/admin-dashboard'
    if (role.includes('technician')) return '/technician-dashboard'
    if (role.includes('manager')) return '/manager-dashboard'
    return '/user-dashboard'
  }

  const getDashboardLabel = () => {
    if (!user?.role) return 'Dashboard'
    const role = user.role.toLowerCase()
    if (role.includes('admin')) return 'Admin Panel'
    if (role.includes('technician')) return 'Tech Panel'
    if (role.includes('manager')) return 'Manager Panel'
    return 'Dashboard'
  }

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const dashboardPages = [
    '/admin-dashboard',
    '/admin/users',
    '/technician-dashboard',
    '/manager-dashboard',
    '/user-dashboard',
    '/profile',
    '/bookings',
    '/resources',
    '/admin/tickets',
    '/notifications',
    '/admin/analytics'
  ]

  if (dashboardPages.includes(location.pathname)) {
    return null
  }

  return (
    <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              🎓
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">SmartUni</span>
              <span className="text-lg font-bold text-primary ml-1">Portal</span>
            </div>
          </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1">
          {isAuthenticated ? (
            <>
              {[
                { name: 'Home', path: '/' },
                { name: getDashboardLabel(), path: getDashboardPath() },
                { name: 'Facilities', path: '/facilities' },
                { name: 'Tickets', path: '/tickets' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' },
              ].map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path) 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
                        
              {/* Divider */}
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
                        
              {/* Notification Panel */}
              {isAuthenticated && <NotificationPanel />}
                        
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <FaChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                          
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-[10px] font-semibold rounded-md capitalize">
                        {user?.role}
                      </span>
                    </div>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FaTachometerAlt className="w-4 h-4" />
                      <span>{getDashboardLabel()}</span>
                    </Link>
                    <Link
                      to="/user-dashboard"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FaUser className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {[
                { name: 'Home', path: '/home' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' },
              ].map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path) 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/login"
                className="ml-3 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-all shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'mt-1.5'}`}></span>
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'mt-1.5'}`}></span>
          </div>
        </button>
      </div>
    </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-slide-in">
          <div className="px-6 py-4 space-y-1">
            {isAuthenticated ? (
              <>
                {[
                  { name: 'Home', path: '/' },
                  { name: getDashboardLabel(), path: getDashboardPath() },
                  { name: 'Facilities', path: '/facilities' },
                  { name: 'Tickets', path: '/tickets' },
                  { name: 'About', path: '/about' },
                  { name: 'Contact', path: '/contact' },
                ].map((link, i) => (
                  <Link 
                    key={i} 
                    to={link.path} 
                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold shadow-md">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{user?.fullName}</div>
                      <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                    </div>
                  </Link>
                  <button 
                    onClick={() => { logout(); navigate('/'); setIsMobileMenuOpen(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {['Home', 'About', 'Contact'].map((name, i) => (
                  <Link 
                    key={i} 
                    to={['/home', '/about', '/contact'][i]} 
                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {name}
                  </Link>
                ))}
                <Link 
                  to="/login" 
                  className="block mt-4 bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-all shadow-md text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
