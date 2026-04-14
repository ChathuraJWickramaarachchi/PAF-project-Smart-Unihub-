import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NotificationAPI } from '../services/api'
import './Navbar.css'

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
      const interval = setInterval(fetchUnreadCount, 30000) // Poll every 30 seconds
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

  // Hide navbar on dashboard pages (they have their own headers)
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
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎓</span>
          SmartUni Portal
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>

        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/facilities"
                className={`nav-link ${isActive('/facilities') ? 'active' : ''}`}
              >
                Facilities
              </Link>
              <Link
                to="/tickets"
                className={`nav-link ${isActive('/tickets') ? 'active' : ''}`}
              >
                Tickets
              </Link>
              <Link
                to="/contact"
                className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
              >
                Contact Us
              </Link>
              <Link
                to="/about"
                className={`nav-link ${isActive('/about') ? 'active' : ''}`}
              >
                About Us
              </Link>
              <Link
                to="/profile"
                className={`nav-link profile-link ${isActive('/profile') ? 'active' : ''}`}
              >
                👤 Profile
              </Link>
              <button onClick={handleLogout} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/home" className={`nav-link ${isActive('/home') ? 'active' : ''}`}>
                Home
              </Link>
              <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                About Us
              </Link>
              <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
                Contact Us
              </Link>
              <Link to="/login" className="nav-link login-btn-nav">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
