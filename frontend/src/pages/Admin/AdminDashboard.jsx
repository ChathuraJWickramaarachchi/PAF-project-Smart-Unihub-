import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ResourceAPI, BookingAPI, TicketAPI, UserAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'
import '../AdminDashboard.css'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState('dashboard')
  const [stats, setStats] = useState({
    totalResources: 0,
    activeBookings: 0,
    openTickets: 0,
    resolvedToday: 0
  })
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const resourcesResponse = await ResourceAPI.getAll()
      const bookingsResponse = await BookingAPI.getByStatus('APPROVED')
      const ticketsResponse = await TicketAPI.getByStatus('OPEN')
      const allBookings = await BookingAPI.getAll()
      const usersResponse = await UserAPI.getAll()
      
      setStats({
        totalResources: resourcesResponse.data.length,
        activeBookings: bookingsResponse.data.length,
        openTickets: ticketsResponse.data.length,
        resolvedToday: 7 // Mock data
      })
      
      setUsers(usersResponse.data || [])
      
      // Get pending approvals
      setPendingApprovals(allBookings.data.filter(b => b.status === 'PENDING').slice(0, 4))
      
      // Get recent activity (mock)
      setRecentActivity([
        { id: 1, type: 'booking', text: 'Booking #B-0142 approved for Lab B-202', time: '2 min ago', icon: '✓', color: '#10b981' },
        { id: 2, type: 'ticket', text: 'Ticket #T-0089 assigned to Technician Ruwan', time: '18 min ago', icon: '→', color: '#f59e0b' },
        { id: 3, type: 'resource', text: 'Projector #P-014 marked OUT_OF_SERVICE', time: '1h ago', icon: '⚠', color: '#ef4444' },
        { id: 4, type: 'booking', text: '5 new bookings submitted this morning', time: '3 hr ago', icon: '📝', color: '#2563eb' },
        { id: 5, type: 'ticket', text: 'Ticket #T-0085 resolved and closed', time: 'Yesterday', icon: '✓', color: '#8b5cf6' }
      ])
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (loading) return <div className="admin-dashboard"><p>Loading...</p></div>

  return (
    <div className="admin-dashboard">
      <AdminSidebar 
        activeView={activeView} 
        onActiveViewChange={setActiveView} 
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Header */}
        <div className="admin-header">
          <div className="header-title">{activeView === 'dashboard' ? 'Dashboard' : 'Users Management'}</div>
          <div className="header-actions">
            <input type="text" className="search-input" placeholder="Search anything..." />
            <button className="header-icon-btn">🔔</button>
            <button className="header-icon-btn">👤</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="admin-content">
          {activeView === 'dashboard' ? (
            <>
              {/* Stats Grid */}
              <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">TOTAL RESOURCES</div>
                <span className="stat-icon">🏢</span>
              </div>
              <div className="stat-value">{stats.totalResources}</div>
              <div className="stat-footer">12 out of service</div>
            </div>

            <div className="stat-card" style={{ borderBottomColor: '#10b981' }}>
              <div className="stat-header">
                <div className="stat-title">ACTIVE BOOKINGS</div>
                <span className="stat-icon">📅</span>
              </div>
              <div className="stat-value">{stats.activeBookings}</div>
              <div className="stat-footer">8 pending approval</div>
            </div>

            <div className="stat-card" style={{ borderBottomColor: '#f59e0b' }}>
              <div className="stat-header">
                <div className="stat-title">OPEN TICKETS</div>
                <span className="stat-icon">🎫</span>
              </div>
              <div className="stat-value">{stats.openTickets}</div>
              <div className="stat-footer">3 high priority</div>
            </div>

            <div className="stat-card" style={{ borderBottomColor: '#ef4444' }}>
              <div className="stat-header">
                <div className="stat-title">RESOLVED TODAY</div>
                <span className="stat-icon">✅</span>
              </div>
              <div className="stat-value">{stats.resolvedToday}</div>
              <div className="stat-footer">↑ 2 from yesterday</div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="action-cards">
            <div className="action-card">
              <div className="action-icon">📅</div>
              <div className="action-label">New Booking</div>
              <div className="action-description">Reserve a resource</div>
            </div>
            <div className="action-card">
              <div className="action-icon">🐛</div>
              <div className="action-label">Report Issue</div>
              <div className="action-description">Submit a ticket</div>
            </div>
            <div className="action-card">
              <div className="action-icon">🏢</div>
              <div className="action-label">Browse Rooms</div>
              <div className="action-description">Check availability</div>
            </div>
            <div className="action-card">
              <div className="action-icon">📊</div>
              <div className="action-label">Analytics</div>
              <div className="action-description">Usage reports</div>
            </div>
          </div>

          {/* Main Grid - Pending Approvals and Activity */}
          <div className="main-grid">
            {/* Pending Approvals */}
            <div className="approvals-section">
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
                      <div className="table-cell" style={{ flex: 1 }}>{approval.resourceName || 'Lab A-301'}</div>
                      <div className="table-cell" style={{ flex: 1 }}>Kamal P.</div>
                      <div className="table-cell" style={{ flex: 1 }}>Apr 2</div>
                      <div className="table-cell" style={{ flex: 1 }}>
                        <button className="approve-btn">✓ Approve</button>
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

            {/* Recent Activity */}
            <div className="activity-section">
              <div className="section-header">
                <h3>Recent Activity</h3>
              </div>
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div className="activity-item" key={activity.id}>
                    <div className="activity-indicator" style={{ backgroundColor: activity.color }}>
                      {activity.icon}
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">{activity.text}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
            </>
          ) : (
            <>
              {/* Users Table View */}
              <div className="users-section">
                <div className="section-header">
                  <h3>Users Management</h3>
                  <button className="add-user-btn">+ Add User</button>
                </div>
                <div className="users-table">
                  <div className="table-row table-header">
                    <div className="table-cell" style={{ flex: 0.5 }}>ID</div>
                    <div className="table-cell" style={{ flex: 1.5 }}>NAME</div>
                    <div className="table-cell" style={{ flex: 1.5 }}>EMAIL</div>
                    <div className="table-cell" style={{ flex: 1 }}>ROLE</div>
                    <div className="table-cell" style={{ flex: 1 }}>STATUS</div>
                    <div className="table-cell" style={{ flex: 1 }}>ACTIONS</div>
                  </div>
                  {users && users.length > 0 ? (
                    users.map((u, index) => (
                      <div className="table-row" key={u.userId || index}>
                        <div className="table-cell" style={{ flex: 0.5 }}>{u.userId || index + 1}</div>
                        <div className="table-cell" style={{ flex: 1.5 }}>
                          <div className="user-cell">
                            <div className="user-avatar">{u.fullName?.charAt(0).toUpperCase() || 'U'}</div>
                            <span>{u.fullName || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="table-cell" style={{ flex: 1.5 }}>{u.email || 'N/A'}</div>
                        <div className="table-cell" style={{ flex: 1 }}>
                          <span className="role-badge" style={{ backgroundColor: u.role === 'ADMIN' ? '#ef4444' : '#10b981' }}>
                            {u.role || 'USER'}
                          </span>
                        </div>
                        <div className="table-cell" style={{ flex: 1 }}>
                          <span className="status-badge active">Active</span>
                        </div>
                        <div className="table-cell" style={{ flex: 1 }}>
                          <button className="action-btn">✎ Edit</button>
                          <button className="action-btn delete">✕ Delete</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="table-row">
                      <div className="table-cell" colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                        No users found
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
