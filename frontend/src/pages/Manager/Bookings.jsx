import React, { useState, useEffect } from 'react'
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
      const startDateTime = `${newBooking.date}T${newBooking.startTime}:00`
      const endDateTime = `${newBooking.date}T${newBooking.endTime}:00`

      await BookingAPI.create({
        resourceId: parseInt(newBooking.resourceId),
        startTime: startDateTime,
        endTime: endDateTime,
        bookingPurpose: newBooking.bookingPurpose,
        additionalNotes: newBooking.additionalNotes,
        expectedAttendees: newBooking.expectedAttendees ? parseInt(newBooking.expectedAttendees) : null,
        userId: user?.userId || 1
      })
      setShowCreateModal(false)
      setNewBooking({ resourceId: '', date: '', expectedAttendees: '', startTime: '', endTime: '', bookingPurpose: '', additionalNotes: '' })
      fetchBookings()
    } catch (err) {
      setError('Failed to create booking')
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
    return filteredBookings.filter(b => {
      if (!b.startTime) return false
      const bd = new Date(b.startTime)
      return bd.getFullYear() === date.getFullYear() &&
        bd.getMonth() === date.getMonth() &&
        bd.getDate() === date.getDate()
    })
  }

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  return (
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

            </div>
          </div>

          {/* Content */}
          {viewMode === 'list' ? (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm p-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    <th className="pb-6">ID</th>
                    <th className="pb-6">Resource Asset</th>
                    <th className="pb-6">Initiator</th>
                    <th className="pb-6">Status</th>
                    <th className="pb-6 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map((booking, index) => (
                    <tr key={booking.id || index} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-6 text-[12px] font-bold text-gray-400">#{booking.id?.toString().padStart(4, '0')}</td>
                      <td className="py-6">
                        <div className="text-sm font-bold text-gray-900 tracking-tight">{booking.resourceName || 'System Asset'}</div>
                        <div className="text-[10px] font-medium text-gray-400 italic mt-0.5">{booking.bookingPurpose}</div>
                      </td>
                      <td className="py-6 text-[12px] font-bold text-gray-500 uppercase">{booking.userFullName || 'Anonymous'}</td>
                      <td className="py-6">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${booking.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                          booking.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                            'bg-rose-50 text-rose-600'
                          }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-6 text-right">
                        {booking.status === 'PENDING' ? (
                          <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                            <button className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/20" onClick={() => handleApprove(booking.id)}>✓</button>
                            <button className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20" onClick={() => handleReject(booking.id)}>✕</button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase italic">Validated</span>
                        )}
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
              <div className="flex-1 grid grid-cols-7 grid-rows-6">
                {getCalendarDays(calendarDate.getFullYear(), calendarDate.getMonth()).map((cell, idx) => (
                  <div key={idx} className={`min-h-0 border-r border-b border-gray-50 p-3 flex flex-col gap-2 ${!cell.currentMonth ? 'bg-gray-50/10 opacity-30' : ''}`}>
                    <span className="text-[11px] font-bold text-gray-400 self-end">{cell.day}</span>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      {getBookingsForDate(cell.date).slice(0, 3).map(b => (
                        <div key={b.id} className="px-2 py-1 bg-primary/10 rounded-md text-[8px] font-black text-primary truncate uppercase">{b.resourceName}</div>
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

            <form onSubmit={handleCreateBooking} className="p-6 space-y-5">
              {/* Resource */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Resource</label>
                <select className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" value={newBooking.resourceId} onChange={e => setNewBooking({ ...newBooking, resourceId: e.target.value })} required>
                  <option value="">Select a resource...</option>
                  {resources.map(r => <option key={r.id} value={r.id}>{r.resourceName}</option>)}
                </select>
              </div>

              {/* Date & Expected Attendees */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Date</label>
                  <input type="date" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" value={newBooking.date} onChange={e => setNewBooking({ ...newBooking, date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Expected Attendees</label>
                  <input type="number" min="1" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. 30" value={newBooking.expectedAttendees} onChange={e => setNewBooking({ ...newBooking, expectedAttendees: e.target.value })} />
                </div>
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

              {/* Success Alert */}
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3 flex items-center gap-2">
                <span className="text-[#16a34a] font-bold text-sm">✓</span>
                <span className="text-[#16a34a] text-sm font-medium">No scheduling conflicts detected for this time slot</span>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex justify-end items-center gap-3 border-t border-gray-100 mt-2">
                <button type="button" className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2563eb] rounded-lg hover:bg-[#1d4ed8] focus:ring-2 focus:ring-blue-500/50 transition-colors shadow-sm">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
