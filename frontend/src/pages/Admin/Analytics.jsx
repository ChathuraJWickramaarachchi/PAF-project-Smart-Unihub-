import React, { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import '../Pages.css'
import '../AdminDashboard.css'

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    ticketResolution: [65, 80, 45, 90, 75, 85, 95], // Mock weekly data
    resourceUsage: [55, 70, 85, 40], // Mock usage for different resource types
    activeUsers: 142
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
      <AdminSidebar />
      
      <main className="admin-main-content">
        <div className="admin-header">
          <div className="header-title">System Analytics</div>
          <div className="header-actions">
            <button className="btn-secondary" style={{ marginRight: '1rem' }}>Download Report</button>
            <button className="header-icon-btn">🔔</button>
            <button className="header-icon-btn">👤</button>
          </div>
        </div>

        <div className="admin-content">
          <div className="page-container" style={{ margin: 0, width: '100%', maxWidth: 'none', padding: '1.5rem' }}>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                <p style={{ fontSize: '1.2rem' }}>Crunching numbers...</p>
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
                      <div className="stat-title">SYSTEM UPTIME</div>
                      <span className="stat-icon">⚡</span>
                    </div>
                    <div className="stat-value">99.9%</div>
                    <div className="stat-footer" style={{ color: '#10b981' }}>↑ 0.1% from last month</div>
                  </div>
                  
                  <div className="stat-card" style={{ borderBottomColor: '#10b981' }}>
                    <div className="stat-header">
                      <div className="stat-title">TICKETS RESOLVED</div>
                      <span className="stat-icon">✅</span>
                    </div>
                    <div className="stat-value">482</div>
                    <div className="stat-footer" style={{ color: '#10b981' }}>↑ 12% from last month</div>
                  </div>
                  
                  <div className="stat-card" style={{ borderBottomColor: '#8b5cf6' }}>
                    <div className="stat-header">
                      <div className="stat-title">ACTIVE USERS NOW</div>
                      <span className="stat-icon">👥</span>
                    </div>
                    <div className="stat-value">{stats.activeUsers}</div>
                    <div className="stat-footer">Peak time active</div>
                  </div>
                </div>

                {/* Charts Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                  
                  {/* Mock Bar Chart for Ticket Resolution */}
                  <div style={{ backgroundColor: '#fff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#374151' }}>Weekly Ticket Resolution Rate</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '250px', gap: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                      {stats.ticketResolution.map((val, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ 
                            width: '100%', 
                            height: `${val}%`, 
                            backgroundColor: val > 80 ? '#10b981' : val > 50 ? '#f59e0b' : '#ef4444',
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

                  {/* Mock Resource Usage Distribution */}
                  <div style={{ backgroundColor: '#fff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#374151' }}>Facility Usage</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {[
                        { name: 'Classrooms', val: stats.resourceUsage[0], color: '#3b82f6' },
                        { name: 'Laboratories', val: stats.resourceUsage[1], color: '#8b5cf6' },
                        { name: 'Auditoriums', val: stats.resourceUsage[2], color: '#f59e0b' },
                        { name: 'Equipment', val: stats.resourceUsage[3], color: '#10b981' }
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
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#374151' }}>System Logs</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.875rem' }}>
                          <th style={{ padding: '0.75rem 0' }}>TIMESTAMP</th>
                          <th style={{ padding: '0.75rem 0' }}>EVENT ID</th>
                          <th style={{ padding: '0.75rem 0' }}>DESCRIPTION</th>
                          <th style={{ padding: '0.75rem 0' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { time: '10:45 AM', id: 'EVT-9092', desc: 'Automatic system backup completed successfully.', status: 'SUCCESS', color: '#10b981' },
                          { time: '09:12 AM', id: 'EVT-9091', desc: 'Failed login attempt from unauthorized IP.', status: 'WARNING', color: '#f59e0b' },
                          { time: '08:30 AM', id: 'EVT-9090', desc: 'Database index rebuilt for optimized searching.', status: 'INFO', color: '#3b82f6' }
                        ].map((log, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '0.75rem 0', fontSize: '0.875rem' }}>{log.time}</td>
                            <td style={{ padding: '0.75rem 0', fontSize: '0.875rem', fontWeight: '500' }}>{log.id}</td>
                            <td style={{ padding: '0.75rem 0', fontSize: '0.875rem', color: '#4b5563' }}>{log.desc}</td>
                            <td style={{ padding: '0.75rem 0' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', backgroundColor: `${log.color}20`, color: log.color, borderRadius: '4px' }}>
                                {log.status}
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
