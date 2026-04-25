import React, { useState, useEffect } from 'react'
import { TicketAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import TechnicianSidebar from '../../components/TechnicianSidebar'

export default function TechnicianAnalytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await TicketAPI.getAll()
      setTickets(res.data || [])
    } catch (err) {
      console.error('Failed to load analytics data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Derived stats
  const totalTickets = tickets.length
  const openCount = tickets.filter(t => t.status === 'OPEN').length
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length
  const closedCount = tickets.filter(t => t.status === 'CLOSED').length

  const urgentCount = tickets.filter(t => t.priority === 'URGENT').length
  const highCount = tickets.filter(t => t.priority === 'HIGH').length
  const mediumCount = tickets.filter(t => t.priority === 'MEDIUM').length
  const lowCount = tickets.filter(t => t.priority === 'LOW').length

  const resolutionRate = totalTickets > 0 ? Math.round(((resolvedCount + closedCount) / totalTickets) * 100) : 0

  // Recent tickets (last 5)
  const recentTickets = [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  // Status distribution for bar chart
  const statusData = [
    { label: 'Open', value: openCount, color: 'bg-amber-500' },
    { label: 'In Progress', value: inProgressCount, color: 'bg-blue-500' },
    { label: 'Resolved', value: resolvedCount, color: 'bg-emerald-500' },
    { label: 'Closed', value: closedCount, color: 'bg-gray-400' },
  ]
  const maxStatusVal = Math.max(...statusData.map(s => s.value), 1)

  // Priority distribution for bar chart
  const priorityData = [
    { label: 'Urgent', value: urgentCount, color: 'bg-rose-500' },
    { label: 'High', value: highCount, color: 'bg-orange-500' },
    { label: 'Medium', value: mediumCount, color: 'bg-amber-400' },
    { label: 'Low', value: lowCount, color: 'bg-emerald-400' },
  ]
  const maxPriorityVal = Math.max(...priorityData.map(p => p.value), 1)

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="flex bg-[#f8fafc] min-h-screen selection:bg-primary/10">
      <TechnicianSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto w-full custom-scrollbar">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 flex justify-between items-center px-12 py-5 sticky top-0 z-10">
          <div className="text-[14px] font-bold text-gray-900 tracking-tight">Technician Analytics</div>
          <div className="flex items-center gap-6">
            <div className="h-8 w-px bg-gray-100"></div>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-lg hover:bg-gray-100">🔔</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">👤</div>
              <div className="text-right hidden sm:block">
                <div className="text-[12px] font-bold text-gray-900 leading-none">{user?.fullName || 'Technician'}</div>
                <div className="text-[10px] font-medium text-gray-400 mt-1">Technician</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-12 space-y-12 max-w-7xl mx-auto w-full">
          {/* Intro */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Maintenance Analytics</h1>
            <p className="text-gray-400 text-sm font-medium">Ticket metrics, resolution trends, and priority breakdown.</p>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Tickets', value: totalTickets, icon: '🎫', desc: 'All recorded incidents', color: 'primary' },
              { title: 'Open Incidents', value: openCount, icon: '⏱️', desc: 'Awaiting assignment', color: 'amber' },
              { title: 'In Progress', value: inProgressCount, icon: '🔧', desc: 'Currently being resolved', color: 'blue' },
              { title: 'Resolution Rate', value: `${resolutionRate}%`, icon: '✅', desc: 'Resolved + Closed', color: 'emerald' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex justify-between items-start group hover:shadow-xl hover:shadow-gray-200/40 transition-all">
                <div className="space-y-6 flex-1">
                  <div className="text-[12px] font-medium text-gray-400 uppercase tracking-widest">{stat.title}</div>
                  <div className="space-y-2">
                    <div className="text-5xl font-black text-gray-900 italic tracking-tighter">{stat.value}</div>
                    <div className="text-[11px] font-medium text-gray-400">{stat.desc}</div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${
                      stat.color === 'amber' ? 'bg-amber-500' :
                      stat.color === 'blue' ? 'bg-blue-500' :
                      stat.color === 'emerald' ? 'bg-emerald-500' :
                      'bg-primary'
                    }`} style={{ width: `${totalTickets > 0 ? Math.min((typeof stat.value === 'number' ? stat.value : resolutionRate) / Math.max(totalTickets, 1) * 100, 100) : 10}%` }}></div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-2xl group-hover:bg-primary/5 group-hover:text-primary transition-colors">{stat.icon}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Distribution Chart */}
            <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 space-y-8">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">Ticket Status Distribution</h3>
                  <p className="text-[12px] font-medium text-gray-400">Current status breakdown of all tickets</p>
                </div>
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full italic">Live Data</div>
              </div>
              <div className="flex items-end gap-6 h-64 border-b border-gray-50 pb-4 mt-8">
                {statusData.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-4 group">
                    <div className="relative w-full flex justify-center">
                      <div
                        style={{ height: `${Math.max((item.value / maxStatusVal) * 100, 4)}%`, minHeight: '8px' }}
                        className={`w-full max-w-[60px] rounded-xl transition-all duration-1000 ${item.color} group-hover:brightness-125 shadow-sm`}
                      ></div>
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold text-gray-900">{item.value}</div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Breakdown (Dark card) */}
            <div className="bg-[#1e293b] p-10 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200/50 space-y-10">
              <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight">Priority Mix</h3>
                <p className="text-[12px] font-medium text-slate-400 italic">Incident severity breakdown</p>
              </div>
              <div className="space-y-8">
                {priorityData.map(item => (
                  <div key={item.label} className="space-y-3 group">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                      <span className="text-slate-400 group-hover:text-white transition-colors">{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div style={{ width: `${Math.max((item.value / maxPriorityVal) * 100, 4)}%` }} className={`h-full ${item.color} transition-all duration-1000 shadow-sm shadow-white/5`}></div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all">View Priority Report</button>
            </div>
          </div>

          {/* Recent Tickets Table */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden p-8 space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recent Incidents</h3>
                <p className="text-[12px] font-medium text-gray-400">Latest ticket activity across the system</p>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last {recentTickets.length} entries</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    <th className="pb-6">Ticket #</th>
                    <th className="pb-6">Title</th>
                    <th className="pb-6">Priority</th>
                    <th className="pb-6">Status</th>
                    <th className="pb-6 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentTickets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-[12px] font-bold text-gray-300 uppercase tracking-widest italic">No ticket data available</td>
                    </tr>
                  ) : (
                    recentTickets.map((ticket, i) => {
                      const priorityStyle = {
                        URGENT: 'text-rose-500 bg-rose-50',
                        HIGH: 'text-orange-500 bg-orange-50',
                        MEDIUM: 'text-amber-500 bg-amber-50',
                        LOW: 'text-emerald-500 bg-emerald-50',
                      }[ticket.priority] || 'text-gray-500 bg-gray-50'

                      const statusStyle = {
                        OPEN: 'text-amber-500 bg-amber-50',
                        IN_PROGRESS: 'text-blue-500 bg-blue-50',
                        RESOLVED: 'text-emerald-500 bg-emerald-50',
                        CLOSED: 'text-gray-500 bg-gray-50',
                      }[ticket.status] || 'text-gray-500 bg-gray-50'

                      return (
                        <tr key={ticket.id || i} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-6 text-sm font-black text-gray-900 italic tracking-tighter">#{ticket.ticketNumber || ticket.id}</td>
                          <td className="py-6 text-[12px] font-bold text-gray-700 tracking-tight max-w-[200px] truncate">{ticket.title}</td>
                          <td className="py-6">
                            <span className={`text-[9px] font-black px-3 py-1 rounded-lg border border-transparent uppercase ${priorityStyle}`}>{ticket.priority}</span>
                          </td>
                          <td className="py-6">
                            <span className={`text-[9px] font-black px-3 py-1 rounded-lg border border-transparent uppercase ${statusStyle}`}>{ticket.status?.replace('_', ' ')}</span>
                          </td>
                          <td className="py-6 text-right text-[12px] font-bold text-gray-400">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
