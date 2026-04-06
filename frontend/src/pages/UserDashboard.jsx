import React, { useState, useEffect } from 'react'
import { BookingAPI, TicketAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Pages.css'

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

  if (loading) return <div className="page-container"><p>Loading User Dashboard...</p></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Welcome back, {user?.fullName || 'User'}!</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-label">My Bookings</div>
          <div className="stat-value">{stats.myBookings}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">My Tickets</div>
          <div className="stat-value">{stats.myTickets}</div>
        </div>
      </div>
    </div>
  )
}
