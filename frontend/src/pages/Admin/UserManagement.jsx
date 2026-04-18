import React, { useState, useEffect } from 'react'
import apiClient from '../../services/api'
import '../Pages.css'
import '../../pages/AdminDashboard.css'
import AdminSidebar from '../../components/AdminSidebar'

export default function UserManagement() {
  const [users, setUsers] = useState([])
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

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await apiClient.put(`/users/${userId}/role`, { role: newRole })
      setSuccessMessage(response.data.message)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchUsers() // Refresh user list
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
      fetchUsers() // Refresh user list
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
      fetchUsers() // Refresh user list
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

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'role-badge-admin'
      case 'MANAGER': return 'role-badge-manager'
      case 'TECHNICIAN': return 'role-badge-technician'
      default: return 'role-badge-user'
    }
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
          <div className="admin-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h1>Users Management</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Search anything..."
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    width: '250px'
                  }}
                />
                <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                  🔔
                </button>
                <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                  👤
                </button>
              </div>
            </div>
          </div>
          <div className="page-container">
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h1>Users Management</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Search anything..."
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  width: '250px'
                }}
              />
              <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                🔔
              </button>
              <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                👤
              </button>
            </div>
          </div>
        </div>
        <div className="page-container">

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div className="success-message" style={{ marginBottom: '1rem', color: '#059669' }}>
              {successMessage}
            </div>
          )}

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Login Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {user.profilePictureUrl && (
                          <img
                            src={user.profilePictureUrl}
                            alt={user.fullName}
                            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                          />
                        )}
                        <strong>{user.fullName}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {editingUserId === user.userId ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                          onBlur={() => setEditingUserId(null)}
                          autoFocus
                          style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #3b82f6' }}
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                          <option value="MANAGER">Manager</option>
                          <option value="TECHNICIAN">Technician</option>
                        </select>
                      ) : (
                        <span
                          className={`role-badge ${getRoleBadgeClass(user.role)}`}
                          onClick={() => setEditingUserId(user.userId)}
                          style={{ cursor: 'pointer' }}
                          title="Click to edit role"
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleStatusToggle(user.userId, user.isActive)}
                        className={`status-btn ${user.isActive ? 'active' : 'inactive'}`}
                        title={user.isActive ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {user.isActive ? '✓ Active' : '✗ Inactive'}
                      </button>
                    </td>
                    <td>
                      {user.googleId ? (
                        <span title="Google OAuth">🔵 Google</span>
                      ) : (
                        <span title="Regular login">📧 Email</span>
                      )}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="edit-btn"
                          title="Edit user"
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.userId, user.email)}
                          className="delete-btn"
                          title="Delete user"
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit User</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="modal-close-btn"
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="TECHNICIAN">Technician</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="modal-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="modal-btn-save"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
