import React, { useState, useEffect } from 'react'
import ManagerSidebar from '../../components/ManagerSidebar'

export default function ManagerAnalytics() {
  const [loading, setLoading] = useState(true)
  const [stats] = useState({
    teamPerformance: [85, 92, 78, 88, 95, 82, 90],
    resourceUtilization: [70, 85, 60, 75],
    activeProjects: 24,
    teamMembers: 12
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row shadow-2xl shadow-gray-200 selection:bg-primary/10">
      <ManagerSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto w-full custom-scrollbar">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 flex justify-between items-center px-12 py-5 sticky top-0 z-10">
           <div className="text-[14px] font-bold text-gray-900 tracking-tight">System Analytics</div>
           <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                <span className="text-[12px] font-bold">Export Report</span>
              </button>
              <div className="h-8 w-px bg-gray-100"></div>
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">👤</div>
                 <div className="text-right hidden sm:block">
                    <div className="text-[12px] font-bold text-gray-900 leading-none">Manager</div>
                    <div className="text-[10px] font-medium text-gray-400 mt-1">Telemetry Ops</div>
                 </div>
              </div>
           </div>
        </header>

        <div className="p-12 space-y-12 max-w-7xl mx-auto">
          {loading ? (
             <div className="min-h-[400px] flex items-center justify-center text-[12px] font-bold text-gray-400 uppercase tracking-widest animate-pulse italic">Synchronizing Data Matrix...</div>
          ) : (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Active Projects', value: stats.activeProjects, icon: '📊', trend: '↑ 3 new' },
                  { label: 'Team Efficiency', value: '87%', icon: '🚀', trend: '↑ 5%' },
                  { label: 'Registry Nodes', value: stats.teamMembers, icon: '👥', trend: 'All active' },
                  { label: 'Protocols Ready', value: '156', icon: '✅', trend: '↑ 18%' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-gray-200/40 transition-all flex justify-between items-start group">
                    <div className="space-y-4">
                       <span className="text-[12px] font-medium text-gray-400">{stat.label}</span>
                       <div className="space-y-1">
                          <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                          <div className="text-[11px] font-bold text-emerald-500">{stat.trend}</div>
                       </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">{stat.icon}</div>
                  </div>
                ))}
              </div>

              {/* Data Visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Team Performance Chart */}
                 <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 space-y-8">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Team Velocity</h3>
                          <p className="text-[12px] font-medium text-gray-400">Weekly Efficiency Telemetry</p>
                       </div>
                       <div className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full italic">Real-time feed</div>
                    </div>
                    <div className="flex items-end gap-3 h-64 border-b border-gray-50 pb-4 mt-8">
                       {stats.teamPerformance.map((val, idx) => (
                         <div key={idx} className="flex-1 flex flex-col items-center gap-4 group">
                            <div className="relative w-full">
                               <div 
                                 style={{ height: `${val}%` }} 
                                 className={`w-full rounded-xl transition-all duration-1000 ${val > 90 ? 'bg-primary' : 'bg-slate-800'} group-hover:brightness-125 shadow-sm`}
                               ></div>
                               <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-900">{val}%</div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-300 uppercase">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Resource Allocation */}
                 <div className="bg-[#1e293b] p-10 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200/50 space-y-10">
                    <div className="space-y-1">
                       <h3 className="text-lg font-bold tracking-tight">Resource Mix</h3>
                       <p className="text-[12px] font-medium text-slate-400 italic">Allocation Matrix</p>
                    </div>
                    <div className="space-y-8">
                       {[
                         { name: 'Sectors', val: stats.resourceUtilization[0], color: 'bg-primary' },
                         { name: 'Hardware', val: stats.resourceUtilization[1], color: 'bg-white' },
                         { name: 'Compute', val: stats.resourceUtilization[2], color: 'bg-blue-400' },
                         { name: 'Nodes', val: stats.resourceUtilization[3], color: 'bg-emerald-400' }
                       ].map(item => (
                         <div key={item.name} className="space-y-3 group">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                              <span className="text-slate-400 group-hover:text-white transition-colors">{item.name}</span>
                              <span>{item.val}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div style={{ width: `${item.val}%` }} className={`h-full ${item.color} transition-all duration-1000 shadow-sm shadow-white/5`}></div>
                            </div>
                         </div>
                       ))}
                    </div>
                    <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all">Optimize Allocation</button>
                 </div>
              </div>

              {/* Operations Table */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden p-8 space-y-8">
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <h3 className="text-lg font-bold text-gray-900 tracking-tight">Operations Log</h3>
                       <p className="text-[12px] font-medium text-gray-400">Audited Network Events</p>
                    </div>
                    <button className="text-[11px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">Download Full Log</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                             <th className="pb-6">Timestamp</th>
                             <th className="pb-6">Operation</th>
                             <th className="pb-6">Initiator</th>
                             <th className="pb-6 text-right">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {[
                            { time: '10:45 AM', activity: 'Facility synchronization complete', member: 'John Doe', status: 'DONE', style: 'text-emerald-500 bg-emerald-50' },
                            { time: '09:30 AM', activity: 'Maintenance relay initialized', member: 'Jane Smith', status: 'WAIT', style: 'text-amber-500 bg-amber-50' },
                            { time: '08:15 AM', activity: 'System metrics purge', member: 'Mike Johnson', status: 'CORE', style: 'text-blue-500 bg-blue-50' },
                            { time: 'Yesterday', activity: 'Registry node verified', member: 'Sarah Wilson', status: 'DONE', style: 'text-emerald-500 bg-emerald-50' }
                          ].map((activity, i) => (
                            <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                               <td className="py-6 text-[12px] font-bold text-gray-400">{activity.time}</td>
                               <td className="py-6 text-sm font-bold text-gray-900 tracking-tight italic">{activity.activity}</td>
                               <td className="py-6 text-[12px] font-bold text-gray-500 uppercase">{activity.member}</td>
                               <td className="py-6 text-right">
                                  <span className={`text-[9px] font-black px-3 py-1 rounded-lg border border-transparent ${activity.style}`}>
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
      </main>
    </div>
  )
}
