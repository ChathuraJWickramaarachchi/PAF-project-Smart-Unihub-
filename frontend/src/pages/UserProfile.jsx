import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './UserProfile.css'

export default function UserProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'User'
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    // TODO: Call API to update user profile
    setIsEditing(false)
    console.log('Profile updated:', formData)
  }

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'User'
    })
    setIsEditing(false)
  }

  return (
    <div className="user-profile-page">
      {/* Header */}
      <header className="profile-header-top">
        <div className="profile-header-container">
          <div className="profile-header-left">
            <button onClick={() => navigate('/')} className="back-btn">
              ← Back
            </button>
            <h1 className="profile-header-title">My Profile</h1>
          </div>
          <div className="profile-header-right">
            <button className="header-icon-btn" title="Notifications">
              🔔
            </button>
            <button onClick={handleLogout} className="header-icon-btn logout-icon" title="Logout">
              🚪
            </button>
          </div>
        </div>
      </header>

      <div className="profile-page-content">
        <div className="page-header">
          <p className="page-subtitle">Manage your account information</p>
        </div>

      <div className="profile-container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt={user?.fullName} />
              ) : (
                <div className="avatar-initials-large">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-header-info">
              <h2 className="profile-name">{user?.fullName || 'User'}</h2>
              <p className="profile-role">
                <span className="role-badge">{user?.role}</span>
              </p>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="profile-form">
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="form-value">{formData.fullName}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email"
                    disabled
                  />
                ) : (
                  <div className="form-value">{formData.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="form-value">{formData.phone || 'Not provided'}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <div className="form-value">{formData.role}</div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Account Status</h3>
              
              <div className="status-item">
                <span className="status-label">Account Status:</span>
                <span className="status-value active">✓ Active</span>
              </div>

              <div className="status-item">
                <span className="status-label">Member Since:</span>
                <span className="status-value">{new Date().getFullYear()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              {!isEditing ? (
                <>
                  <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                    Edit Profile
                  </button>
                  <button className="btn btn-secondary">
                    Change Password
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleSave} className="btn btn-primary">
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="btn btn-secondary">
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="additional-info">
          <div className="info-card">
            <h3>Quick Stats</h3>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-icon">📅</span>
                <div className="stat-details">
                  <span className="stat-name">Bookings</span>
                  <span className="stat-count">5</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🎫</span>
                <div className="stat-details">
                  <span className="stat-name">Tickets</span>
                  <span className="stat-count">2</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">✓</span>
                <div className="stat-details">
                  <span className="stat-name">Completed</span>
                  <span className="stat-count">3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3>Security</h3>
            <div className="security-options">
              <button className="security-btn">
                🔒 Change Password
              </button>
              <button className="security-btn">
                📱 Two-Factor Auth
              </button>
              <button className="security-btn">
                🗑️ Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
