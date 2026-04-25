import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookingAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { FaCalendarCheck, FaPlus, FaSearch, FaFilter, FaClock, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaEye } from 'react-icons/fa'

export default function UserBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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
                            {booking.description || 'No description provided'}
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
                    <button
                      onClick={() => navigate('/facilities')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <FaEye />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
