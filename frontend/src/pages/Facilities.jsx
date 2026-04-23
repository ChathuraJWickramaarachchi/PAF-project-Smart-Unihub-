import React, { useState, useEffect } from 'react'
import { ResourceAPI, BookingAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Facilities() {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedAvailability, setSelectedAvailability] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
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

  useEffect(() => {
    fetchResources()
  }, [])

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

  const fetchResources = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await ResourceAPI.getAll()
      setResources(response.data)
    } catch (err) {
      setError('Failed to load facilities. ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources.filter(res => {
    const matchesSearch = (res.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.resourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.location?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === '' || res.resourceType === selectedType;
    const matchesAvailability = selectedAvailability === '' || 
      (selectedAvailability === 'AVAILABLE' ? res.status === 'ACTIVE' : res.status !== 'ACTIVE');
      
    return matchesSearch && matchesType && matchesAvailability;
  })

  const getStatusDisplay = (status) => {
    switch(status) {
      case 'ACTIVE':
        return { label: 'Active', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-100' }
      case 'MAINTENANCE':
        return { label: 'Maintenance', bgColor: 'bg-rose-50', textColor: 'text-rose-600', borderColor: 'border-rose-100' }
      case 'OUT_OF_SERVICE':
        return { label: 'Out of Service', bgColor: 'bg-rose-50', textColor: 'text-rose-600', borderColor: 'border-rose-100' }
      default:
        return { label: status, bgColor: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-100' }
    }
  }

  const handleBookNow = (resource) => {
    if (resource.status !== 'ACTIVE') {
      setError('This resource is currently not active and cannot be booked.')
      return
    }
    setNewBooking({
      resourceId: resource.id.toString(),
      date: '',
      expectedAttendees: '',
      startTime: '',
      endTime: '',
      bookingPurpose: '',
      additionalNotes: ''
    })
    setShowCreateModal(true)
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
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
        setError('You must be logged in to create a booking')
        return
      }

      await BookingAPI.create(data)
      setShowCreateModal(false)
      setNewBooking({ resourceId: '', date: '', expectedAttendees: '', startTime: '', endTime: '', bookingPurpose: '', additionalNotes: '' })
      alert("Booking request submitted successfully!")
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking. Please check for scheduling conflicts.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 flex flex-col gap-10 selection:bg-primary/10">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gray-900 p-20 rounded-[4rem] group shadow-2xl shadow-gray-200">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-48 -mt-48 group-hover:bg-primary/20 transition-all duration-1000"></div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none italic">
            Campus <span className="text-primary not-italic">Infrastructure</span>
          </h1>
          <p className="max-w-2xl text-gray-400 font-medium text-lg leading-relaxed italic">
            Access the complete inventory of academic and technical facilities.
            Search, filter, and allocate resources in real-time.
          </p>
          <div className="relative w-full max-w-xl group">
            <input
              type="text"
              placeholder="Search classrooms, labs, telemetry nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-12 py-5 text-white placeholder:text-gray-500 font-medium italic focus:ring-2 focus:ring-primary outline-none transition-all"
            />
            <span className="absolute left-4 top-5 text-gray-500 group-focus-within:text-primary transition-colors">🔍</span>
          </div>

          <div className="flex gap-4 w-full max-w-2xl justify-center">
            <div className="relative flex-1 max-w-xs">
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-2xl px-6 py-5 text-gray-900 font-medium italic focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer appearance-none bg-no-repeat"
                style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"8\" viewBox=\"0 0 12 8\"><path fill=\"%23374151\" d=\"M1 1l5 5 5-5\"/></svg>')", backgroundPosition: 'right 14px center', backgroundSize: '16px 12px', paddingRight: '40px'}}
              >
                <option value="">All Resource Types</option>
                <option value="LAB">Laboratory</option>
                <option value="AUDITORIUM">Auditorium</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="SPORTS_FACILITY">Sports Facility</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="PROJECTOR">Projector</option>
                <option value="SMART_BOARD">Smart Board</option>
                <option value="WHITEBOARD">Whiteboard</option>
                <option value="SOUND_SYSTEM">Sound System</option>
                <option value="MICROPHONE">Microphone</option>
                <option value="VR_BOX">VR Box</option>
              </select>
            </div>

            <div className="relative flex-1 max-w-xs">
              <select 
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-2xl px-6 py-5 text-gray-900 font-medium italic focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer appearance-none bg-no-repeat"
                style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"8\" viewBox=\"0 0 12 8\"><path fill=\"%23374151\" d=\"M1 1l5 5 5-5\"/></svg>')", backgroundPosition: 'right 14px center', backgroundSize: '16px 12px', paddingRight: '40px'}}
              >
                <option value="">Any Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center italic text-gray-400 font-black uppercase tracking-widest text-xs">Accessing Facility Matrix...</div>
      ) : error ? (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-[10px] font-black text-rose-700 uppercase tracking-widest animate-fade-in mx-auto max-w-xl w-full">{error}</div>
      ) : filteredResources.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8 animate-fade-in opacity-50 italic grayscale">
          <div className="text-6xl text-gray-300">🕵️</div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">No matching entities in the registry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/20 group hover:-translate-y-1 transition-all cursor-pointer">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-base font-black text-gray-900 tracking-tight italic uppercase truncate">{resource.resourceName}</h3>
                  <span className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest whitespace-nowrap ${resource.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                    {resource.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400 text-[9px] font-black uppercase tracking-widest italic">
                    <span className="text-primary opacity-50">📍</span>
                    <span className="truncate">{resource.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-[9px] font-black uppercase tracking-widest italic">
                    <span className="text-primary opacity-50">👥</span>
                    Cap: {resource.capacity}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic truncate">{resource.resourceType?.replace('_', ' ')}</span>
                  <button className="bg-primary text-white px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-gray-900 transition-colors whitespace-nowrap" onClick={(e) => { e.stopPropagation(); handleBookNow(resource); }}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-700 truncate">
                    {resources.find(r => r.id === newBooking.resourceId)?.resourceName || 'Selected Resource'}
                  </div>
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
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Total Capacity</label>
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
                <input type="number" min="1" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter number of people..." value={newBooking.expectedAttendees} onChange={e => setNewBooking({ ...newBooking, expectedAttendees: e.target.value })} required />
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
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-none">Resource Timeline</label>
                    {loadingSchedule && <span className="text-[9px] text-primary animate-pulse font-bold">RETRIVING...</span>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {dailySchedule.length === 0 && !loadingSchedule ? (
                      <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">✓ Resource fully available</span>
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
              <div className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${!newBooking.date || !newBooking.startTime || !newBooking.endTime
                ? 'bg-gray-50 border-gray-100 text-gray-400'
                : checkingAvailability
                  ? 'bg-blue-50 border-blue-100 text-blue-600 animate-pulse'
                  : isAvailable
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    : 'bg-rose-50 border-rose-100 text-rose-600'
                }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${!isAvailable && newBooking.startTime && newBooking.endTime ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'opacity-50'
                  }`}>
                  {!newBooking.date || !newBooking.startTime || !newBooking.endTime ? '○' : checkingAvailability ? '⌚' : isAvailable ? '✓' : '⚡'}
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold uppercase tracking-tight">
                    {checkingAvailability ? 'Verifying Schedule' : isAvailable ? 'Schedule Clear' : 'Time Conflict'}
                  </span>
                  <span className="text-[10px] font-medium opacity-70 italic">
                    {!newBooking.date || !newBooking.startTime || !newBooking.endTime
                      ? 'Input date and time to run safety check'
                      : checkingAvailability
                        ? 'Scanning database for overlaps...'
                        : isAvailable
                          ? 'Slot is available for reservation'
                          : 'Resource is already allocated for this window.'}
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
                  disabled={!isAvailable || checkingAvailability || !newBooking.date || !newBooking.startTime || !newBooking.endTime}
                  className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${!isAvailable || checkingAvailability || !newBooking.date || !newBooking.startTime || !newBooking.endTime
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-95'
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
  )
}
