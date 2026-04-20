import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ResourceAPI, BookingAPI, TicketAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'

export default function AdminDashboard() {
   const { user } = useAuth()
   const [stats, setStats] = useState({
      totalResources: 0,
      activeBookings: 0,
      openTickets: 0,
      resolvedToday: 0
   })
   const [pendingApprovals, setPendingApprovals] = useState([])
   const [recentActivity, setRecentActivity] = useState([])
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

         setStats({
            totalResources: resourcesResponse.data.length,
            activeBookings: bookingsResponse.data.length,
            openTickets: ticketsResponse.data.length,
            resolvedToday: 7
         })

         setPendingApprovals(allBookings.data.filter(b => b.status === 'PENDING').slice(0, 4))

         setRecentActivity([
            { id: 1, text: 'Booking #B-0142 approved for Lab B-202', time: '2 min ago', icon: '✓', color: 'emerald' },
            { id: 2, text: 'Ticket #T-0089 assigned to Ruwan', time: '18 min ago', icon: '→', color: 'amber' },
            { id: 3, text: 'Projector #P-014 offline', time: '1h ago', icon: '⚠', color: 'rose' },
            { id: 4, text: '5 new bookings submitted', time: '3 hr ago', icon: '📝', color: 'primary' },
            { id: 5, text: 'Ticket #T-0085 resolved', time: 'Yesterday', icon: '✓', color: 'violet' }
         ])
      } catch (error) {
         console.error('Failed to load admin dashboard data:', error)
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
         <AdminSidebar />

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
                        <div className="text-[12px] font-bold text-gray-900 leading-none">{user?.fullName || 'Administrator'}</div>
                        <div className="text-[10px] font-medium text-gray-400 mt-1">Admin</div>
                     </div>
                  </div>
               </div>
            </header>

            <div className="p-12 space-y-12 max-w-7xl mx-auto">
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                     { label: 'Register Node', icon: '📝' },
                     { label: 'Map Sector', icon: '📡' },
                     { label: 'Telemetry', icon: '📈' },
                     { label: 'Security', icon: '🛡️' }
                  ].map((action, i) => (
                     <button key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col items-center gap-3 hover:shadow-lg hover:shadow-gray-200/30 transition-all group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">{action.label}</span>
                     </button>
                  ))}
               </div>

               {/* Stats Bar */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                     { title: 'Operational Nodes', value: stats.totalResources, desc: 'Across 12 sectors', icon: '🏢' },
                     { title: 'Active Sessions', value: stats.activeBookings, desc: `${pendingApprovals.length} awaiting auth`, icon: '📅' },
                     { title: 'Incident Reports', value: stats.openTickets, desc: 'Technical issues', icon: '🎫' },
                     { title: 'Protocols Ready', value: stats.resolvedToday, desc: 'Sync complete', icon: '✅' }
                  ].map((stat, i) => (
                     <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-start group hover:shadow-xl hover:shadow-gray-200/40 transition-all">
                        <div className="space-y-4">
                           <div className="text-[12px] font-medium text-gray-400">{stat.title}</div>
                           <div className="space-y-1">
                              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                              <div className="text-[11px] font-medium text-gray-400">{stat.desc}</div>
                           </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">{stat.icon}</div>
                     </div>
                  ))}
               </div>

               {/* Main Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Authorization Table */}
                  <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-8 space-y-8">
                     <div className="flex justify-between items-center">
                        <div className="space-y-1">
                           <h2 className="text-lg font-bold text-gray-900 tracking-tight">Authorization Waiting</h2>
                           <p className="text-[12px] text-gray-400 font-medium">Awaiting root level validation signatures</p>
                        </div>
                        <Link to="/bookings" className="text-[12px] font-bold text-gray-400 hover:text-gray-900 flex items-center gap-2">Full Registry <span>→</span></Link>
                     </div>

                     <div className="space-y-4">
                        {pendingApprovals.map((approval) => (
                           <div key={approval.bookingId} className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/50 border border-transparent hover:bg-white hover:border-gray-100 hover:shadow-lg hover:shadow-gray-200/30 transition-all group">
                              <div className="flex items-center gap-6">
                                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">📡</div>
                                 <div className="space-y-1">
                                    <div className="text-sm font-bold text-gray-900 tracking-tight">{approval.resourceName || 'Unknown Node'}</div>
                                    <div className="text-[11px] text-gray-400 font-medium italic uppercase">User_ID_{approval.userId}</div>
                                 </div>
                              </div>
                              <button className="px-5 py-2.5 bg-[#1e293b] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Authorize</button>
                           </div>
                        ))}
                        {pendingApprovals.length === 0 && (
                           <div className="py-20 text-center text-[12px] font-medium text-gray-300 italic">No pending signatures required.</div>
                        )}
                     </div>
                  </div>

                  {/* Activity Stream */}
                  <div className="lg:col-span-5 bg-[#1e293b] rounded-3xl p-8 space-y-8 shadow-2xl shadow-slate-200/50 text-white">
                     <div className="space-y-1">
                        <h2 className="text-lg font-bold tracking-tight">Activity Stream</h2>
                        <p className="text-[12px] text-slate-400 font-medium">Encrypted event log feed</p>
                     </div>

                     <div className="space-y-6">
                        {recentActivity.map(activity => (
                           <div key={activity.id} className="flex gap-5 group">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0 border border-white/5 group-hover:bg-primary/20 transition-colors">
                                 {activity.icon}
                              </div>
                              <div className="space-y-1">
                                 <div className="text-[13px] font-bold text-slate-100 tracking-tight leading-snug group-hover:text-primary transition-colors">{activity.text}</div>
                                 <div className="text-[10px] font-medium text-slate-500 uppercase italic">{activity.time}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                     <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all">Export Activity History</button>
                  </div>
               </div>
            </div>
         </main>
      </div>
   )
}
