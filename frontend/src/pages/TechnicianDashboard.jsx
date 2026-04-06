import React, { useState, useEffect } from 'react'
import { TicketAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Pages.css'

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    pendingTickets: 0,
    assignedToMe: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const openResponse = await TicketAPI.getByStatus('OPEN')
      
      let assignedCount = 0
      if (user?.userId) {
        const assignedResponse = await TicketAPI.getAssigned(user.userId)
        assignedCount = assignedResponse.data.length
      }

      setStats({
        pendingTickets: openResponse.data.length,
        assignedToMe: assignedCount
      })
    } catch (error) {
      console.error('Failed to load technician dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="page-container"><p>Loading Technician Dashboard...</p></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Technician Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Welcome back, Technician {user?.fullName || 'User'}!</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card warning">
          <div className="stat-label">Open System Tickets</div>
          <div className="stat-value">{stats.pendingTickets}</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-label">Tickets Assigned to Me</div>
          <div className="stat-value">{stats.assignedToMe}</div>
        </div>
      </div>
    </div>
  )
}
