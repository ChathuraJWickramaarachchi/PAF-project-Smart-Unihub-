import React, { useState, useEffect } from 'react'
import { NotificationAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'
import '../Pages.css'
import '../AdminDashboard.css'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  // Get current user ID from auth context
  const userId = user?.userId ? parseInt(user.userId) : 0

  useEffect(() => {
    fetchNotifications()
  }, [showUnreadOnly])

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      let response
      if (showUnreadOnly) {
        response = await NotificationAPI.getUnread(userId)
      } else {
        response = await NotificationAPI.getAll(userId)
      }
      setNotifications(response.data)
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await NotificationAPI.markAsRead(id)
      fetchNotifications()
    } catch (err) {
      setError('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationAPI.markAllAsRead(userId)
      fetchNotifications()
    } catch (err) {
      setError('Failed to mark all as read')
    }
  }

  const handleDelete = async (id) => {
    try {
      await NotificationAPI.delete(id)
      fetchNotifications()
    } catch (err) {
      setError('Failed to delete notification')
    }
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <main className="admin-main-content">
        <div className="admin-header">
          <div className="header-title">Notifications</div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={handleMarkAllAsRead} style={{ marginRight: '1rem' }}>Mark All as Read</button>
            <button className="header-icon-btn">🔔</button>
            <button className="header-icon-btn">👤</button>
          </div>
        </div>

        <div className="admin-content">
          <div className="page-container" style={{ margin: 0, width: '100%', maxWidth: 'none', padding: 0 }}>

            {error && <div className="error-message">{error}</div>}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                />
                <span style={{ fontWeight: '500' }}>Show unread only</span>
              </label>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
            ) : notifications.length === 0 ? (
              <div className="card">
                <p style={{ textAlign: 'center', color: '#6b7280' }}>No notifications</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="card"
                    style={{
                      backgroundColor: notification.isRead ? '#ffffff' : '#f3f4f6',
                      borderLeft: `4px solid ${notification.isRead ? '#d1d5db' : '#2563eb'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '0.25rem', fontWeight: '600' }}>
                          {notification.title}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          {notification.message}
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!notification.isRead && (
                          <button
                            className="btn-primary"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Read
                          </button>
                        )}
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(notification.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
