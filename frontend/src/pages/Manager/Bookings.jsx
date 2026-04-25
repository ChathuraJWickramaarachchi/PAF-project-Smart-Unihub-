import React, { useState, useEffect, useCallback } from 'react'
import { BookingAPI, ResourceAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ManagerSidebar from '../../components/ManagerSidebar'
import { Link } from 'react-router-dom'

export default function Bookings() {
  const { user, logout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewMode, setViewMode] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
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
  const [isAvailable, setIsAvailable] = useState(true)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [dailySchedule, setDailySchedule] = useState([])
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // holds booking id to delete

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  useEffect(() => {
    if (showCreateModal) {
      fetchResources()
    }
  }, [showCreateModal])

  useEffect(() => {
    const checkConflict = async () => {
      if (newBooking.resourceId && newBooking.date && newBooking.startTime && newBooking.endTime) {
        setCheckingAvailability(true)
        try {
          const start = `${newBooking.date}T${newBooking.startTime}:00`
          const end = `${newBooking.date}T${newBooking.endTime}:00`
          const response = await BookingAPI.checkAvailability(newBooking.resourceId, start, end)
          setIsAvailable(response.data)
        } catch (err) {
          console.error("Conflict check failed", err)
          setIsAvailable(true)
        } finally {
          setCheckingAvailability(false)
        }
      }
    }
    checkConflict()
  }, [newBooking.resourceId, newBooking.date, newBooking.startTime, newBooking.endTime])

  useEffect(() => {
    const fetchDailySchedule = async () => {
      if (newBooking.resourceId && newBooking.date) {
        setLoadingSchedule(true)
        try {
          const response = await BookingAPI.getDailySchedule(newBooking.resourceId, newBooking.date)
          setDailySchedule(response.data)
        } catch (err) {
          console.error("Failed to fetch daily schedule", err)
        } finally {
          setLoadingSchedule(false)
        }
      } else {
        setDailySchedule([])
      }
    }
    fetchDailySchedule()
  }, [newBooking.resourceId, newBooking.date])

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
      setViewMode('calendar')
      showToast('Booking Accepted!')
    } catch (err) {
      setError('Failed to approve booking')
    }
  }

  const handleReject = async (id) => {
    try {
      await BookingAPI.reject(id, 'Rejected')
      fetchBookings()
      showToast('Booking Rejected!', 'error')
    } catch (err) {
      setError('Failed to reject booking')
    }
  }

  const handleDelete = (id) => {
    if (!id) {
      setError('Invalid booking ID')
      return
    }
    setConfirmDelete(id) // open custom confirm dialog
  }

  const confirmDeleteExecute = async () => {
    const id = confirmDelete
    setConfirmDelete(null)
    try {
      await BookingAPI.delete(id)
      fetchBookings()
      showToast('Booking Deleted!', 'error')
    } catch (err) {
      console.error('Delete error:', err.response?.data || err)
      setError(`Failed to delete booking: ${err.response?.data?.message || 'Server error'}`)
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
    if (loading) return // Prevent double-submit
    setLoading(true)
    setError('')
    try {
      const startDateTime = `${newBooking.date}T${newBooking.startTime}:00`
      const endDateTime = `${newBooking.date}T${newBooking.endTime}:00`

      const data = {
        resourceId: newBooking.resourceId,
        startTime: startDateTime,
        endTime: endDateTime,
        bookingPurpose: newBooking.bookingPurpose,
        additionalNotes: newBooking.additionalNotes,
        expectedAttendees: newBooking.expectedAttendees ? parseInt(newBooking.expectedAttendees) : null,
        userId: user?.userId || user?.id
      }

      if (!data.userId) {
        setError('Session expired. Please log in again.')
        return
      }

      await BookingAPI.create(data)
      setShowCreateModal(false)
      setNewBooking({ resourceId: '', date: '', expectedAttendees: '', startTime: '', endTime: '', bookingPurpose: '', additionalNotes: '' })
      fetchBookings()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking')
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

  const getCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    const days = []
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, currentMonth: false, date: new Date(year, month - 1, daysInPrevMonth - i) })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, currentMonth: true, date: new Date(year, month, d) })
    }
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) })
    }
    return days
  }

  const filteredBookings = bookings.filter(booking => {
    const query = searchQuery.toLowerCase()
    return (
      (booking.id && booking.id.toString().includes(query)) ||
      (booking.resourceName && booking.resourceName.toLowerCase().includes(query)) ||
      (booking.userFullName && booking.userFullName.toLowerCase().includes(query)) ||
      (booking.bookingPurpose && booking.bookingPurpose.toLowerCase().includes(query))
    )
  })

  const getBookingsForDate = (date) => {
    const seen = new Set()
    return filteredBookings.filter(b => {
      if (!b.startTime || seen.has(b.id)) return false
      const bd = new Date(b.startTime)
      const isMatch = bd.getFullYear() === date.getFullYear() &&
        bd.getMonth() === date.getMonth() &&
        bd.getDate() === date.getDate()

      if (isMatch) {
        seen.add(b.id)
        return true
      }
      return false
    })
  }

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const exportReport = () => {
    if (filteredBookings.length === 0) {
      showToast('No bookings to export!', 'error')
      return
    }

    const headers = [
      'Booking ID', 'Resource', 'Location', 'Capacity',
      'Date', 'Start Time', 'End Time', 'Duration (hrs)',
      'Purpose', 'Expected Attendees', 'Additional Notes',
      'User', 'Email', 'Status', 'Approval Notes'
    ]

    const fmt = (dt) => dt ? new Date(dt).toLocaleString() : ''
    const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString() : ''
    const fmtTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    const duration = (start, end) => {
      if (!start || !end) return ''
      return ((new Date(end) - new Date(start)) / 3600000).toFixed(2)
    }
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`

    const rows = filteredBookings.map(b => [
      esc(b.id),
      esc(b.resourceName),
      esc(b.location),
      esc(b.resourceCapacity),
      esc(fmtDate(b.startTime)),
      esc(fmtTime(b.startTime)),
      esc(fmtTime(b.endTime)),
      esc(duration(b.startTime, b.endTime)),
      esc(b.bookingPurpose),
      esc(b.expectedAttendees),
      esc(b.additionalNotes),
      esc(b.userFullName),
      esc(b.userEmail),
      esc(b.status),
      esc(b.approvalNotes),
    ].join(','))

    const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `booking_report_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Exported ${filteredBookings.length} booking(s)!`)
  }

  return (
    <>
      <div className="flex bg-[#f8fafc] min-h-screen selection:bg-primary/10">
        <ManagerSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 h-screen overflow-y-auto w-full custom-scrollbar">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-100 flex justify-between items-center px-12 py-5 sticky top-0 z-10">
            <div className="text-[14px] font-bold text-gray-900 tracking-tight">Booking Management</div>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-[12px] w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                  placeholder="Find booking..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="absolute left-3.5 top-2.5 text-gray-400 text-xs">🔍</span>
              </div>
              <div className="h-8 w-px bg-gray-100"></div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">👤</div>
                <div className="text-right hidden sm:block">
                  <div className="text-[12px] font-bold text-gray-900 leading-none">{user?.fullName || 'Manager'}</div>
                  <div className="text-[10px] font-medium text-gray-400 mt-1">Manager</div>
                </div>
                <span className="text-gray-300 text-[10px] ml-1">▼</span>
              </div>
            </div>
          </header>

          <div className="p-12 space-y-12 max-w-7xl mx-auto">
            {error && (
              <div className="bg-rose-50 border-white border-l-4 border-l-rose-500 text-rose-700 p-6 rounded-2xl shadow-sm animate-shake">
                <p className="font-bold text-xs uppercase tracking-widest">{error}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                <button
                  className={`px-8 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-tight transition-all ${viewMode === 'list' ? 'bg-[#1e293b] text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                  onClick={() => setViewMode('list')}
                >
                  List View
                </button>
                <button
                  className={`px-8 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-tight transition-all ${viewMode === 'calendar' ? 'bg-[#1e293b] text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                  onClick={() => setViewMode('calendar')}
                >
                  Calender
                </button>
              </div>

              <div className="flex items-center gap-3">
                <select
                  className="bg-white border-gray-100 text-[12px] font-bold text-gray-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {['All', 'Pending', 'Approved', 'Rejected'].map(s => <option key={s} value={s}>{s} Status</option>)}
                </select>
                <button
                  onClick={exportReport}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors active:scale-95"
                >
                  <span className="text-sm">⬇</span>
                  <span className="text-[12px] font-bold uppercase tracking-wide">Export Report</span>
                </button>
              </div>
            </div>

            {/* Content */}
            {viewMode === 'list' ? (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm p-8">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                      <th className="pb-6">Resource / Location</th>
                      <th className="pb-6">Schedule</th>
                      <th className="pb-6">User</th>
                      <th className="pb-6">Email</th>
                      <th className="pb-6">Status</th>
                      <th className="pb-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.map((booking, index) => (
                      <tr key={booking.id || index} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-6">
                          <div className="text-sm font-bold text-gray-900 tracking-tight">{booking.resourceName || 'System Asset'}</div>
                          <div className="text-[10px] font-medium text-gray-500 italic mt-0.5">{booking.bookingPurpose}</div>
                          <div className="text-[9px] font-black text-primary uppercase tracking-widest mt-1 opacity-60">
                            {booking.location || 'Central Wing'} • Cap: {booking.resourceCapacity || '60'}
                          </div>
                        </td>
                        <td className="py-6">
                          <div className="text-[11px] font-bold text-gray-700">{new Date(booking.startTime).toLocaleDateString()}</div>
                          <div className="text-[10px] font-medium text-gray-400 italic">
                            {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-6 text-[12px] font-bold text-gray-500 uppercase">{booking.userFullName || 'Anonymous'}</td>
                        <td className="py-6 text-[11px] font-medium text-gray-400 lowercase italic">{booking.userEmail}</td>
                        <td className="py-6">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${booking.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                            booking.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                              'bg-rose-50 text-rose-600'
                            }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          <div className="flex gap-2 justify-end transition-all">
                            {booking.status === 'PENDING' && (
                              <>
                                <button className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all" onClick={() => handleApprove(booking.id || booking._id)} title="Approve">✓</button>
                                <button className="w-10 h-10 flex items-center justify-center bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all" onClick={() => handleReject(booking.id || booking._id)} title="Reject">✕</button>
                              </>
                            )}
                            <button className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 hover:scale-110 active:scale-95 transition-all" onClick={() => handleDelete(booking.id || booking._id)} title="Delete">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Calendar View Simplified Redesign */
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
                <div className="px-10 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">{MONTH_NAMES[calendarDate.getMonth()]} {calendarDate.getFullYear()}</h3>
                  <div className="flex gap-2">
                    <button className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}>‹</button>
                    <button className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}>›</button>
                  </div>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/30">
                  {DAY_NAMES.map(day => (
                    <div key={day} className="py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
                  ))}
                </div>

                <div className="flex-1 grid grid-cols-7 grid-rows-6">
                  {getCalendarDays(calendarDate.getFullYear(), calendarDate.getMonth()).map((cell, idx) => (
                    <div key={idx} className={`min-h-0 border-r border-b border-gray-50 p-3 flex flex-col gap-2 ${!cell.currentMonth ? 'bg-gray-50/10 opacity-30' : ''}`}>
                      <span className="text-[11px] font-bold text-gray-400 self-end">{cell.day}</span>
                      <div className="flex flex-col gap-1 overflow-hidden">
                        {getBookingsForDate(cell.date).slice(0, 3).map(b => (
                          <div key={b.id} className="px-2 py-1 bg-primary/10 rounded-md text-[7px] font-black text-primary truncate uppercase flex justify-between items-center">
                            <span>{b.resourceName}</span>
                            <span className="opacity-50 text-[6px] ml-1">
                              {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Modal Redesign */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-zoom-in" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#1f2937] tracking-wide">Request a Booking</h2>
                <button type="button" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors" onClick={() => setShowCreateModal(false)}>✕</button>
              </div>

              {error && (
                <div className="mx-6 mt-6 bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 animate-shake">
                  <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold">!</div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest leading-none">Scheduling Error</span>
                    <span className="text-[12px] font-medium text-rose-500">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Resource & Location Info */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Resource</label>
                    <select className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" value={newBooking.resourceId} onChange={e => setNewBooking({ ...newBooking, resourceId: e.target.value })} required>
                      <option value="">Select a resource...</option>
                      {resources.map(r => <option key={r.id} value={r.id}>{r.resourceName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Location</label>
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-primary truncate">
                      {resources.find(r => r.id === newBooking.resourceId)?.location || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Capacity & Date */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Capacity</label>
                    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-black text-gray-600">
                      {resources.find(r => r.id === newBooking.resourceId)?.capacity || '0'} People
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Date</label>
                    <input type="date" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" value={newBooking.date} onChange={e => setNewBooking({ ...newBooking, date: e.target.value })} required />
                  </div>
                </div>

                {/* Expected Attendees */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Expected Attendees</label>
                  <input type="number" min="1" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. 30" value={newBooking.expectedAttendees} onChange={e => setNewBooking({ ...newBooking, expectedAttendees: e.target.value })} />
                </div>

                {/* Start Time & End Time */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Start Time</label>
                    <input type="time" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" value={newBooking.startTime} onChange={e => setNewBooking({ ...newBooking, startTime: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">End Time</label>
                    <input type="time" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" value={newBooking.endTime} onChange={e => setNewBooking({ ...newBooking, endTime: e.target.value })} required />
                  </div>
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Purpose</label>
                  <input type="text" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. Lecture, Practical, Committee Meeting..." value={newBooking.bookingPurpose} onChange={e => setNewBooking({ ...newBooking, bookingPurpose: e.target.value })} required />
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Additional Notes</label>
                  <textarea className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24" placeholder="Any special requirements..." value={newBooking.additionalNotes} onChange={e => setNewBooking({ ...newBooking, additionalNotes: e.target.value })}></textarea>
                </div>

                {/* Daily Schedule Visalization */}
                {newBooking.resourceId && newBooking.date && (
                  <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Occupancy Timeline</label>
                      {loadingSchedule && <span className="text-[9px] text-primary animate-pulse font-bold">RETRIVING...</span>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {dailySchedule.length === 0 && !loadingSchedule ? (
                        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">✓ Resource fully available for this date</span>
                      ) : (
                        dailySchedule.map((slot, i) => (
                          <div key={i} className="flex flex-col items-center px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl">
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">Occupied</span>
                            <span className="text-[9px] font-bold text-rose-400">
                              {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Availability Alert */}
                <div className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${!newBooking.resourceId || !newBooking.date || !newBooking.startTime || !newBooking.endTime
                  ? 'bg-gray-50 border-gray-100 text-gray-400'
                  : checkingAvailability
                    ? 'bg-blue-50 border-blue-100 text-blue-600 animate-pulse'
                    : isAvailable
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : 'bg-rose-50 border-rose-100 text-rose-600'
                  }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${!isAvailable && newBooking.startTime && newBooking.endTime ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'opacity-50'
                    }`}>
                    {!newBooking.resourceId || !newBooking.date || !newBooking.startTime || !newBooking.endTime ? '○' : checkingAvailability ? '⌚' : isAvailable ? '✓' : '⚡'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-black uppercase tracking-widest">
                      {checkingAvailability ? 'Validation in progress' : isAvailable ? 'Sequence Approved' : 'CRITICAL CONFLICT'}
                    </span>
                    <span className="text-[10px] font-bold opacity-90 uppercase tracking-tighter">
                      {!newBooking.resourceId || !newBooking.date || !newBooking.startTime || !newBooking.endTime
                        ? 'Specify target parameters to initialize safety check'
                        : checkingAvailability
                          ? 'Cross-referencing temporal datasets...'
                          : isAvailable
                            ? '✓ Spatial-temporal window is clear for allocation'
                            : '✕ OPERATIONAL COLLISION: RESOURCE IS BANNED FOR THIS SLOT'}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 flex justify-end items-center gap-3 border-t border-gray-100 mt-2">
                  <button type="button" className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isAvailable || checkingAvailability || !newBooking.resourceId || !newBooking.date || !newBooking.startTime || !newBooking.endTime}
                    className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${!isAvailable || checkingAvailability || !newBooking.resourceId || !newBooking.date || !newBooking.startTime || !newBooking.endTime
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-[#1e293b] hover:bg-black active:scale-95'
                      }`}
                  >
                    {checkingAvailability ? 'Verifying...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)',
          }}
        >
          <div
            style={{
              background: '#fff', borderRadius: '1.5rem',
              padding: '2.5rem 2rem', width: '100%', maxWidth: '400px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem',
              animation: 'slideInToast 0.3s cubic-bezier(.21,1.02,.73,1) forwards',
            }}
          >
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>🗑️</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827', marginBottom: '0.4rem' }}>Delete Booking?</div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 500 }}>This action is permanent and cannot be undone.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  fontWeight: 700, fontSize: '0.85rem', color: '#374151',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExecute}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                  border: 'none', background: '#ef4444',
                  fontWeight: 700, fontSize: '0.85rem', color: '#fff',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
                onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: toast.type === 'success' ? '#059669' : '#dc2626',
            color: '#fff',
            padding: '1rem 1.5rem',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            fontWeight: 700,
            fontSize: '0.95rem',
            letterSpacing: '0.02em',
            animation: 'slideInToast 0.35s cubic-bezier(.21,1.02,.73,1) forwards',
          }}
        >
          <span style={{ fontSize: '1.3rem' }}>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateY(2rem) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </>
  )
}
