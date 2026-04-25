import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { NotificationAPI } from '../services/api'
import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaComments,
  FaCalendarAlt,
  FaTicketAlt,
  FaTimes,
  FaTrash
} from 'react-icons/fa'

export default function NotificationPanel() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (user?.userId) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, filter])

  const fetchUnreadCount = async () => {
    try {
      const response = await NotificationAPI.getUnreadCount(user.userId)
      const payload = response?.data
      setUnreadCount(payload?.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
      setUnreadCount(0)
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      let response
      if (filter === 'unread') {
        response = await NotificationAPI.getUnread(user.userId)
      } else {
        response = await NotificationAPI.getAll(user.userId)
      }

      const payload = response?.data
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.notifications)
          ? payload.notifications
          : []

      let filtered = list
      if (filter !== 'all' && filter !== 'unread') {
        filtered = filtered.filter(
          (n) => typeof n?.type === 'string' && n.type.includes(filter.toUpperCase())
        )
      }

      setNotifications(filtered)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationAPI.markAsRead(notificationId)
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationAPI.markAllAsRead(user.userId)
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      await NotificationAPI.delete(notificationId)
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING_SUBMITTED':
      case 'BOOKING_APPROVED':
      case 'BOOKING_REJECTED':
        return <FaCalendarAlt className="text-blue-500" />
      case 'TICKET_CREATED':
      case 'TICKET_ASSIGNED':
      case 'TICKET_STATUS_CHANGED':
        return <FaTicketAlt className="text-purple-500" />
      case 'COMMENT_ADDED':
        return <FaComments className="text-green-500" />
      case 'SYSTEM_NOTIFICATION':
        return <FaBell className="text-yellow-500" />
      default:
        return <FaBell className="text-gray-500" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'BOOKING_APPROVED':
        return 'bg-green-50 border-green-200'
      case 'BOOKING_REJECTED':
        return 'bg-red-50 border-red-200'
      case 'TICKET_CREATED':
        return 'bg-blue-50 border-blue-200'
      case 'TICKET_STATUS_CHANGED':
        return 'bg-purple-50 border-purple-200'
      case 'COMMENT_ADDED':
        return 'bg-green-50 border-green-200'
      case 'SYSTEM_NOTIFICATION':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 max-h-96 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 px-4 py-2 border-b border-gray-200 text-xs overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'booking', label: 'Bookings' },
              { id: 'ticket', label: 'Tickets' },
              { id: 'comment', label: 'Comments' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded whitespace-nowrap transition-colors ${
                  filter === f.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FaBell className="mx-auto text-3xl mb-2 opacity-30" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)} cursor-pointer hover:bg-opacity-75 transition-all ${
                      !notification.isRead ? 'border-l-primary' : 'border-l-gray-300'
                    }`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notification.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                        className="mt-2 text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="flex-1 text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}
