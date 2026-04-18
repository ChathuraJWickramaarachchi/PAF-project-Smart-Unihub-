import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookingAPI, ResourceAPI, TicketAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ManagerSidebar from '../../components/ManagerSidebar'
import '../AdminDashboard.css' // We can reuse the same css as AdminDashboard for uniform look

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    pendingBookings: 0,
    activeBookings: 0,
    totalResources: 0,
    openTickets: 0
  })
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const allBookingsResponse = await BookingAPI.getAll()
      const bookings = allBookingsResponse.data || []
      
      const pendingBookings = bookings.filter(b => b.status === 'PENDING')
      const activeBookings = bookings.filter(b => b.status === 'APPROVED')
      
      const resourcesResponse = await ResourceAPI.getAll()
      const ticketsResponse = await TicketAPI.getByStatus('OPEN')

      setStats({
        pendingBookings: pendingBookings.length,
        activeBookings: activeBookings.length,
        totalResources: resourcesResponse.data.length,
        openTickets: ticketsResponse.data.length
      })

      // Get first 4 pending approvals
      setPendingApprovals(pendingBookings.slice(0, 4))
    } catch (error) {
      console.error('Failed to load manager dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="admin-dashboard"><p>Loading Manager Dashboard...</p></div>

  return (
    <div className="admin-dashboard">
      <ManagerSidebar />

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Header */}
        <div className="admin-header">
          <div className="header-title">Dashboard</div>
          <div className="header-actions">
            <input type="text" className="search-input" placeholder="Search anything..." />
            <button className="header-icon-btn">🔔</button>
            <button className="header-icon-btn">👤</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="admin-content">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">TOTAL RESOURCES</div>
                <span className="stat-icon">🏢</span>
              </div>
              <div className="stat-value">{stats.totalResources}</div>
              <div className="stat-footer">Ready for allocation</div>
            </div>

            <div className="stat-card" style={{ borderBottomColor: '#10b981' }}>
              <div className="stat-header">
                <div className="stat-title">ACTIVE BOOKINGS</div>
                <span className="stat-icon">📅</span>
              </div>
              <div className="stat-value">{stats.activeBookings}</div>
              <div className="stat-footer">Ongoing reservations</div>
            </div>

            <div className="stat-card" style={{ borderBottomColor: '#f59e0b' }}>
              <div className="stat-header">
                <div className="stat-title">PENDING APPROVALS</div>
                <span className="stat-icon">⏱️</span>
              </div>
              <div className="stat-value">{stats.pendingBookings}</div>
              <div className="stat-footer">Awaiting your review</div>
            </div>

            <div className="stat-card" style={{ borderBottomColor: '#ef4444' }}>
              <div className="stat-header">
                <div className="stat-title">OPEN TICKETS</div>
                <span className="stat-icon">🎫</span>
              </div>
              <div className="stat-value">{stats.openTickets}</div>
              <div className="stat-footer">Reported issues</div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="action-cards">
            <div className="action-card">
              <div className="action-icon">📅</div>
              <div className="action-label">Review Bookings</div>
              <div className="action-description">Process requests</div>
            </div>
            <div className="action-card">
              <div className="action-icon">🏢</div>
              <div className="action-label">Manage Facilities</div>
              <div className="action-description">Update availability</div>
            </div>
            <div className="action-card">
              <div className="action-icon">📊</div>
              <div className="action-label">Analytics</div>
              <div className="action-description">View reports</div>
            </div>
          </div>

          {/* Main Grid - Pending Approvals */}
          <div className="main-grid">
            <div className="approvals-section" style={{ gridColumn: 'span 2' }}>
              <div className="section-header">
                <h3>Pending Approvals</h3>
                <Link to="/bookings" className="view-all">View all →</Link>
              </div>
              <div className="approvals-table">
                <div className="table-row table-header">
                  <div className="table-cell" style={{ flex: 1 }}>RESOURCE</div>
                  <div className="table-cell" style={{ flex: 1 }}>REQUESTED BY</div>
                  <div className="table-cell" style={{ flex: 1 }}>DATE</div>
                  <div className="table-cell" style={{ flex: 1 }}>ACTION</div>
                </div>
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.map((approval) => (
                    <div className="table-row" key={approval.bookingId}>
                      <div className="table-cell" style={{ flex: 1 }}>{approval.resourceName || `Resource #${approval.resourceId}`}</div>
                      <div className="table-cell" style={{ flex: 1 }}>{approval.userName || `User #${approval.userId}`}</div>
                      <div className="table-cell" style={{ flex: 1 }}>{new Date(approval.startTime).toLocaleDateString()}</div>
                      <div className="table-cell" style={{ flex: 1 }}>
                        <Link to="/bookings" className="approve-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>Review</Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="table-row">
                    <div className="table-cell" colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                       No pending approvals
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
