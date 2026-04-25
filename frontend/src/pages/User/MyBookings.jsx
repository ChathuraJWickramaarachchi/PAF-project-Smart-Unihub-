import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookingAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { FaCalendarCheck, FaPlus, FaSearch, FaFilter, FaClock, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaEye, FaEdit, FaBan, FaTimes, FaSave } from 'react-icons/fa'

export default function UserBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Edit modal state
  const [editingBooking, setEditingBooking] = useState(null)
  const [editForm, setEditForm] = useState({
    bookingPurpose: '',
    expectedAttendees: '',
    additionalNotes: '',
    startTime: '',
    endTime: ''
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  // Cancel state
  const [cancellingId, setCancellingId] = useState(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    try {
      if (user?.userId) {
        const response = await BookingAPI.getByUser(user.userId)
        setBookings(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower.includes('pending')) {
      return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: FaClock, label: 'Pending' }
    }
    if (statusLower.includes('confirm') || statusLower.includes('approved')) {
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: FaCalendarCheck, label: 'Confirmed' }
    }
    if (statusLower.includes('completed')) {
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: FaCheckCircle, label: 'Completed' }
    }
    if (statusLower.includes('cancel') || statusLower.includes('rejected')) {
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: FaTimesCircle, label: 'Cancelled' }
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: FaClock, label: 'Pending' }
  }

  // Helper: check if booking is pending
  const isPending = (status) => {
    return status?.toLowerCase().includes('pending')
  }

  // Helper: check if booking is confirmed/approved
  const isConfirmed = (status) => {
    const s = status?.toLowerCase() || ''
    return s.includes('confirm') || s.includes('approved')
  }

  // Helper: check if booking can be cancelled (pending or confirmed)
  const canCancel = (status) => {
    return isPending(status) || isConfirmed(status)
  }

  // Helper: check if booking can be edited (pending only)
  const canEdit = (status) => {
    return isPending(status)
  }

  // Format datetime for input[type=datetime-local]
  const formatDateTimeForInput = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  // Open edit modal
  const handleEdit = (booking) => {
    setEditingBooking(booking)
    setEditForm({
      bookingPurpose: booking.bookingPurpose || '',
      expectedAttendees: booking.expectedAttendees || '',
      additionalNotes: booking.additionalNotes || '',
      startTime: formatDateTimeForInput(booking.startTime || booking.startDate),
      endTime: formatDateTimeForInput(booking.endTime || booking.endDate)
    })
    setEditError('')
  }

  // Submit edit
  const handleEditSubmit = async () => {
    setEditLoading(true)
    setEditError('')
    try {
      const payload = {
        resourceId: editingBooking.resourceId,
        userId: user?.userId,
        bookingPurpose: editForm.bookingPurpose,
        expectedAttendees: editForm.expectedAttendees ? parseInt(editForm.expectedAttendees) : null,
        additionalNotes: editForm.additionalNotes,
        startTime: editForm.startTime ? new Date(editForm.startTime).toISOString().replace('Z', '') : null,
        endTime: editForm.endTime ? new Date(editForm.endTime).toISOString().replace('Z', '') : null
      }
      await BookingAPI.update(editingBooking._id || editingBooking.id, payload)
      setEditingBooking(null)
      toast.success('Booking updated successfully!')
      await fetchBookings()
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data || 'Failed to update booking. Please try again.'
      setEditError(errMsg)
      toast.error(typeof errMsg === 'string' ? errMsg : 'Failed to update booking')
    } finally {
      setEditLoading(false)
    }
  }

  // Cancel booking
  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId)
    try {
      await BookingAPI.cancel(bookingId)
      setShowCancelConfirm(null)
      toast.success('Booking cancelled successfully')
      await fetchBookings()
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status?.toLowerCase() === filter.toLowerCase()
    const matchesSearch = searchQuery === '' || 
      booking.resourceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-500">View and manage your facility bookings</p>
          </div>
          <button
            onClick={() => navigate('/facilities')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-600/30 font-semibold"
          >
            <FaPlus />
            <span>New Booking</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by facility name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-12 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium min-w-[180px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', count: bookings.length, color: 'gray' },
            { label: 'Pending', count: bookings.filter(b => b.status?.toLowerCase().includes('pending')).length, color: 'amber' },
            { label: 'Confirmed', count: bookings.filter(b => b.status?.toLowerCase().includes('confirm') || b.status?.toLowerCase().includes('approved')).length, color: 'blue' },
            { label: 'Completed', count: bookings.filter(b => b.status?.toLowerCase().includes('completed')).length, color: 'green' },
          ].map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCalendarCheck className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Book your first facility to get started'}
            </p>
            {!searchQuery && filter === 'all' && (
              <button
                onClick={() => navigate('/facilities')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
              >
              <FaPlus />
              <span>Browse Facilities</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const statusStyle = getStatusColor(booking.status)
              const StatusIcon = statusStyle.icon
              
              const startDate = booking.startDate || booking.startTime
              const endDate = booking.endDate || booking.endTime
              
              return (
                <div
                  key={booking._id || booking.id}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                          <FaCalendarAlt className="text-lg text-gray-400 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {booking.resourceName || booking.title || 'Untitled Booking'}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {booking.description || booking.bookingPurpose || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                      <StatusIcon className="text-sm" />
                      <span className="text-sm font-semibold">{statusStyle.label}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      {startDate && (
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span className="font-medium">
                            {new Date(startDate).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                      {startDate && endDate && (
                        <div className="flex items-center gap-2">
                          <FaClock className="text-gray-400" />
                          <span>
                            {new Date(startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Edit button — only for PENDING bookings */}
                      {canEdit(booking.status) && (
                        <button
                          onClick={() => handleEdit(booking)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition-all border border-amber-200"
                          title="Edit this pending booking"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                      )}
                      {/* Cancel button — for PENDING or CONFIRMED bookings */}
                      {canCancel(booking.status) && (
                        <>
                          {showCancelConfirm === (booking._id || booking.id) ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-red-600 font-medium">Are you sure?</span>
                              <button
                                onClick={() => handleCancel(booking._id || booking.id)}
                                disabled={cancellingId === (booking._id || booking.id)}
                                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all disabled:opacity-50"
                              >
                                {cancellingId === (booking._id || booking.id) ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  'Yes, Cancel'
                                )}
                              </button>
                              <button
                                onClick={() => setShowCancelConfirm(null)}
                                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowCancelConfirm(booking._id || booking.id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-200"
                              title={isConfirmed(booking.status) ? 'Cancel this confirmed booking' : 'Cancel this pending booking'}
                            >
                              <FaBan />
                              <span>Cancel</span>
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => navigate('/facilities')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <FaEye />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Booking</h2>
                <p className="text-xs text-gray-500 mt-0.5">{editingBooking.resourceName || 'Facility Booking'}</p>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {typeof editError === 'string' ? editError : 'An error occurred'}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Purpose</label>
                <input
                  type="text"
                  value={editForm.bookingPurpose}
                  onChange={(e) => setEditForm({ ...editForm, bookingPurpose: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                  placeholder="Booking purpose"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expected Attendees</label>
                <input
                  type="number"
                  value={editForm.expectedAttendees}
                  onChange={(e) => setEditForm({ ...editForm, expectedAttendees: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                  placeholder="Number of attendees"
                  min="1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes</label>
                <textarea
                  value={editForm.additionalNotes}
                  onChange={(e) => setEditForm({ ...editForm, additionalNotes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm resize-none"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setEditingBooking(null)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editLoading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50"
              >
                {editLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaSave />
                )}
                <span>{editLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
