import React, { useState, useEffect } from 'react'
import { BookingAPI, TicketAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function UserDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    myBookings: 0,
    myTickets: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      let bookingsCount = 0
      let ticketsCount = 0
      if (user?.userId) {
        const bookingsResponse = await BookingAPI.getByUser(user.userId)
        bookingsCount = bookingsResponse.data.length
        const ticketsResponse = await TicketAPI.getByUser(user.userId)
        ticketsCount = ticketsResponse.data.length
      }
      setStats({
        myBookings: bookingsCount,
        myTickets: ticketsCount
      })
    } catch (error) {
      console.error('Failed to load user dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 flex flex-col gap-10 selection:bg-primary/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">👤</div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter italic">Personal <span className="text-primary not-italic">Hub</span></h1>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Session Identity: {user?.fullName || 'Active User'}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all active:scale-95">Activity Log</button>
          <button className="bg-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95">New Request</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 group hover:-translate-y-1 transition-all">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">My Bookings</div>
          <div className="flex items-end justify-between">
            <div className="text-6xl font-black text-gray-900 tracking-tighter italic">{stats.myBookings}</div>
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest pb-2 italic">Active Sequences</div>
          </div>
          <div className="mt-8 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
            <div className={`h-full bg-primary transition-all`} style={{ width: `${Math.min(stats.myBookings * 20, 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 group hover:-translate-y-1 transition-all">
          <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">My Tickets</div>
          <div className="flex items-end justify-between">
            <div className="text-6xl font-black text-gray-900 tracking-tighter italic">{stats.myTickets}</div>
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest pb-2 italic">Reported Nodes</div>
          </div>
          <div className="mt-8 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
            <div className={`h-full bg-amber-500 transition-all`} style={{ width: `${Math.min(stats.myTickets * 20, 100)}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center p-20 text-center opacity-50 italic">
        <div className="text-4xl mb-4">🏠</div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Welcome to your command center.</p>
      </div>
    </div>
  )
}
