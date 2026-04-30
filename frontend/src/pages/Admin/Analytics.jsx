import React, { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import { ResourceAPI, BookingAPI, TicketAPI } from '../../services/api'

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    efficiency: 0,
    successfulOps: 0,
    activeNodes: 0,
    ticketResolution: [0, 0, 0, 0, 0, 0, 0],
    facilityEntropy: [
      { name: 'LABORATORY', total: 0, inUse: 0, color: 'bg-amber-400' },
      { name: 'AUDITORIUM', total: 0, inUse: 0, color: 'bg-primary' },
      { name: 'MEETING ROOM', total: 0, inUse: 0, color: 'bg-emerald-400' },
      { name: 'SPORTS FACILITY', total: 0, inUse: 0, color: 'bg-rose-400' },
      { name: 'LECTURE HALL', total: 0, inUse: 0, color: 'bg-rose-400' }
    ]
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [resourcesRes, ticketsRes, bookingsRes] = await Promise.all([
          ResourceAPI.getAll(),
          TicketAPI.getAll(),
          BookingAPI.getAll()
        ])
        
        const resources = resourcesRes.data || []
        const tickets = ticketsRes.data || []
        const bookings = bookingsRes.data || []

        // Calculate Successful Ops (Resolved Tickets)
        const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED')
        const successfulOps = resolvedTickets.length

        // Calculate Active Nodes (Total Resources)
        const activeNodes = resources.length

        // Calculate Efficiency (Active Resources / Total Resources)
        const totalActiveResources = resources.filter(r => r.status === 'ACTIVE').length
        const efficiency = resources.length > 0 
          ? ((totalActiveResources / resources.length) * 100).toFixed(1) 
          : 0

        // Weekly Resolution Cycle (Tickets resolved per day of week)
        const weeklyData = [0, 0, 0, 0, 0, 0, 0] // Mon-Sun
        resolvedTickets.forEach(ticket => {
          if (ticket.updatedAt) {
            const date = new Date(ticket.updatedAt)
            // getDay() is 0 (Sun) to 6 (Sat)
            const dayIdx = date.getDay() === 0 ? 6 : date.getDay() - 1 // Shift so Mon=0, Sun=6
            weeklyData[dayIdx]++
          }
        })
        const maxWeekly = Math.max(...weeklyData, 1) // Prevent division by zero
        const normalizedWeekly = weeklyData.map(val => (val / maxWeekly) * 100)

        // Facility Entropy
        const categories = [
          { key: 'LABORATORY', name: 'LABORATORY' },
          { key: 'AUDITORIUM', name: 'AUDITORIUM' },
          { key: 'MEETING_ROOM', name: 'MEETING ROOM' },
          { key: 'SPORTS_FACILITY', name: 'SPORTS FACILITY' },
          { key: 'LECTURE_HALL', name: 'LECTURE HALL' },
          { key: 'PROJECTOR', name: 'PROJECTOR' },
          { key: 'SMART_BOARD', name: 'SMART BOARD' },
          { key: 'WHITEBOARD', name: 'WHITEBOARD' },
          { key: 'SOUND_SYSTEM', name: 'SOUND SYSTEM' },
          { key: 'MICROPHONE', name: 'MICROPHONE' },
          { key: 'VR_BOX', name: 'VR BOX' }
        ]
        
        const now = new Date()
        const activeBookings = bookings.filter(b => 
          b.status === 'APPROVED' && 
          new Date(b.startTime) <= now && 
          new Date(b.endTime) >= now
        )

        const aliasMap = {
          'LABORATORY': ['LAB', 'LABS', 'LABORATORY', 'LABORATORIES'],
          'AUDITORIUM': ['AUDITORIUM', 'AUDI'],
          'MEETING ROOM': ['MEETING ROOM', 'MEETING', 'MEETING_ROOM'],
          'SPORTS FACILITY': ['SPORTS FACILITY', 'SPORTS', 'SPORT', 'GYM'],
          'LECTURE HALL': ['LECTURE HALL', 'LECTURE', 'HALL', 'CLASSROOM', 'CLASS'],
          'PROJECTOR': ['PROJECTOR'],
          'SMART BOARD': ['SMART BOARD', 'SMARTBOARD'],
          'WHITEBOARD': ['WHITEBOARD', 'WHITE BOARD'],
          'SOUND SYSTEM': ['SOUND SYSTEM', 'SOUND', 'SPEAKER', 'AUDIO'],
          'MICROPHONE': ['MICROPHONE', 'MIC'],
          'VR BOX': ['VR BOX', 'VR', 'VR_BOX']
        }

        const facilityEntropy = categories.map(cat => {
          const catNameUpper = cat.name.toUpperCase()
          const aliases = aliasMap[catNameUpper] || [catNameUpper]
          
          const catResources = resources.filter(r => {
            const type = (r.resourceType || '').toUpperCase().trim()
            return aliases.includes(type) || aliases.some(alias => type.includes(alias) || alias.includes(type.length >= 3 ? type : '---'))
          })
          
          const actualTotal = catResources.length
          const actualActive = catResources.filter(r => r.status === 'ACTIVE').length
          
          return {
            name: cat.name,
            total: actualTotal,
            inUse: actualActive
          }
        })

        setStats({
          efficiency: isNaN(parseFloat(efficiency)) ? 0 : parseFloat(efficiency), 
          successfulOps: successfulOps,
          activeNodes: activeNodes,
          ticketResolution: weeklyData, 
          facilityEntropy: facilityEntropy
        })

      } catch (error) {
        console.error("Failed to load analytics", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black uppercase tracking-widest text-xs text-gray-400">
      Analyzing Telemetry Stream...
    </div>
  )

  return (
    <div className="flex bg-gray-50/50 min-h-screen selection:bg-primary/10">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-gray-900 tracking-tight italic">System <span className="text-primary not-italic">Analytics</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="bg-gray-50 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all border border-gray-100 shadow-sm">Generate Registry</button>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-lg hover:bg-gray-100 transition-colors">🔔</button>
              <button className="w-10 h-10 flex items-center justify-center bg-primary rounded-xl text-lg text-white shadow-lg shadow-primary/20">👤</button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Efficiency</div>
                <div className="text-xl">⚡</div>
              </div>
              <div className="text-4xl font-black text-gray-900 tracking-tighter italic mb-2">{stats.efficiency}%</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Uptime Stabilized</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Successful Ops</div>
                <div className="text-xl">✅</div>
              </div>
              <div className="text-4xl font-black text-gray-900 tracking-tighter italic mb-2">{stats.successfulOps}</div>
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Tickets Resolved</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active Nodes</div>
                <div className="text-xl">👥</div>
              </div>
              <div className="text-4xl font-black text-gray-900 tracking-tighter italic mb-2">{stats.activeNodes}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hardware / Facility Nodes</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-10">
              <div className="flex justify-between items-end">
                <h3 className="text-lg font-black text-gray-900 tracking-tight italic">Weekly <span className="text-primary not-italic">Resolution</span> Cycle</h3>
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Success Probability</div>
              </div>
              <div className="flex items-end justify-between h-64 gap-6 px-4">
                {stats.ticketResolution.map((val, idx) => {
                  const maxVal = Math.max(...stats.ticketResolution, 1);
                  const heightPercent = (val / maxVal) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-4 h-full relative group">
                      <div className="flex-1 w-full flex items-end relative">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          {val}
                        </span>
                        <div 
                          className={`w-full rounded-2xl transition-all duration-1000 bg-rose-400 shadow-lg shadow-rose-400/20`}
                          style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Progress Bars */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-10">
              <h3 className="text-lg font-black text-gray-900 tracking-tight italic">Facility <span className="text-primary not-italic">Entropy</span></h3>
              <div className="space-y-8">
                {stats.facilityEntropy.map(item => {
                  const loadPercent = item.total > 0 ? Math.round((item.inUse / item.total) * 100) : 0;
                  const getLoadColor = (percent) => {
                    if (percent >= 100) return 'bg-emerald-500'; // All active
                    if (percent >= 50) return 'bg-amber-400';    // Some active
                    return 'bg-rose-500';                        // Few/none active
                  };
                  return (
                    <div key={item.name} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-900">{item.name}</span>
                        <span className="text-primary font-bold">{item.inUse}/{item.total} NODES <span className="text-gray-300 ml-1 font-medium">{loadPercent}% ACTIVE</span></span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                        <div className={`h-full ${getLoadColor(loadPercent)} rounded-full transition-all duration-1000`} style={{ width: `${loadPercent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
