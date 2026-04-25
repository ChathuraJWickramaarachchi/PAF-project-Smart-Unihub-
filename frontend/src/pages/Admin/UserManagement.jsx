import React, { useState, useEffect } from 'react'
import apiClient from '../../services/api'
import AdminSidebar from '../../components/AdminSidebar'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingUserId, setEditingUserId] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    role: ''
  })

  useEffect(() => {
    fetchUsers()
    fetchRoleOptions()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users')
      setUsers(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Failed to load users')
      setLoading(false)
    }
  }

  const fetchRoleOptions = async () => {
    try {
      const response = await apiClient.get('/users/roles')
      setRoleOptions(response.data || [])
    } catch (err) {
      console.error('Failed to fetch role options:', err)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await apiClient.put(`/users/${userId}/role`, { role: newRole })
      setSuccessMessage(response.data.message)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchUsers()
      setEditingUserId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const response = await apiClient.put(`/users/${userId}/status`, { isActive: !currentStatus })
      setSuccessMessage(response.data.message)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return
    }
    try {
      const response = await apiClient.delete(`/users/${userId}`)
      setSuccessMessage(response.data.message)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleEditClick = (user) => {
    setEditingUser(user)
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async () => {
    try {
      const response = await apiClient.put(`/users/${editingUser.userId}`, {
        fullName: editFormData.fullName,
        email: editFormData.email,
        role: editFormData.role
      })
      setSuccessMessage(response.data.message || 'User updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchUsers()
      setShowEditModal(false)
      setEditingUser(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user')
      setTimeout(() => setError(''), 3000)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black uppercase tracking-widest text-xs text-gray-400">
      Syncing User Registry...
    </div>
  )

  return (
    <div className="flex bg-gray-50/50 min-h-screen selection:bg-primary/10">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-gray-900 tracking-tight italic">User <span className="text-primary not-italic">Identity</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <input type="text" className="pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl text-sm w-72 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" placeholder="Search Identities..." />
              <span className="absolute left-4 top-3 text-gray-400 group-focus-within:text-primary transition-colors">🔍</span>
            </div>
            <button className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-lg hover:bg-gray-100 transition-colors">🔔</button>
            <button className="w-10 h-10 flex items-center justify-center bg-primary rounded-xl text-lg text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">👤</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {/* Notifications area */}
          {(error || successMessage) && (
            <div className="animate-fade-in">
              {error && <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-black text-rose-700 uppercase tracking-widest">{error}</div>}
              {successMessage && <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-xs font-black text-emerald-700 uppercase tracking-widest">{successMessage}</div>}
            </div>
          )}

          <div className="bg-white rounded-[3rem] p-4 border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">User Profile</th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Identity Class</th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">State</th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Method</th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.userId} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-6 font-black text-gray-900 tracking-tight italic">
                      <div className="flex items-center gap-4">
                        {u.profilePictureUrl ? (
                          <img src={u.profilePictureUrl} className="w-10 h-10 rounded-xl object-cover bg-gray-100 p-0.5 border border-gray-50" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-black text-gray-300">{u.fullName.charAt(0)}</div>
                        )}
                        <span>{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-medium text-gray-500 italic">{u.email}</td>
                    <td className="px-6 py-6">
                      {editingUserId === u.userId ? (
                        <select 
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.userId, e.target.value)}
                          onBlur={() => setEditingUserId(null)}
                          autoFocus
                          className="bg-white border border-primary/50 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl outline-none shadow-xl shadow-primary/5 italic"
                        >
                          {roleOptions.map((roleOption) => (
                            <option key={roleOption.value} value={roleOption.value}>{roleOption.label}</option>
                          ))}
                        </select>
                      ) : (
                        <div 
                          onClick={() => setEditingUserId(u.userId)}
                          className={`inline-block text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm border border-white/10 cursor-alias hover:-translate-y-0.5 transition-all ${u.roleBadgeClass || 'bg-gray-500 text-white shadow-gray-200'}`}
                        >
                          {u.roleLabel || u.role}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <button 
                         onClick={() => handleStatusToggle(u.userId, u.isActive)}
                         className={`text-[8px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl transition-all ${u.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 shadow-sm' : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 shadow-sm'}`}
                      >
                        {u.isActive ? 'Active Node' : 'Suspended'}
                      </button>
                    </td>
                    <td className="px-6 py-6 text-[10px] font-black text-gray-400 tracking-widest italic">{u.googleId ? '🔵 OAuth' : '📧 Credential'}</td>
                    <td className="px-6 py-6 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(u)} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline translate-y-0 active:translate-y-0.5">Edit</button>
                      <button onClick={() => handleDeleteUser(u.userId, u.email)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline translate-y-0 active:translate-y-0.5">Wipe</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-gray-900/20 animate-fade-in" onClick={() => setShowEditModal(false)}>
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-gray-100 p-12 space-y-10 animate-zoom-in" onClick={(e) => e.stopPropagation()}>
               <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic">Identity <span className="text-primary not-italic">Matrix</span></h2>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-2">Adjusting session permissions...</p>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="text-gray-300 hover:text-gray-900 transition-colors text-xl">✕</button>
               </div>

               <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Name Mapping</label>
                    <input 
                      type="text" 
                      value={editFormData.fullName} 
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Primary Relay</label>
                    <input 
                      type="email" 
                      value={editFormData.email} 
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Permission Level</label>
                    <select 
                      value={editFormData.role} 
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all italic"
                    >
                      {roleOptions.map((roleOption) => (
                        <option key={roleOption.value} value={roleOption.value}>{roleOption.label}</option>
                      ))}
                    </select>
                  </div>
               </div>

               <div className="flex gap-4 pt-6">
                  <button onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-50 text-[11px] font-black text-gray-400 py-5 rounded-2xl uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel Seq</button>
                  <button onClick={handleEditSubmit} className="flex-2 bg-primary text-white text-[11px] font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all">Authorize Changes</button>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
