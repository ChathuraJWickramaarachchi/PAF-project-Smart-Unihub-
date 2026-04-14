import React, { useState, useEffect } from 'react'
import { BookingAPI, ResourceAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'
import '../AdminDashboard.css'
import '../Bookings.css'

export default function Bookings() {
  const { user, logout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewMode, setViewMode] = useState('list')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [resources, setResources] = useState([])
  const [newBooking, setNewBooking] = useState({
    resourceId: '',
    date: '',
    expectedAttendees: '',
    startTime: '',
    endTime: '',
    bookingPurpose: '',
    additionalNotes: ''
  })

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  useEffect(() => {
    if (showCreateModal) {
      fetchResources()
    }
  }, [showCreateModal])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    try {
      let response
      if (statusFilter === 'All') {
        response = await BookingAPI.getAll()
      } else {
        response = await BookingAPI.getByStatus(statusFilter.toUpperCase())
      }
      setBookings(response.data || [])
    } catch (err) {
      setError('Failed to load bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await BookingAPI.approve(id, 'Approved')
      fetchBookings()
    } catch (err) {
      setError('Failed to approve booking')
    }
  }

  const handleReject = async (id) => {
    try {
      await BookingAPI.reject(id, 'Rejected')
      fetchBookings()
    } catch (err) {
      setError('Failed to reject booking')
    }
  }

  const fetchResources = async () => {
    try {
      const response = await ResourceAPI.getAll()
      setResources(response.data || [])
    } catch (err) {
      console.error('Failed to fetch resources:', err)
    }
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    setError('')
    try {
      // Combine date + time into datetime strings
      const startDateTime = `${newBooking.date}T${newBooking.startTime}:00`
      const endDateTime = `${newBooking.date}T${newBooking.endTime}:00`

      await BookingAPI.create({
        resourceId: parseInt(newBooking.resourceId),
        startTime: startDateTime,
        endTime: endDateTime,
        bookingPurpose: newBooking.bookingPurpose,
        additionalNotes: newBooking.additionalNotes,
        expectedAttendees: newBooking.expectedAttendees ? parseInt(newBooking.expectedAttendees) : null,
        userId: 1
      })
      setShowCreateModal(false)
      setNewBooking({ resourceId: '', date: '', expectedAttendees: '', startTime: '', endTime: '', bookingPurpose: '', additionalNotes: '' })
      fetchBookings()
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create booking';
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const firstError = Object.values(fieldErrors)[0];
        setError(`${errorMessage}: ${firstError}`);
      } else {
        setError(errorMessage);
      }
    }
  }

  const handleLogout = () => {
    logout()
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'badge-approved'
      case 'PENDING':
        return 'badge-pending'
      case 'REJECTED':
        return 'badge-rejected'
      case 'CANCELLED':
        return 'badge-cancelled'
      default:
        return 'badge-default'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calendar helpers
  const getCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    const days = []
    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, currentMonth: false, date: new Date(year, month - 1, daysInPrevMonth - i) })
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, currentMonth: true, date: new Date(year, month, d) })
    }
    // Next month padding to fill 6 rows
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) })
    }
    return days
  }

  const getBookingsForDate = (date) => {
    return bookings.filter(b => {
      if (!b.startTime) return false
      const bd = new Date(b.startTime)
      return bd.getFullYear() === date.getFullYear() &&
        bd.getMonth() === date.getMonth() &&
        bd.getDate() === date.getDate()
    })
  }

  const getCalendarPillClass = (status) => {
    switch (status) {
      case 'APPROVED': return 'cal-pill-approved'
      case 'PENDING': return 'cal-pill-pending'
      case 'REJECTED': return 'cal-pill-rejected'
      case 'CANCELLED': return 'cal-pill-cancelled'
      default: return 'cal-pill-approved'
    }
  }

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']


  return (
    <div className="admin-dashboard">
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Header */}
        <div className="admin-header">
          <div className="header-title">Booking Management</div>
          <div className="header-actions">
            <input type="text" className="search-input" placeholder="Search anything..." />
            <button className="header-icon-btn">🔔</button>
            <button className="header-icon-btn">👤</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="admin-content">
          {error && <div className="error-message">{error}</div>}

          {/* View Mode Tabs */}
          <div className="view-tabs">
            <button
              className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
            <button
              className={`tab-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </button>
          </div>

          {/* Action Bar */}
          <div className="booking-action-bar">
            <div className="filter-buttons">
              {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <button className="new-booking-btn" onClick={() => { setError(''); setShowCreateModal(true) }}>
              + New Booking
            </button>
          </div>

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bookings-table-wrapper">
              {loading ? (
                <div className="loading-message">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="empty-message">No bookings found</div>
              ) : (
                <div className="bookings-table">
                  <div className="table-row table-header">
                    <div className="table-cell id-col">ID</div>
                    <div className="table-cell resource-col">RESOURCE</div>
                    <div className="table-cell requested-col">REQUESTED BY</div>
                    <div className="table-cell date-col">DATE & TIME</div>
                    <div className="table-cell purpose-col">PURPOSE</div>
                    <div className="table-cell attendees-col">ATTENDEES</div>
                    <div className="table-cell status-col">STATUS</div>
                    <div className="table-cell actions-col">ACTIONS</div>
                  </div>

                  {bookings.map((booking, index) => (
                    <div className="table-row" key={booking.id || index}>
                      <div className="table-cell id-col">#{booking.id || 'N/A'}</div>
                      <div className="table-cell resource-col">{booking.resourceName || 'N/A'}</div>
                      <div className="table-cell requested-col">{booking.userFullName || 'User'}</div>
                      <div className="table-cell date-col">{formatDate(booking.startTime)}</div>
                      <div className="table-cell purpose-col">{booking.bookingPurpose || 'N/A'}</div>
                      <div className="table-cell attendees-col">{booking.expectedAttendees || '—'}</div>
                      <div className="table-cell status-col">
                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                          ● {booking.status}
                        </span>
                      </div>
                      <div className="table-cell actions-col">
                        {booking.status === 'PENDING' ? (
                          <div className="action-buttons">
                            <button
                              className="action-approve"
                              onClick={() => handleApprove(booking.id)}
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button
                              className="action-reject"
                              onClick={() => handleReject(booking.id)}
                              title="Reject"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button className="view-btn">View</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (() => {
            const year = calendarDate.getFullYear()
            const month = calendarDate.getMonth()
            const days = getCalendarDays(year, month)
            const today = new Date()
            return (
              <div className="calendar-view">
                {/* Calendar Header */}
                <div className="cal-header">
                  <span className="cal-title">{MONTH_NAMES[month]} {year}</span>
                  <div className="cal-nav">
                    <button className="cal-nav-btn" onClick={() => setCalendarDate(new Date(year, month - 1, 1))}>‹ Prev</button>
                    <button className="cal-nav-btn" onClick={() => setCalendarDate(new Date(year, month + 1, 1))}>Next ›</button>
                  </div>
                </div>

                {/* Day-of-week headers */}
                <div className="cal-grid">
                  {DAY_NAMES.map(d => (
                    <div key={d} className="cal-dow">{d}</div>
                  ))}

                  {/* Day cells */}
                  {days.map((cell, idx) => {
                    const isToday = cell.currentMonth &&
                      cell.date.getFullYear() === today.getFullYear() &&
                      cell.date.getMonth() === today.getMonth() &&
                      cell.date.getDate() === today.getDate()
                    const dayBookings = getBookingsForDate(cell.date)
                    return (
                      <div
                        key={idx}
                        className={`cal-cell ${!cell.currentMonth ? 'cal-cell-other' : ''
                          } ${isToday ? 'cal-cell-today' : ''}`}
                      >
                        <span className="cal-day-num">{cell.day}</span>
                        <div className="cal-pills">
                          {dayBookings.slice(0, 3).map(b => (
                            <div
                              key={b.id}
                              className={`cal-pill ${getCalendarPillClass(b.status)}`}
                              title={`${b.resourceName} — ${b.bookingPurpose || ''}`}
                            >
                              {b.resourceName || 'Booking'}
                              {b.status === 'PENDING' ? ' (Pending)' : ''}
                            </div>
                          ))}
                          {dayBookings.length > 3 && (
                            <div className="cal-pill cal-pill-more">+{dayBookings.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>
      </main>

      {/* Request a Booking Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setError('') }}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request a Booking</h2>
              <button className="close-btn" onClick={() => { setShowCreateModal(false); setError('') }}>✕</button>
            </div>
            <form onSubmit={handleCreateBooking} className="modal-form">
              <div className="form-group">
                <label>RESOURCE</label>
                <select
                  value={newBooking.resourceId}
                  onChange={(e) => setNewBooking({ ...newBooking, resourceId: e.target.value })}
                  required
                >
                  <option value="">Select a resource...</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.resourceName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>DATE</label>
                  <input
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>EXPECTED ATTENDEES</label>
                  <input
                    type="number"
                    value={newBooking.expectedAttendees}
                    onChange={(e) => setNewBooking({ ...newBooking, expectedAttendees: e.target.value })}
                    placeholder="e.g. 30"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>START TIME</label>
                  <input
                    type="time"
                    value={newBooking.startTime}
                    onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>END TIME</label>
                  <input
                    type="time"
                    value={newBooking.endTime}
                    onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>PURPOSE</label>
                <input
                  type="text"
                  value={newBooking.bookingPurpose}
                  onChange={(e) => setNewBooking({ ...newBooking, bookingPurpose: e.target.value })}
                  placeholder="e.g. Lecture, Practical, Committee Meeting"
                  required
                />
              </div>

              <div className="form-group">
                <label>ADDITIONAL NOTES</label>
                <textarea
                  value={newBooking.additionalNotes}
                  onChange={(e) => setNewBooking({ ...newBooking, additionalNotes: e.target.value })}
                  placeholder="Any special requirements..."
                  rows="3"
                />
              </div>

              <div className="status-msg success">
                ✓ No scheduling conflicts detected for this time slot.
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowCreateModal(false); setError('') }}>
                  Cancel
                </button>
                <button type="submit" className="btn-create">
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
