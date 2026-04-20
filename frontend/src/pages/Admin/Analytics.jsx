import React, { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    ticketResolution: [65, 80, 45, 90, 75, 85, 95], // Mock weekly data
    resourceUsage: [55, 70, 85, 40], // Mock usage for different resource types
    activeUsers: 142
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
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
              <div className="text-4xl font-black text-gray-900 tracking-tighter italic mb-2">99.9%</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Uptime Stabilized</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Successful Ops</div>
                <div className="text-xl">✅</div>
              </div>
              <div className="text-4xl font-black text-gray-900 tracking-tighter italic mb-2">482</div>
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Tickets Resolved</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active Nodes</div>
                <div className="text-xl">👥</div>
              </div>
              <div className="text-4xl font-black text-gray-900 tracking-tighter italic mb-2">{stats.activeUsers}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Sessions</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Bar Chart Mockup */}
            <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-10">
              <div className="flex justify-between items-end">
                <h3 className="text-lg font-black text-gray-900 tracking-tight italic">Weekly <span className="text-primary not-italic">Resolution</span> Cycle</h3>
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Success Probability</div>
              </div>
              <div className="flex items-end justify-between h-64 gap-6 px-4">
                {stats.ticketResolution.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-4 h-full">
                    <div className="flex-1 w-full flex items-end">
                      <div 
                        className={`w-full rounded-2xl transition-all duration-1000 ${val > 80 ? 'bg-emerald-400 shadow-lg shadow-emerald-400/20' : val > 50 ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-rose-400 shadow-lg shadow-rose-400/20'}`}
                        style={{ height: `${val}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bars Mockup */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-10">
              <h3 className="text-lg font-black text-gray-900 tracking-tight italic">Facility <span className="text-primary not-italic">Entropy</span></h3>
              <div className="space-y-8">
                {[
                  { name: 'Classrooms', val: stats.resourceUsage[0], color: 'bg-primary' },
                  { name: 'Laboratories', val: stats.resourceUsage[1], color: 'bg-emerald-400' },
                  { name: 'Auditoriums', val: stats.resourceUsage[2], color: 'bg-amber-400' },
                  { name: 'Hardware', val: stats.resourceUsage[3], color: 'bg-rose-400' }
                ].map(item => (
                  <div key={item.name} className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-900">{item.name}</span>
                      <span className="text-gray-300 italic">{item.val}% Load</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-lg font-black text-gray-900 tracking-tight italic">Audit <span className="text-primary not-italic">Telemetry</span></h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-4 py-5 text-[9px] font-black text-gray-300 uppercase tracking-widest">Sequence</th>
                    <th className="px-4 py-5 text-[9px] font-black text-gray-300 uppercase tracking-widest">Identifier</th>
                    <th className="px-4 py-5 text-[9px] font-black text-gray-300 uppercase tracking-widest">Description</th>
                    <th className="px-4 py-5 text-[9px] font-black text-gray-300 uppercase tracking-widest text-right">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { time: '10:45 AM', id: 'EVT-9092', desc: 'Auth protocol success. Global backup stable.', status: 'SUCCESS', color: 'bg-emerald-400' },
                    { time: '09:12 AM', id: 'EVT-9091', desc: 'Illegal access attempt at firewall node 4.', status: 'WARNING', color: 'bg-amber-400' },
                    { time: '08:30 AM', id: 'EVT-9090', desc: 'Optimizing resource indexing in database.', status: 'INFO', color: 'bg-primary' }
                  ].map((log, i) => (
                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-6 text-[11px] font-black text-gray-400 uppercase italic">{log.time}</td>
                      <td className="px-4 py-6 text-sm font-black text-gray-900 tracking-tighter">{log.id}</td>
                      <td className="px-4 py-6 text-sm font-medium text-gray-500 italic">{log.desc}</td>
                      <td className="px-4 py-6 text-right">
                        <span className={`text-[9px] font-black text-white uppercase tracking-widest px-3 py-1 rounded-lg ${log.color} shadow-lg shadow-opacity-20`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
