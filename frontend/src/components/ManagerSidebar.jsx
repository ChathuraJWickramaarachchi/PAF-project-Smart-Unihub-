import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ManagerSidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [toast, setToast] = useState(false)

  const isActive = (path) => location.pathname === path

  const navItems = [
    { name: 'Dashboard Overview', path: '/manager-dashboard', icon: '📊' },
    { name: 'Facility Management', path: '/manager/resources', icon: '🏢' },
    { name: 'Booking Control', path: '/bookings', icon: '📅' },
    { name: 'Real-time Analytics', path: '/manager/analytics', icon: '📈' },
  ]

  const handleSignOut = () => {
    setToast(true)
    setTimeout(() => {
      logout()
      navigate('/')
    }, 2000)
  }

  return (
    <>
    <aside className="w-72 h-screen bg-white flex flex-col shrink-0 border-r border-gray-100 selection:bg-primary/10">
      {/* Brand Section */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-xl shadow-lg shadow-primary/20">🎓</div>
          <div>
            <div className="text-gray-900 font-black text-base tracking-tight leading-none italic">SmartUniPortal</div>
            <div className="text-gray-400 font-bold text-[8px] uppercase tracking-widest mt-1">Manager Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between px-5 py-4 rounded-xl transition-all group ${isActive(item.path) ? 'bg-gray-50 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50/50 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-4">
              <span className={`text-lg opacity-60 group-hover:opacity-100 transition-opacity ${isActive(item.path) ? 'opacity-100' : ''}`}>{item.icon}</span>
              <span className="font-bold text-[13px] tracking-tight">{item.name}</span>
            </div>
            {isActive(item.path) && <span className="text-gray-400 text-xs">›</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom User Profile */}
      <div className="p-4 border-t border-gray-100 space-y-4">
        <div className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 text-xs uppercase shadow-inner">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-gray-900 font-bold text-[12px] truncate">{user?.fullName || 'Manager'}</div>
            <div className="text-gray-400 font-medium text-[10px] truncate">{user?.email || 'manager@smartuni.edu'}</div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={toast}
          className="w-full flex items-center gap-3 px-6 py-4 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95 group font-bold text-[12px] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="opacity-40 group-hover:opacity-100 transition-opacity">🚪</span>
          <span>{toast ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>

    {/* Sign-out Toast */}
    {toast && (
      <div style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 99999,
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: '#1e293b',
        color: '#fff', padding: '1rem 1.5rem', borderRadius: '1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
        fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.01em',
        animation: 'slideInSidebar 0.35s cubic-bezier(.21,1.02,.73,1) forwards',
        maxWidth: '360px',
      }}>
        <span style={{ fontSize: '1.3rem' }}>👋</span>
        Sign out the Manager Dashboard Successfully!
      </div>
    )}

    <style>{`
      @keyframes slideInSidebar {
        from { opacity: 0; transform: translateY(2rem) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
    </>
  )
}
