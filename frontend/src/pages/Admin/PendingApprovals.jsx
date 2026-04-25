import React, { useState, useEffect } from 'react'
import { AdminAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'
import { toast } from 'react-toastify'
import {
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaUser
} from 'react-icons/fa'

export default function PendingApprovals() {
  const { user } = useAuth()
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rejectionForm, setRejectionForm] = useState({ userId: null, reason: '' })

  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  const fetchPendingApprovals = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await AdminAPI.getPendingApprovals()
      setPendingUsers(response.data || [])
    } catch (err) {
      setError('Failed to load pending approvals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      await AdminAPI.approveUser(userId)
      toast.success('User approved successfully')
      fetchPendingApprovals()
    } catch (err) {
      setError('Failed to approve user')
      toast.error('Failed to approve user')
      console.error(err)
    }
  }

  const handleRejectClick = (userId) => {
    setRejectionForm({ userId, reason: '' })
  }

  const handleRejectSubmit = async () => {
    if (!rejectionForm.reason.trim()) {
      setError('Please provide a rejection reason')
      return
    }

    try {
      await AdminAPI.rejectUser(rejectionForm.userId, {
        reason: rejectionForm.reason
      })
      toast.success('User rejected')
      setRejectionForm({ userId: null, reason: '' })
      fetchPendingApprovals()
    } catch (err) {
      setError('Failed to reject user')
      toast.error('Failed to reject user')
      console.error(err)
    }
  }



  const getRoleColor = (role) => {
    switch (role) {
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'TECHNICIAN':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <AdminSidebar />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
            <p className="text-gray-600 mt-2">
              Review and approve/reject manager and technician signup requests
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}



          {/* Rejection Modal */}
          {rejectionForm.userId && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject User</h3>
                <textarea
                  value={rejectionForm.reason}
                  onChange={(e) => setRejectionForm({ ...rejectionForm, reason: e.target.value })}
                  placeholder="Enter rejection reason..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                  rows="4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setRejectionForm({ userId: null, reason: '' })}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Users List */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4">Loading pending approvals...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <FaCheck className="mx-auto text-4xl text-green-500 mb-4 opacity-50" />
              <p className="text-gray-600 text-lg">No pending approvals</p>
              <p className="text-gray-400 text-sm mt-2">All signup requests have been processed</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingUsers.map(u => (
                <div
                  key={u.id}
                  className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <FaUser />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{u.fullName}</h3>
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-1 ${getRoleColor(u.requestedRole)}`}>
                            {u.requestedRole}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" />
                          {u.email}
                        </div>
                        {u.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-gray-400" />
                            {u.phoneNumber}
                          </div>
                        )}
                        <div className="flex items-center gap-2 col-span-2">
                          <FaClock className="text-gray-400" />
                          Requested: {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 md:flex-col">
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <FaCheck /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectClick(u.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
