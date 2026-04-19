import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ManagerSidebar from '../components/ManagerSidebar'
import AdminSidebar from '../components/AdminSidebar'
import TechnicianSidebar from '../components/TechnicianSidebar'

export default function UserProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'User'
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    setIsEditing(false)
    console.log('Profile updated:', formData)
  }

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'User'
    })
    setIsEditing(false)
  }

  const renderSidebar = () => {
    const role = user?.role?.toUpperCase() || ''
    if (role.includes('ADMIN')) return <AdminSidebar />
    if (role.includes('MANAGER')) return <ManagerSidebar />
    if (role.includes('TECHNICIAN')) return <TechnicianSidebar />
    return null
  }

  const hasSidebar = ['ADMIN', 'MANAGER', 'TECHNICIAN'].some(r => user?.role?.toUpperCase().includes(r))

  return (
    <div className={`flex bg-gray-50/50 min-h-screen selection:bg-primary/10 ${!hasSidebar ? 'flex-col' : ''}`}>
      {renderSidebar()}

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            {!hasSidebar && (
              <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-900 transition-colors">
                <span className="text-xl">←</span>
              </button>
            )}
            <h1 className="text-xl font-black text-gray-900 tracking-tight italic">Registry <span className="text-primary not-italic">Identity</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-lg hover:bg-gray-100 transition-colors">🔔</button>
            <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center bg-rose-50 rounded-xl text-lg text-rose-500 hover:bg-rose-100 transition-colors">🚪</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
             
             {/* Left: Identity Card */}
             <div className="w-full lg:w-1/3 flex flex-col gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 text-center space-y-6 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                   
                   <div className="relative mx-auto w-24 h-24 rounded-[2rem] bg-gray-900 flex items-center justify-center text-3xl text-white font-black shadow-2xl shadow-gray-900/20">
                     {user?.fullName?.charAt(0).toUpperCase()}
                   </div>
 
                   <div className="space-y-2">
                     <h2 className="text-xl font-black text-gray-900 tracking-tight italic uppercase">{formData.fullName}</h2>
                     <div className="flex justify-center">
                        <span className="bg-primary/5 text-primary text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border border-primary/20">
                          {formData.role}
                        </span>
                     </div>
                   </div>
 
                   <div className="pt-6 border-t border-gray-50 flex flex-col gap-2 text-center">
                     <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Node Address</div>
                     <div className="text-xs font-medium text-gray-500 truncate italic">{formData.email}</div>
                   </div>
                </div>
 
                {/* Quick Stats */}
                <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-gray-900/20 space-y-6">
                   <h3 className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Sector Metrics</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                         <div className="text-xl font-black italic">05</div>
                         <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Bookings</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                         <div className="text-xl font-black italic">02</div>
                         <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Reports</div>
                      </div>
                   </div>
                </div>
             </div>
 
             {/* Right: Telemetry Form */}
             <div className="flex-1 w-full bg-white p-10 lg:p-14 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-12">
                <div className="space-y-4">
                   <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic capitalize">Identity <span className="text-primary not-italic">Parameters</span></h2>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Configure personal node telemetry and verification data.</p>
                </div>
 
                <div className="space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                       <label className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] pl-1">Full Identity</label>
                       {isEditing ? (
                         <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all" />
                       ) : (
                         <div className="text-lg font-black text-gray-900 tracking-tight italic pl-1">{formData.fullName}</div>
                       )}
                     </div>
                     <div className="space-y-4">
                       <label className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] pl-1">Relay Channel</label>
                       <div className="text-lg font-black text-gray-900 tracking-tight italic pl-1 flex items-center gap-3">
                         {formData.email}
                         <span className="bg-emerald-500 w-2 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                       </div>
                     </div>
                   </div>
 
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                       <label className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] pl-1">Communication Line</label>
                       {isEditing ? (
                         <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl px-5 py-3.5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all" />
                       ) : (
                         <div className="text-lg font-black text-gray-900 tracking-tight italic pl-1">{formData.phone || 'N/A'}</div>
                       )}
                     </div>
                     <div className="space-y-4">
                       <label className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] pl-1">Authorization Range</label>
                       <div className="text-lg font-black text-primary tracking-tight italic pl-1 uppercase">{formData.role}</div>
                     </div>
                   </div>
                </div>
 
                <div className="pt-12 border-t border-gray-50 flex flex-wrap gap-4">
                  {!isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(true)} className="bg-gray-900 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all active:scale-95">Reconfigure Profile</button>
                      <button className="bg-white border border-gray-100 text-gray-400 px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all">Security Protocol</button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleSave} className="bg-primary text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all">Authorize Updates</button>
                      <button onClick={handleCancel} className="bg-gray-50 text-gray-400 px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all">Abort</button>
                    </>
                  )}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
