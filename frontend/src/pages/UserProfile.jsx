import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaEdit, FaCheck, FaTimes, FaLock, FaBell, FaPalette, FaTrash, FaCamera } from 'react-icons/fa'

export default function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'User'
  })
  const [activeTab, setActiveTab] = useState('profile')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    setIsEditing(false)
    // TODO: Add API call to update profile
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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-500">Manage your account settings and preferences</p>
        </div>

        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50">
                <FaCamera className="text-gray-600 text-sm" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{user?.fullName || 'User'}</h2>
              <p className="text-blue-100">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                {user?.role || 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'profile', label: 'Profile', icon: FaUser },
                { id: 'security', label: 'Security', icon: FaShieldAlt },
                { id: 'notifications', label: 'Notifications', icon: FaBell },
                { id: 'appearance', label: 'Appearance', icon: FaPalette },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="text-lg" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                    <p className="text-sm text-gray-500 mt-1">Update your personal details</p>
                  </div>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 font-semibold"
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
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
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                      <div className="px-4 py-3 rounded-xl font-medium flex items-center gap-2 border bg-blue-50 text-blue-700 border-blue-200">
                        <FaShieldAlt />
                        <span>{formData.role}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button 
                      onClick={handleSave} 
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 font-semibold"
                    >
                      <FaCheck />
                      <span>Save Changes</span>
                    </button>
                    <button 
                      onClick={handleCancel} 
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all border border-gray-200 font-semibold"
                    >
                      <FaTimes />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Security Settings</h3>
                  <p className="text-sm text-gray-500">Manage your password and security preferences</p>
                </div>

                <div className="space-y-4">
                  <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <FaLock className="text-2xl text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Password</h4>
                          <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-sm">
                        Change Password
                      </button>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                          <FaShieldAlt className="text-2xl text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500">Add an extra layer of security</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold text-sm">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-bold text-red-600 mb-4">Danger Zone</h4>
                  <div className="p-6 rounded-2xl border border-red-200 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-gray-900 mb-1">Delete Account</h5>
                        <p className="text-sm text-gray-600">Permanently delete your account and all associated data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold text-sm flex items-center gap-2">
                        <FaTrash />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Notification Preferences</h3>
                  <p className="text-sm text-gray-500">Choose what notifications you want to receive</p>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Booking Confirmations', desc: 'Get notified when your bookings are confirmed', defaultChecked: true },
                    { title: 'Ticket Updates', desc: 'Receive updates on your support tickets', defaultChecked: true },
                    { title: 'System Announcements', desc: 'Important system updates and maintenance', defaultChecked: false },
                    { title: 'Reminder Emails', desc: 'Get reminders before your bookings', defaultChecked: true },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-6 rounded-2xl border border-gray-200 hover:border-blue-300 transition-colors">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Appearance Settings</h3>
                  <p className="text-sm text-gray-500">Customize the look and feel of your dashboard</p>
                </div>

                <div className="space-y-4">
                  <div className="p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4">Theme</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { name: 'Light', color: 'bg-white border-2 border-gray-300' },
                        { name: 'Dark', color: 'bg-gray-900 border-2 border-gray-700' },
                        { name: 'Auto', color: 'bg-gradient-to-r from-white to-gray-900 border-2 border-gray-400' },
                      ].map((theme, index) => (
                        <button
                          key={index}
                          className={`p-4 rounded-xl ${theme.color} hover:scale-105 transition-all`}
                        >
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{theme.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4">Accent Color</h4>
                    <div className="flex gap-3">
                      {['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-600', 'bg-pink-600'].map((color, index) => (
                        <button
                          key={index}
                          className={`w-12 h-12 rounded-xl ${color} hover:scale-110 transition-all ${index === 0 ? 'ring-4 ring-offset-2 ring-blue-600' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
