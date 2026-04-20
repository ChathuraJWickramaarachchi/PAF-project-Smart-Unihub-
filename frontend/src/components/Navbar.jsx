import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NotificationAPI } from '../services/api'

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  const fetchUnreadCount = async () => {
    try {
      const response = await NotificationAPI.getUnreadCount(user.userId)
      setUnreadCount(response.data.unreadCount || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

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
    <nav className="sticky top-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-gray-100 h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-xl shadow-lg shadow-primary/20">🎓</div>
          <span className="text-lg font-black text-gray-900 tracking-tight">SmartUni <span className="text-primary italic">Portal</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              {[
                { name: 'Home', path: '/' },
                { name: 'Facilities', path: '/facilities' },
                { name: 'Tickets', path: '/tickets' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' },
              ].map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${isActive(link.path) ? 'text-primary' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-4 w-px bg-gray-100 mx-2"></div>
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="text-right">
                  <div className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{user?.fullName || 'Identity'}</div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{user?.role}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-sm group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  {user?.fullName?.charAt(0).toUpperCase() || '👤'}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
              >
                Exit
              </button>
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
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${isActive(link.path) ? 'text-primary' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/login"
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-4 animate-slide-in md:hidden">
          {/* Mobile links here if needed */}
        </div>
      )}
    </nav>
  )
}
