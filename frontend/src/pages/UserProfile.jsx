import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ManagerSidebar from '../components/ManagerSidebar'
import AdminSidebar from '../components/AdminSidebar'
import TechnicianSidebar from '../components/TechnicianSidebar'
import { FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaEdit, FaCheck, FaTimes, FaCamera, FaLock, FaBell, FaSignOutAlt, FaChartLine, FaCalendarCheck, FaTicketAlt, FaStar } from 'react-icons/fa'

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
    <div className={`flex bg-gray-50 min-h-screen ${!hasSidebar ? 'flex-col' : ''}`}>
      {renderSidebar()}

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 px-8 py-5 flex justify-between items-center shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-6">
            {!hasSidebar && (
              <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-gray-100 transition-all group">
                <span className="text-xl text-gray-600 group-hover:text-gray-900 transition-colors">←</span>
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500">Manage your account settings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-3 rounded-xl hover:bg-gray-100 transition-all group">
              <FaBell className="text-xl text-gray-600 group-hover:text-gray-900" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-200">
              <FaSignOutAlt />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {/* Profile Banner */}
            <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-48">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)' }}></div>
              <div className="absolute -bottom-16 left-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl text-white font-bold shadow-2xl border-4 border-white">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50">
                    <FaCamera className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Info */}
              <div className="space-y-6">
                {/* User Info Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="mt-16 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{formData.fullName}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        formData.role.includes('ADMIN') ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        formData.role.includes('MANAGER') ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        formData.role.includes('TECHNICIAN') ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                        'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        <FaShieldAlt className="mr-1.5" />
                        {formData.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaEnvelope className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{formData.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FaPhone className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{formData.phone || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all border border-blue-400">
                    <div className="flex items-center justify-between mb-3">
                      <FaCalendarCheck className="text-2xl opacity-80" />
                      <FaChartLine className="text-lg opacity-60" />
                    </div>
                    <p className="text-3xl font-bold mb-1 text-white">12</p>
                    <p className="text-sm text-blue-100">Total Bookings</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all border border-purple-400">
                    <div className="flex items-center justify-between mb-3">
                      <FaTicketAlt className="text-2xl opacity-80" />
                      <FaStar className="text-lg opacity-60" />
                    </div>
                    <p className="text-3xl font-bold mb-1 text-white">5</p>
                    <p className="text-sm text-purple-100">Active Tickets</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left border border-gray-100 hover:border-gray-200">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FaLock className="text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Change Password</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left border border-gray-100 hover:border-gray-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaBell className="text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Notification Settings</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Edit Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                      <p className="text-sm text-gray-500 mt-1">Update your profile details</p>
                    </div>
                    {!isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)} 
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30"
                      >
                        <FaEdit />
                        <span className="text-sm font-medium">Edit Profile</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <FaUser className="text-gray-400" />
                          Full Name
                        </label>
                        {isEditing ? (
                          <input 
                            name="fullName" 
                            value={formData.fullName} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium border border-gray-100">{formData.fullName}</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <FaEnvelope className="text-gray-400" />
                          Email Address
                        </label>
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center justify-between border border-gray-100">
                          <span>{formData.email}</span>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <FaPhone className="text-gray-400" />
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium border border-gray-100">{formData.phone || 'Not set'}</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <FaShieldAlt className="text-gray-400" />
                          Role
                        </label>
                        <div className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2 border ${
                          formData.role.includes('ADMIN') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          formData.role.includes('MANAGER') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          formData.role.includes('TECHNICIAN') ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          <FaShieldAlt />
                          <span>{formData.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
                      <button 
                        onClick={handleSave} 
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/30"
                      >
                        <FaCheck />
                        <span className="font-medium">Save Changes</span>
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all border border-gray-200"
                      >
                        <FaTimes />
                        <span className="font-medium">Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Activity Section */}
                <div className="mt-6 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FaCalendarCheck className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Booked Conference Room A</p>
                          <p className="text-xs text-gray-500 mt-1">{i + 1} days ago</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">Completed</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
