import React, { useState, useEffect } from 'react'
import { TicketAPI, CommentAPI, ResourceAPI } from '../../services/api'
import AdminSidebar from '../../components/AdminSidebar'
import '../Pages.css'
import '../AdminDashboard.css'

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('OPEN')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    resourceId: ''
  })
  const [resources, setResources] = useState([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchTickets()
    if (showCreateModal) {
      fetchResources()
    }
  }, [statusFilter])

  const fetchTickets = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await TicketAPI.getByStatus(statusFilter)
      setTickets(response.data)
    } catch (err) {
      setError('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket)
    try {
      const response = await CommentAPI.getTicketComments(ticket.id)
      setComments(response.data)
    } catch (err) {
      setError('Failed to load comments')
    }
  }

  const fetchResources = async () => {
    try {
      const response = await ResourceAPI.getAll()
      setResources(response.data.filter(r => r.status === 'ACTIVE'))
    } catch (err) {
      console.error('Failed to fetch resources:', err)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    try {
      await TicketAPI.create({
        ...newTicket,
        resourceId: parseInt(newTicket.resourceId),
        reportedById: 1 // TODO: Get from auth context
      })
      setShowCreateModal(false)
      setNewTicket({ title: '', description: '', priority: 'MEDIUM', resourceId: '' })
      fetchTickets()
    } catch (err) {
      setError('Failed to create ticket')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await CommentAPI.add(selectedTicket.id, newComment)
      setNewComment('')
      const response = await CommentAPI.getTicketComments(selectedTicket.id)
      setComments(response.data)
    } catch (err) {
      setError('Failed to add comment')
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await TicketAPI.updateStatus(id, newStatus)
      fetchTickets()
      setSelectedTicket(null)
    } catch (err) {
      setError('Failed to update ticket status')
    }
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <main className="admin-main-content">
        <div className="admin-header">
          <div className="header-title">Incident Tickets</div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ marginRight: '1rem' }}>+ Create Ticket</button>
            <button className="header-icon-btn">🔔</button>
            <button className="header-icon-btn">👤</button>
          </div>
        </div>

        <div className="admin-content">
          <div className="page-container" style={{ margin: 0, width: '100%', maxWidth: 'none', padding: 0 }}>

            {error && <div className="error-message">{error}</div>}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ marginRight: '1rem', fontWeight: '500' }}>Filter by Status:</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
            ) : tickets.length === 0 ? (
              <div className="card">
                <p style={{ textAlign: 'center', color: '#6b7280' }}>No tickets found</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket #</th>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Reported By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>{ticket.ticketNumber}</td>
                        <td>{ticket.title}</td>
                        <td>
                          <span className={`badge badge-${ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'danger' :
                              ticket.priority === 'MEDIUM' ? 'warning' : 'primary'
                            }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${ticket.status === 'CLOSED' ? 'success' :
                              ticket.status === 'IN_PROGRESS' ? 'warning' : 'primary'
                            }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td>User #{ticket.reportedById}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-primary"
                              onClick={() => handleSelectTicket(ticket)}
                            >
                              View
                            </button>
                            {selectedTicket?.id === ticket.id && (
                              <select
                                value={ticket.status}
                                onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                                className="btn-secondary"
                              >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedTicket && (
              <div className="modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2 className="modal-title">{selectedTicket.ticketNumber}</h2>
                    <button
                      className="modal-close"
                      onClick={() => setSelectedTicket(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <h3>{selectedTicket.title}</h3>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                      {selectedTicket.description}
                    </p>
                    <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      Status: {selectedTicket.status} | Priority: {selectedTicket.priority}
                    </p>

                    {/* Comments Section */}
                    <div style={{ marginTop: '2rem' }}>
                      <h4>Comments</h4>
                      <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '1rem' }}>
                        {comments.length === 0 ? (
                          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No comments yet</p>
                        ) : (
                          comments.map((comment) => (
                            <div key={comment.id} style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.375rem' }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>User #{comment.authorId}</p>
                              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{comment.content}</p>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      <form onSubmit={handleAddComment} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                        />
                        <button type="submit" className="btn-primary">Add</button>
                      </form>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn-secondary"
                      onClick={() => setSelectedTicket(null)}
                    >
                      Close
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                    >
                      Start Work
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCreateModal && (
              <div className="modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2 className="modal-title">Create New Ticket</h2>
                    <button
                      className="modal-close"
                      onClick={() => setShowCreateModal(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleCreateTicket}>
                    <div className="modal-body">
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
                        <input
                          type="text"
                          required
                          value={newTicket.title}
                          onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                        />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                        <textarea
                          required
                          value={newTicket.description}
                          onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minHeight: '100px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Priority</label>
                        <select
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Resource</label>
                        <select
                          required
                          value={newTicket.resourceId}
                          onChange={(e) => setNewTicket({ ...newTicket, resourceId: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                        >
                          <option value="">Select a resource</option>
                          {resources.map(resource => (
                            <option key={resource.id} value={resource.id}>
                              {resource.resourceName} ({resource.location})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">Create Ticket</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
