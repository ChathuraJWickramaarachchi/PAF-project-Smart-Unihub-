import React, { useState, useEffect } from 'react'
import ManagerSidebar from '../../components/ManagerSidebar'
import '../Pages.css'
import '../AdminDashboard.css'

export default function ManagerAnalytics() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    teamPerformance: [85, 92, 78, 88, 95, 82, 90], // Mock weekly team performance data
    resourceUtilization: [70, 85, 60, 75], // Mock utilization for different resource types
    activeProjects: 24,
    teamMembers: 12
  })

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="admin-dashboard">
      <ManagerSidebar />

      <main className="admin-main-content">
        <div className="admin-header">
          <div className="header-title">Manager Analytics</div>
          <div className="header-actions">
            <button className="btn-secondary" style={{ marginRight: '1rem' }}>Export Report</button>
            <button className="header-icon-btn">🔔</button>
            <button className="header-icon-btn">👤</button>
          </div>
        </div>

        <div className="admin-content">
          <div className="page-container" style={{ margin: 0, width: '100%', maxWidth: 'none', padding: '1.5rem' }}>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                <p style={{ fontSize: '1.2rem' }}>Loading analytics data...</p>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  {/* Summary Cards */}
                  <div className="stat-card" style={{ borderBottomColor: '#3b82f6' }}>
                    <div className="stat-header">
                      <div className="stat-title">ACTIVE PROJECTS</div>
                      <span className="stat-icon">📊</span>
                    </div>
                    <div className="stat-value">{stats.activeProjects}</div>
                    <div className="stat-footer" style={{ color: '#10b981' }}>↑ 3 new this week</div>
                  </div>

                  <div className="stat-card" style={{ borderBottomColor: '#10b981' }}>
                    <div className="stat-header">
                      <div className="stat-title">TEAM PERFORMANCE</div>
                      <span className="stat-icon">🚀</span>
                    </div>
                    <div className="stat-value">87%</div>
                    <div className="stat-footer" style={{ color: '#10b981' }}>↑ 5% from last month</div>
                  </div>

                  <div className="stat-card" style={{ borderBottomColor: '#8b5cf6' }}>
                    <div className="stat-header">
                      <div className="stat-title">TEAM MEMBERS</div>
                      <span className="stat-icon">👥</span>
                    </div>
                    <div className="stat-value">{stats.teamMembers}</div>
                    <div className="stat-footer">All active</div>
                  </div>

                  <div className="stat-card" style={{ borderBottomColor: '#f59e0b' }}>
                    <div className="stat-header">
                      <div className="stat-title">TASKS COMPLETED</div>
                      <span className="stat-icon">✅</span>
                    </div>
                    <div className="stat-value">156</div>
                    <div className="stat-footer" style={{ color: '#10b981' }}>↑ 18% from last month</div>
                  </div>
                </div>

                {/* Charts Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

                  {/* Mock Bar Chart for Team Performance */}
                  <div style={{ backgroundColor: '#fff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#374151' }}>Weekly Team Performance</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '250px', gap: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                      {stats.teamPerformance.map((val, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: '100%',
                            height: `${val}%`,
                            backgroundColor: val > 85 ? '#10b981' : val > 70 ? '#3b82f6' : '#f59e0b',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 1s ease-out'
                          }}></div>
                          <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#6b7280' }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock Resource Utilization Distribution */}
                  <div style={{ backgroundColor: '#fff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#374151' }}>Resource Utilization</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {[
                        { name: 'Meeting Rooms', val: stats.resourceUtilization[0], color: '#3b82f6' },
                        { name: 'Equipment', val: stats.resourceUtilization[1], color: '#8b5cf6' },
                        { name: 'Workspaces', val: stats.resourceUtilization[2], color: '#f59e0b' },
                        { name: 'Parking', val: stats.resourceUtilization[3], color: '#10b981' }
                      ].map(item => (
                        <div key={item.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                            <span>{item.name}</span>
                            <span>{item.val}%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '999px' }}>
                            <div style={{ width: `${item.val}%`, height: '100%', backgroundColor: item.color, borderRadius: '999px' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div style={{ marginTop: '2rem', backgroundColor: '#fff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#374151' }}>Recent Activities</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.875rem' }}>
                          <th style={{ padding: '0.75rem 0' }}>TIME</th>
                          <th style={{ padding: '0.75rem 0' }}>ACTIVITY</th>
                          <th style={{ padding: '0.75rem 0' }}>TEAM MEMBER</th>
                          <th style={{ padding: '0.75rem 0' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { time: '10:45 AM', activity: 'Completed facility inspection', member: 'John Doe', status: 'COMPLETED', color: '#10b981' },
                          { time: '09:30 AM', activity: 'Submitted maintenance request', member: 'Jane Smith', status: 'PENDING', color: '#f59e0b' },
                          { time: '08:15 AM', activity: 'Updated project timeline', member: 'Mike Johnson', status: 'IN PROGRESS', color: '#3b82f6' },
                          { time: 'Yesterday', activity: 'Approved resource booking', member: 'Sarah Wilson', status: 'COMPLETED', color: '#10b981' }
                        ].map((activity, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '0.75rem 0', fontSize: '0.875rem' }}>{activity.time}</td>
                            <td style={{ padding: '0.75rem 0', fontSize: '0.875rem', color: '#4b5563' }}>{activity.activity}</td>
                            <td style={{ padding: '0.75rem 0', fontSize: '0.875rem', fontWeight: '500' }}>{activity.member}</td>
                            <td style={{ padding: '0.75rem 0' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', backgroundColor: `${activity.color}20`, color: activity.color, borderRadius: '4px' }}>
                                {activity.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
