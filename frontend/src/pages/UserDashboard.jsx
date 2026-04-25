import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookingAPI, TicketAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FaCalendarCheck, FaTicketAlt, FaArrowRight, FaPlus, FaClock, FaCheckCircle } from 'react-icons/fa'

export default function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.fullName || 'User'}! 👋</h1>
              <p className="text-blue-100 text-lg">Here's what's happening with your account today</p>
            </div>
            <div className="hidden md:block text-8xl opacity-20">🎓</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => navigate('/user/bookings')}
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <FaCalendarCheck className="text-3xl text-white" />
              </div>
              <FaArrowRight className="text-2xl text-gray-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300" />
            </div>
            <p className="text-5xl font-bold text-gray-900 mb-2">{stats.myBookings}</p>
            <p className="text-gray-500 font-medium">Total Bookings</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-blue-600 font-semibold group-hover:underline">View all bookings →</span>
            </div>
          </div>

          <div 
            onClick={() => navigate('/user/tickets')}
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30">
                <FaTicketAlt className="text-3xl text-white" />
              </div>
              <FaArrowRight className="text-2xl text-gray-300 group-hover:text-purple-600 group-hover:translate-x-2 transition-all duration-300" />
            </div>
            <p className="text-5xl font-bold text-gray-900 mb-2">{stats.myTickets}</p>
            <p className="text-gray-500 font-medium">Total Tickets</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-purple-600 font-semibold group-hover:underline">View all tickets →</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/facilities')}
              className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-200 group"
            >
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <FaPlus className="text-2xl text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">New Booking</p>
                <p className="text-sm text-gray-500">Book a facility</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/tickets')}
              className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all border border-purple-200 group"
            >
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <FaTicketAlt className="text-2xl text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Create Ticket</p>
                <p className="text-sm text-gray-500">Report an issue</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/user/profile')}
              className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all border border-green-200 group"
            >
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">Profile</p>
                <p className="text-sm text-gray-500">Update settings</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 font-semibold hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {[
              { icon: FaCalendarCheck, color: 'blue', title: 'Booked Conference Room A', time: '2 hours ago', status: 'Confirmed' },
              { icon: FaTicketAlt, color: 'purple', title: 'Submitted maintenance ticket', time: '1 day ago', status: 'In Progress' },
              { icon: FaCheckCircle, color: 'green', title: 'Booking completed - Lab Room 101', time: '3 days ago', status: 'Completed' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                <div className={`p-3 bg-${activity.color}-100 rounded-xl`}>
                  <activity.icon className={`text-xl text-${activity.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${activity.color}-100 text-${activity.color}-700`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
