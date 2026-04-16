import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../pages/Pages.css'

export default function AdminSidebar() {
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🎓</div>
          <div>
            <div className="logo-title">SmartUni Portal</div>
            <div className="logo-subtitle">ADMIN</div>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        {/* MAIN Section */}
        <div className="sidebar-section">
          <div className="section-label">MAIN</div>
          <Link
            to="/admin-dashboard"
            className={`sidebar-item ${isActive('/admin-dashboard') ? 'active' : ''}`}
          >
            <span className="item-icon">📊</span>
            <span className="item-label">Dashboard</span>
          </Link>
          <Link
            to="/admin/users"
            className={`sidebar-item ${isActive('/admin/users') ? 'active' : ''}`}
          >
            <span className="item-icon">👥</span>
            <span className="item-label">Users</span>
          </Link>
        </div>

        {/* FACILITIES Section */}
        <div className="sidebar-section">
          <div className="section-label">FACILITIES</div>
          <Link to="/resources" className={`nav-item ${isActive('/resources') ? 'active' : ''}`}>
            <span className="item-icon">🏢</span>
            <span className="item-label">Facilities & Assets</span>
          </Link>
        </div>

        {/* Maintenance Section */}
        <div className="nav-section">
          <div className="nav-section-label">MAINTENANCE</div>
          <Link to="/admin/tickets" className={`nav-item ${isActive('/admin/tickets') ? 'active' : ''}`}>
            <span className="nav-icon">🎫</span>
            <span className="nav-label">Tickets</span>
          </Link>
        </div>

        {/* Account Section */}
        <div className="nav-section">
          <div className="nav-section-label">ACCOUNT</div>
          <Link to="/notifications" className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}>
            <span className="nav-icon">🔔</span>
            <span className="nav-label">Notifications</span>
          </Link>
          <Link to="/admin/analytics" className={`nav-item ${isActive('/admin/analytics') ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            <span className="nav-label">Analytics</span>
          </Link>
        </div>
      </div>

      <div className="sidebar-footer">
        <button onClick={() => { logout(); navigate('/'); }} className="logout-btn">
          <span className="item-icon">🚪</span>
          <span className="item-label">Logout</span>
        </button>
      </div>
    </div>
  )
}
