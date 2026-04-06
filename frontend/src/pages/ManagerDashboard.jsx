import React, { useState, useEffect } from 'react'
import { BookingAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Pages.css'

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    pendingBookings: 0,
    activeBookings: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const pendingResponse = await BookingAPI.getByStatus('PENDING')
      const activeResponse = await BookingAPI.getByStatus('APPROVED')

      setStats({
        pendingBookings: pendingResponse.data.length,
        activeBookings: activeResponse.data.length
      })
    } catch (error) {
      console.error('Failed to load manager dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="page-container"><p>Loading Manager Dashboard...</p></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Manager Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Welcome back, Manager {user?.fullName || 'User'}!</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card warning">
          <div className="stat-label">Pending Approval Requests</div>
          <div className="stat-value">{stats.pendingBookings}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Total Active Bookings</div>
          <div className="stat-value">{stats.activeBookings}</div>
        </div>
      </div>
    </div>
  )
}
