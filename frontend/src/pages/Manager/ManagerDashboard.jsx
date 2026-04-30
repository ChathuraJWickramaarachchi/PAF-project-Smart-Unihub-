import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookingAPI, ResourceAPI, TicketAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ManagerDashboard() {
   const { user, logout } = useAuth()
   const navigate = useNavigate()
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
   }, [])

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--navy)' }}>
         <div className="w-10 h-10 border-4 border-blue/20 border-t-blue rounded-full animate-spin"></div>
      </div>
   )

   return (
      <div className="manager-dashboard">
         <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

            :root {
               --navy: #f8fafc;
               --navy-2: #ffffff;
               --navy-3: #f1f5f9;
               --navy-4: #ffffff;
               --blue: #1a6cf0;
               --blue-light: #3d87ff;
               --blue-glow: rgba(26,108,240,0.1);
               --accent: #0ea5e9;
               --white: #0f172a;
               --muted: #64748b;
               --muted2: #475569;
               --border: #e2e8f0;
               --border2: #cbd5e1;
               --card: #ffffff;
               --card-hover: #f1f5f9;
               --sans: 'Inter', 'DM Sans', sans-serif;
               --display: 'Syne', sans-serif;
               --green: #10b981;
               --amber: #f59e0b;
               --red: #ef4444;
               --sidebar-w: 260px;
            }

            * { margin: 0; padding: 0; box-sizing: border-box; }

            .manager-dashboard {
               background: var(--navy);
               color: var(--white);
               font-family: var(--sans);
               min-height: 100vh;
               display: flex;
               overflow: hidden;
            }

            /* SIDEBAR */
            .sidebar {
               width: var(--sidebar-w);
               flex-shrink: 0;
               background: var(--navy-2);
               border-right: 1px solid var(--border);
               display: flex;
               flex-direction: column;
               position: relative;
               overflow: hidden;
            }

            .sidebar::before {
               content: '';
               position: absolute;
               top: -80px;
               left: -60px;
               width: 220px;
               height: 220px;
               background: radial-gradient(circle, rgba(26,108,240,0.12) 0%, transparent 70%);
               border-radius: 50%;
               pointer-events: none;
            }

            .sidebar-logo {
               display: flex;
               align-items: center;
               gap: 10px;
               padding: 22px 20px 20px;
               border-bottom: 1px solid var(--border);
            }

            .logo-icon {
               width: 36px;
               height: 36px;
               border-radius: 10px;
               background: linear-gradient(135deg, var(--blue), var(--blue-light));
               display: flex;
               align-items: center;
               justify-content: center;
               font-size: 17px;
               flex-shrink: 0;
            }

            .logo-words { display: flex; flex-direction: column; gap: 1px; }

            .logo-name {
               font-family: var(--display);
               font-size: 14px;
               font-weight: 700;
               letter-spacing: -0.02em;
               color: var(--white);
               line-height: 1;
            }

            .logo-name span { color: var(--blue-light); font-style: italic; }

            .logo-sub {
               font-size: 9px;
               font-weight: 500;
               letter-spacing: 0.12em;
               text-transform: uppercase;
               color: var(--muted);
            }

            .nav-section {
               padding: 20px 12px 8px;
               flex: 1;
            }

            .nav-label {
               font-size: 9px;
               font-weight: 600;
               letter-spacing: 0.14em;
               text-transform: uppercase;
               color: var(--muted);
               padding: 0 8px;
               margin-bottom: 8px;
            }

            .nav-item {
               display: flex;
               align-items: center;
               gap: 10px;
               padding: 10px 12px;
               border-radius: 10px;
               cursor: pointer;
               transition: all 0.2s;
               margin-bottom: 2px;
               text-decoration: none;
               color: var(--muted2);
               font-size: 13px;
               font-weight: 400;
               position: relative;
            }

            .nav-item:hover { background: var(--card-hover); color: var(--white); }

            .nav-item.active {
               background: linear-gradient(135deg, rgba(26,108,240,0.25), rgba(26,108,240,0.1));
               color: var(--white);
               border: 1px solid rgba(26,108,240,0.3);
            }

            .nav-item.active .nav-icon { color: var(--blue-light); }

            .nav-icon {
               width: 18px;
               height: 18px;
               display: flex;
               align-items: center;
               justify-content: center;
               color: var(--muted);
               flex-shrink: 0;
            }

            .nav-item.active .nav-arrow { color: var(--blue-light); margin-left: auto; }
            .nav-arrow { margin-left: auto; color: var(--muted); font-size: 12px; }

            .sidebar-user {
               padding: 18px 16px;
               border-top: 1px solid var(--border);
               display: flex;
               flex-direction: column;
               gap: 4px;
            }

            .user-av {
               width: 32px;
               height: 32px;
               border-radius: 50%;
               background: linear-gradient(135deg, var(--blue), var(--accent));
               display: flex;
               align-items: center;
               justify-content: center;
               font-family: var(--display);
               font-weight: 700;
               font-size: 12px;
               flex-shrink: 0;
            }

            .user-meta { flex: 1; min-width: 0; }

            .user-name {
               font-size: 12px;
               font-weight: 500;
               color: var(--white);
               white-space: nowrap;
               overflow: hidden;
               text-overflow: ellipsis;
            }

            .user-email {
               font-size: 10px;
               color: var(--muted);
               white-space: nowrap;
               overflow: hidden;
               text-overflow: ellipsis;
            }

            .signout-btn {
               background: none;
               border: 1px solid var(--border);
               color: var(--muted);
               cursor: pointer;
               padding: 8px 12px;
               border-radius: 8px;
               transition: all 0.2s;
               display: flex;
               align-items: center;
               gap: 8px;
               font-size: 11px;
               font-weight: 600;
               width: 100%;
               justify-content: center;
               margin-top: 10px;
            }

            .signout-btn:hover { 
               color: var(--red); 
               background: rgba(239, 68, 68, 0.05);
               border-color: rgba(239, 68, 68, 0.2);
            }

            /* MAIN */
            .main {
               flex: 1;
               display: flex;
               flex-direction: column;
               overflow: hidden;
               min-width: 0;
            }

            /* TOP BAR */
            .topbar {
               height: 64px;
               border-bottom: 1px solid var(--border);
               display: flex;
               align-items: center;
               justify-content: space-between;
               padding: 0 28px;
               background: rgba(255,255,255,0.9);
               backdrop-filter: blur(8px);
               flex-shrink: 0;
            }

            .page-title {
               font-family: var(--display);
               font-size: 17px;
               font-weight: 700;
               letter-spacing: -0.02em;
            }

            .topbar-right { display: flex; align-items: center; gap: 14px; }

            .topbar-av-wrap { display: flex; align-items: center; gap: 10px; }

            .topbar-user-info { text-align: right; }

            .topbar-name {
               font-size: 13px;
               font-weight: 500;
               color: var(--white);
               line-height: 1;
            }

            .topbar-role {
               font-size: 10px;
               color: var(--muted);
               letter-spacing: 0.04em;
               margin-top: 2px;
            }

            .topbar-av {
               width: 34px;
               height: 34px;
               border-radius: 50%;
               background: linear-gradient(135deg, var(--blue), var(--blue-light));
               display: flex;
               align-items: center;
               justify-content: center;
               font-family: var(--display);
               font-weight: 700;
               font-size: 13px;
               border: 2px solid rgba(26,108,240,0.4);
            }

            .icon-btn {
               width: 34px;
               height: 34px;
               border-radius: 8px;
               border: 1px solid var(--border2);
               background: var(--card);
               display: flex;
               align-items: center;
               justify-content: center;
               cursor: pointer;
               color: var(--muted2);
               transition: all 0.2s;
            }

            .icon-btn:hover { background: var(--card-hover); color: var(--white); }

            .notif-wrap { position: relative; }

            .notif-dot {
               position: absolute;
               top: 6px;
               right: 6px;
               width: 7px;
               height: 7px;
               border-radius: 50%;
               background: var(--blue-light);
               border: 2px solid var(--navy-2);
            }

            /* CONTENT */
            .content {
               flex: 1;
               overflow-y: auto;
               padding: 24px 28px;
               scrollbar-width: thin;
               scrollbar-color: var(--border2) transparent;
            }

            .content::-webkit-scrollbar { width: 4px; }
            .content::-webkit-scrollbar-track { background: transparent; }
            .content::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

            /* STAT CARDS */
            .section-row {
               display: flex;
               align-items: center;
               justify-content: space-between;
               margin-bottom: 14px;
            }

            .section-title {
               font-family: var(--display);
               font-size: 12px;
               font-weight: 600;
               letter-spacing: 0.1em;
               text-transform: uppercase;
               color: var(--muted);
            }

            .stat-grid {
               display: grid;
               grid-template-columns: repeat(4, 1fr);
               gap: 14px;
               margin-bottom: 22px;
            }

            .stat-card {
               background: var(--card);
               border: 1px solid var(--border);
               border-radius: 14px;
               padding: 18px 20px;
               transition: all 0.25s;
               cursor: default;
               position: relative;
               overflow: hidden;
            }

            .stat-card::before {
               content: '';
               position: absolute;
               inset: 0;
               background: linear-gradient(135deg, rgba(26,108,240,0.05) 0%, transparent 60%);
               opacity: 0;
               transition: opacity 0.3s;
            }

            .stat-card:hover { border-color: rgba(26,108,240,0.3); transform: translateY(-2px); }
            .stat-card:hover::before { opacity: 1; }

            .stat-top {
               display: flex;
               align-items: flex-start;
               justify-content: space-between;
               margin-bottom: 12px;
            }

            .stat-label {
               font-size: 11px;
               font-weight: 500;
               letter-spacing: 0.04em;
               color: var(--muted);
               text-transform: uppercase;
            }

            .stat-icon-box {
               width: 32px;
               height: 32px;
               border-radius: 8px;
               display: flex;
               align-items: center;
               justify-content: center;
            }

            .stat-value {
               font-family: var(--display);
               font-size: 32px;
               font-weight: 800;
               letter-spacing: -0.04em;
               line-height: 1;
               margin-bottom: 6px;
            }

            .stat-sub {
               font-size: 11px;
               color: var(--muted);
            }

            .stat-sub .tag {
               display: inline-flex;
               align-items: center;
               gap: 3px;
               font-size: 10px;
               font-weight: 500;
               padding: 2px 7px;
               border-radius: 100px;
            }

            /* Usage bar */
            .usage-wrap { padding: 10px 0 0; }

            .usage-bar {
               height: 5px;
               border-radius: 10px;
               background: rgba(0,0,0,0.08);
               overflow: hidden;
            }

            .usage-fill {
               height: 100%;
               border-radius: 10px;
               transition: width 1s cubic-bezier(0.16,1,0.3,1);
            }

            /* BOTTOM GRID */
            .bottom-grid {
               display: grid;
               grid-template-columns: 1fr 300px;
               gap: 14px;
            }

            .panel {
               background: var(--card);
               border: 1px solid var(--border);
               border-radius: 14px;
               overflow: hidden;
            }

            .panel-head {
               padding: 18px 20px 14px;
               border-bottom: 1px solid var(--border);
               display: flex;
               align-items: flex-start;
               justify-content: space-between;
            }

            .panel-title {
               font-family: var(--display);
               font-size: 15px;
               font-weight: 700;
               letter-spacing: -0.02em;
            }

            .panel-sub {
               font-size: 11px;
               color: var(--muted);
               margin-top: 3px;
            }

            .view-all {
               display: flex;
               align-items: center;
               gap: 4px;
               font-size: 11px;
               color: var(--blue-light);
               cursor: pointer;
               text-decoration: none;
               transition: gap 0.2s;
               white-space: nowrap;
               padding-top: 2px;
            }

            .view-all:hover { gap: 7px; }

            /* Empty state */
            .empty-state {
               padding: 48px 20px;
               display: flex;
               flex-direction: column;
               align-items: center;
               gap: 12px;
               text-align: center;
            }

            .empty-icon {
               width: 52px;
               height: 52px;
               border-radius: 14px;
               background: var(--blue-glow);
               border: 1px solid rgba(26,108,240,0.2);
               display: flex;
               align-items: center;
               justify-content: center;
               font-size: 22px;
            }

            .empty-title {
               font-family: var(--display);
               font-size: 13px;
               font-weight: 600;
               color: var(--muted2);
            }

            .empty-desc {
               font-size: 11px;
               color: var(--muted);
               max-width: 220px;
               line-height: 1.6;
               font-style: italic;
            }

            /* Booking items */
            .booking-list { padding: 12px; }

            .booking-item {
               display: flex;
               align-items: center;
               justify-content: space-between;
               padding: 14px;
               border-radius: 10px;
               transition: all 0.2s;
               margin-bottom: 8px;
            }

            .booking-item:hover { background: var(--card-hover); }

            .booking-left {
               display: flex;
               align-items: center;
               gap: 12px;
            }

            .booking-icon {
               width: 42px;
               height: 42px;
               background: var(--card);
               border: 1px solid var(--border);
               border-radius: 10px;
               display: flex;
               align-items: center;
               justify-content: center;
               font-size: 18px;
            }

            .booking-info { flex: 1; }

            .booking-name {
               font-size: 13px;
               font-weight: 600;
               color: var(--white);
               margin-bottom: 4px;
            }

            .booking-meta {
               display: flex;
               align-items: center;
               gap: 8px;
               font-size: 11px;
               color: var(--muted);
            }

            .booking-dot {
               width: 3px;
               height: 3px;
               border-radius: 50%;
               background: var(--muted);
            }

            .booking-date {
               padding: 2px 6px;
               background: rgba(0,0,0,0.06);
               border-radius: 4px;
               font-size: 10px;
            }

            /* QUICK ACTIONS */
            .qa-list { padding: 10px 12px; }

            .qa-item {
               display: flex;
               align-items: center;
               gap: 12px;
               padding: 11px 10px;
               border-radius: 10px;
               cursor: pointer;
               transition: all 0.2s;
               text-decoration: none;
               color: var(--white);
            }

            .qa-item:hover { background: var(--card-hover); }

            .qa-icon-box {
               width: 34px;
               height: 34px;
               border-radius: 9px;
               display: flex;
               align-items: center;
               justify-content: center;
               flex-shrink: 0;
            }

            .qa-label { font-size: 13px; font-weight: 500; flex: 1; }

            .qa-arrow { color: var(--muted); font-size: 12px; transition: transform 0.2s; }
            .qa-item:hover .qa-arrow { transform: translateX(3px); color: var(--white); }

            .qa-divider { height: 1px; background: var(--border); margin: 4px 10px; }

            /* Responsive */
            @media (max-width: 1200px) {
               .stat-grid {
                  grid-template-columns: repeat(2, 1fr);
               }
               
               .bottom-grid {
                  grid-template-columns: 1fr;
               }
            }

            @media (max-width: 768px) {
               .sidebar {
                  display: none;
               }
               
               .stat-grid {
                  grid-template-columns: 1fr;
               }
            }
         `}</style>

         {/* SIDEBAR */}
         <aside className="sidebar">
            <div className="sidebar-logo">
               <div className="logo-icon">🎓</div>
               <div className="logo-words">
                  <div className="logo-name">SmartUni <span>Portal</span></div>
                  <div className="logo-sub">Manager Portal</div>
               </div>
            </div>

            <nav className="nav-section">
               <div className="nav-label">Main Menu</div>

               <Link to="/manager-dashboard" className="nav-item active">
                  <div className="nav-icon">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  </div>
                  Dashboard Overview
                  <span className="nav-arrow">›</span>
               </Link>

               <Link to="/manager/resources" className="nav-item">
                  <div className="nav-icon">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  Facility Management
                  <span className="nav-arrow">›</span>
               </Link>

               <Link to="/bookings" className="nav-item">
                  <div className="nav-icon">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  Booking Control
                  <span className="nav-arrow">›</span>
               </Link>

               <Link to="/manager/analytics" className="nav-item">
                  <div className="nav-icon">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  Real-time Analytics
                  <span className="nav-arrow">›</span>
               </Link>
            </nav>

            <div className="sidebar-user">
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                  <div className="user-av">{user?.fullName?.charAt(0) || 'M'}</div>
                  <div className="user-meta">
                     <div className="user-name">{user?.fullName || 'Manager'}</div>
                     <div className="user-email">{user?.email || 'manager@smartuni.edu'}</div>
                  </div>
               </div>
               
               <button 
                  className="signout-btn" 
                  onClick={() => { logout(); navigate('/login'); }}
               >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
               </button>
            </div>
         </aside>

         {/* MAIN */}
         <div className="main">
            {/* TOPBAR */}
            <div className="topbar">
               <div className="page-title">Dashboard Overview</div>
               <div className="topbar-right">
                  <div className="notif-wrap">
                     <div className="icon-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                     </div>
                     <div className="notif-dot"></div>
                  </div>
                  <div className="icon-btn">
                     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <div className="topbar-av-wrap">
                     <div className="topbar-user-info">
                        <div className="topbar-name">{user?.fullName || 'Manager'}</div>
                        <div className="topbar-role">Manager</div>
                     </div>
                     <div className="topbar-av">{user?.fullName?.charAt(0) || 'M'}</div>
                  </div>
               </div>
            </div>

            {/* CONTENT */}
            <div className="content">
               {/* STAT CARDS */}
               <div className="section-row">
                  <div className="section-title">Overview</div>
               </div>

               <div className="stat-grid">
                  <div className="stat-card">
                     <div className="stat-top">
                        <div className="stat-label">Active Bookings</div>
                        <div className="stat-icon-box" style={{background:'rgba(26,108,240,0.12)'}}>
                           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3d87ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                     </div>
                     <div className="stat-value" style={{color:'#3d87ff'}}>{stats.activeBookings}</div>
                     <div className="stat-sub">
                        <span className="tag" style={{background:'rgba(26,108,240,0.12)',color:'#3d87ff'}}>{stats.pendingBookings} awaiting approval</span>
                     </div>
                  </div>

                  <div className="stat-card">
                     <div className="stat-top">
                        <div className="stat-label">Total Facilities</div>
                        <div className="stat-icon-box" style={{background:'rgba(0,208,132,0.1)'}}>
                           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00d084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        </div>
                     </div>
                     <div className="stat-value" style={{color:'#00d084'}}>{stats.totalResources}</div>
                     <div className="stat-sub">Across all departments</div>
                  </div>

                  <div className="stat-card">
                     <div className="stat-top">
                        <div className="stat-label">Resource Usage</div>
                        <div className="stat-icon-box" style={{background:'rgba(245,166,35,0.1)'}}>
                           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        </div>
                     </div>
                     <div className="stat-value" style={{color:'#f5a623'}}>84%</div>
                     <div className="stat-sub">
                        <span className="tag" style={{background:'rgba(245,166,35,0.1)',color:'#f5a623'}}>▲ Current utilization</span>
                     </div>
                     <div className="usage-wrap">
                        <div className="usage-bar">
                           <div className="usage-fill" style={{width:'84%',background:'linear-gradient(90deg,#f5a623,#ffcc44)'}}></div>
                        </div>
                     </div>
                  </div>

                  <div className="stat-card">
                     <div className="stat-top">
                        <div className="stat-label">Open Tickets</div>
                        <div className="stat-icon-box" style={{background:'rgba(255,77,106,0.1)'}}>
                           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff4d6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                     </div>
                     <div className="stat-value" style={{color:'var(--white)'}}>{stats.openTickets}</div>
                     <div className="stat-sub">Technical issues</div>
                  </div>
               </div>

               {/* BOTTOM PANELS */}
               <div className="section-row">
                  <div className="section-title">Activity</div>
               </div>

               <div className="bottom-grid">
                  {/* Recent Facility Requests */}
                  <div className="panel">
                     <div className="panel-head">
                        <div>
                           <div className="panel-title">Recent Facility Requests</div>
                           <div className="panel-sub">Your latest booking requests and their current status</div>
                        </div>
                        <Link to="/bookings" className="view-all">View All ›</Link>
                     </div>
                     
                     {pendingApprovals.length > 0 ? (
                        <div className="booking-list">
                           {pendingApprovals.map((approval) => (
                              <div key={approval.bookingId} className="booking-item">
                                 <div className="booking-left">
                                    <div className="booking-icon">🏫</div>
                                    <div className="booking-info">
                                       <div className="booking-name">{approval.resourceName || 'Conference Hall'}</div>
                                       <div className="booking-meta">
                                          <span>{approval.userName || 'Faculty Member'}</span>
                                          <span className="booking-dot"></span>
                                          <span className="booking-date">{new Date(approval.startTime).toLocaleDateString()}</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="empty-state">
                           <div className="empty-icon">📋</div>
                           <div className="empty-title">All clear</div>
                           <div className="empty-desc">All sequences are synchronized. No pending requests at this time.</div>
                        </div>
                     )}
                  </div>

                  {/* Quick Actions */}
                  <div className="panel">
                     <div className="panel-head">
                        <div>
                           <div className="panel-title">Quick Actions</div>
                           <div className="panel-sub">Manage your portal access</div>
                        </div>
                     </div>
                     <div className="qa-list">
                        <Link to="/facilities" className="qa-item">
                           <div className="qa-icon-box" style={{background:'rgba(26,108,240,0.12)'}}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3d87ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                           </div>
                           <div className="qa-label">Manage Facilities</div>
                           <div className="qa-arrow">›</div>
                        </Link>

                        <div className="qa-divider"></div>

                        <a href="#" className="qa-item">
                           <div className="qa-icon-box" style={{background:'rgba(0,208,132,0.1)'}}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00d084" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                           </div>
                           <div className="qa-label">Register New Asset</div>
                           <div className="qa-arrow">›</div>
                        </a>

                        <div className="qa-divider"></div>

                        <Link to="/manager/analytics" className="qa-item">
                           <div className="qa-icon-box" style={{background:'rgba(245,166,35,0.1)'}}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                           </div>
                           <div className="qa-label">View Analytics</div>
                           <div className="qa-arrow">›</div>
                        </Link>

                        <div className="qa-divider"></div>

                        <a href="#" className="qa-item">
                           <div className="qa-icon-box" style={{background:'rgba(100,116,139,0.1)'}}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
                           </div>
                           <div className="qa-label">Portal Settings</div>
                           <div className="qa-arrow">›</div>
                        </a>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}
