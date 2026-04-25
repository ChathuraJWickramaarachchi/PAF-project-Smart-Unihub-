import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookingAPI, ResourceAPI, TicketAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ManagerSidebar from '../../components/ManagerSidebar'

export default function ManagerDashboard() {
   const { user } = useAuth()
   const location = useLocation()
   const [toast, setToast] = useState(location.state?.showLoginToast || false)
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
      if (toast) {
         window.history.replaceState({}, document.title)
         const timer = setTimeout(() => setToast(false), 3000)
         return () => clearTimeout(timer)
      }
   }, [toast])

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
         setPendingApprovals(pendingBookings.slice(0, 4))
      } catch (error) {
         console.error('Failed to load manager dashboard data:', error)
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
         <ManagerSidebar />

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
                        <div className="text-[12px] font-bold text-gray-900 leading-none">{user?.fullName || 'Manager'}</div>
                        <div className="text-[10px] font-medium text-gray-400 mt-1">Manager</div>
                     </div>
                     <span className="text-gray-300 text-[10px] ml-1">▼</span>
                  </div>
               </div>
            </header>

            <div className="p-12 space-y-12 max-w-7xl mx-auto">
               {/* Stats Bar */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                     { title: 'Total Active Bookings', value: stats.activeBookings, desc: `${stats.pendingBookings} awaiting approval`, icon: '📄', color: 'blue' },
                     { title: 'Total Facilities', value: stats.totalResources, desc: 'Across all departments', icon: '🏢', color: 'indigo' },
                     { title: 'Resource Usage', value: '84%', desc: 'Current utilization', icon: '📊', color: 'slate' },
                     { title: 'Open Tickets', value: stats.openTickets, desc: 'Technical issues', icon: '🎫', color: 'rose' }
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

               {/* Main Content Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Recent Facility Requests */}
                  <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-8 space-y-8">
                     <div className="flex justify-between items-center">
                        <div className="space-y-1">
                           <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Facility Requests</h2>
                           <p className="text-[12px] text-gray-400 font-medium">Your latest booking requests and their current status</p>
                        </div>
                        <Link to="/bookings" className="text-[12px] font-bold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2">View All <span>→</span></Link>
                     </div>

                     <div className="space-y-4">
                        {pendingApprovals.map((approval) => (
                           <div key={approval.bookingId} className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/50 border border-gray-50/50 group hover:bg-white hover:border-gray-100 hover:shadow-lg hover:shadow-gray-200/30 transition-all">
                              <div className="flex items-center gap-6">
                                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">🏫</div>
                                 <div className="space-y-1">
                                    <div className="text-sm font-bold text-gray-900 tracking-tight">{approval.resourceName || 'Global Hall B'}</div>
                                    <div className="flex items-center gap-3 text-[12px] text-gray-400 font-medium">
                                       <span>{approval.userName || 'Faculty Member'}</span>
                                       <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                       <div className="px-2 py-0.5 bg-gray-100 rounded-md text-[10px] uppercase tracking-tighter text-gray-500">{new Date(approval.startTime).toLocaleDateString()}</div>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-8">
                                 <div className="text-right space-y-1">
                                    <div className="text-sm font-bold text-gray-900">0</div>
                                    <div className="text-[11px] font-medium text-gray-400">conflicts</div>
                                 </div>
                                 <div className="text-gray-300 group-hover:text-gray-900 transition-colors">→</div>
                              </div>
                           </div>
                        ))}
                        {pendingApprovals.length === 0 && (
                           <div className="py-20 text-center space-y-4 opacity-50 italic">
                              <div className="text-4xl">🧘</div>
                              <p className="text-[12px] font-medium text-gray-400">All sequences are synchronized. No pending requests.</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Quick Actions Panel */}
                  <div className="lg:col-span-4 space-y-8">
                     <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-8 h-full">
                        <div className="space-y-1">
                           <h2 className="text-lg font-bold text-gray-900 tracking-tight">Quick Actions</h2>
                           <p className="text-[12px] text-gray-400 font-medium">Manage your portal access</p>
                        </div>

                        <div className="space-y-3">
                           {[
                              { label: 'Manage Facilities', icon: '🏢' },
                              { label: 'Register New Asset', icon: '📝' },
                              { label: 'View Analytics', icon: '📊' },
                              { label: 'Portal Settings', icon: '⚙️' }
                           ].map((action, i) => (
                              <button key={i} className="w-full flex items-center justify-between p-5 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg hover:shadow-gray-200/30 transition-all group">
                                 <div className="flex items-center gap-4">
                                    <span className="text-lg opacity-60">{action.icon}</span>
                                    <span className="text-[13px] font-bold text-gray-700">{action.label}</span>
                                 </div>
                                 <span className="text-gray-300 group-hover:text-gray-900 transition-colors">→</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </main>

         {/* Login Toast */}
         {toast && (
            <div style={{
               position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 99999,
               display: 'flex', alignItems: 'center', gap: '0.75rem',
               background: '#059669',
               color: '#fff', padding: '1rem 1.5rem', borderRadius: '1rem',
               boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
               fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.01em',
               animation: 'slideInLoginToast 0.35s cubic-bezier(.21,1.02,.73,1) forwards',
               maxWidth: '360px',
            }}>
               <span style={{ fontSize: '1.3rem' }}>✅</span>
               Login Succesfully!
            </div>
         )}

         <style>{`
            @keyframes slideInLoginToast {
               from { opacity: 0; transform: translateY(2rem) scale(0.95); }
               to   { opacity: 1; transform: translateY(0) scale(1); }
            }
         `}</style>
      </div>
   )
}
