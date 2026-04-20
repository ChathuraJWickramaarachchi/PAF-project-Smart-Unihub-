import React, { useState, useEffect } from 'react'
import { TicketAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import TechnicianSidebar from '../../components/TechnicianSidebar'

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
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

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="flex bg-[#f8fafc] min-h-screen selection:bg-primary/10">
      <TechnicianSidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto w-full custom-scrollbar">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 flex justify-between items-center px-12 py-5 sticky top-0 z-10">
          <div className="text-[14px] font-bold text-gray-900 tracking-tight">Dashboard Overview</div>
          <div className="flex items-center gap-6">
            <div className="h-8 w-px bg-gray-100"></div>
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
          {/* Intro Section */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Field Operations</h1>
            <p className="text-gray-400 text-sm font-medium">Real-time maintenance logs and ticket assignments.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <button className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:shadow-sm transition-all focus:ring-2 focus:ring-primary/20">
                <span className="text-lg">🎫</span>
                <span className="text-[12px] font-bold text-gray-700">My Tickets</span>
              </button>
              <button className="flex items-center gap-3 px-8 py-3 bg-[#1e293b] rounded-xl text-white shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all font-bold text-[12px]">
                Report Protocol
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'Pending Telemetry', value: stats.pendingTickets, desc: 'Across global stack', icon: '⏱️', color: 'amber' },
              { title: 'Direct Assignments', value: stats.assignedToMe, desc: 'Sequences assigned to you', icon: '🔧', color: 'blue' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex justify-between items-start group hover:shadow-xl hover:shadow-gray-200/40 transition-all">
                <div className="space-y-6 flex-1">
                  <div className="text-[12px] font-medium text-gray-400 uppercase tracking-widest">{stat.title}</div>
                  <div className="space-y-2">
                    <div className="text-5xl font-black text-gray-900 italic tracking-tighter">{stat.value}</div>
                    <div className="text-[11px] font-medium text-gray-400">{stat.desc}</div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${stat.color === 'amber' ? 'bg-amber-500 w-1/3' : 'bg-primary w-1/2'}`}></div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-2xl group-hover:bg-primary/5 group-hover:text-primary transition-colors">{stat.icon}</div>
              </div>
            ))}
          </div>

          {/* Action Panel / Table Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 p-10 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-3xl">🛰️</div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Active Ticket Stream</h2>
                <p className="text-[12px] text-gray-400 font-medium max-w-xs mx-auto">No high-priority incidents currently assigned to your node. Synchronization complete.</p>
              </div>
              <button className="px-8 py-3 bg-gray-50 text-gray-600 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">Refresh Stack</button>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 space-y-8 h-full">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">Internal Comms</h2>
                  <p className="text-[12px] text-gray-400 font-medium">Node to Node messaging</p>
                </div>
                <div className="space-y-4">
                  {[
                    { from: 'Admin', text: 'Please check Lab B-202 projector', time: '10m ago' },
                    { from: 'Manager', text: 'A/C maintenance confirmed', time: '1h ago' }
                  ].map((msg, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase text-primary">{msg.from}</span>
                        <span className="text-[9px] text-gray-400 font-medium">{msg.time}</span>
                      </div>
                      <p className="text-[12px] font-bold text-gray-700 leading-snug">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
