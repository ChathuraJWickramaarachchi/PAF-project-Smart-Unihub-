import React, { useState, useEffect } from 'react'
import { TicketAPI, ResourceAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Pages.css'

export default function PublicTickets() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [resources, setResources] = useState([])
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    resourceId: ''
  })
  const [activeTab, setActiveTab] = useState('ALL') // ALL, OPEN, RESOLVED

  const userId = user?.userId ? parseInt(user.userId) : 1

  useEffect(() => {
    fetchMyTickets()
    fetchResources()
  }, [])

  const fetchMyTickets = async () => {
    setLoading(true)
    setError('')
    try {
      const openRes = await TicketAPI.getByStatus('OPEN')
      const progRes = await TicketAPI.getByStatus('IN_PROGRESS')
      const resRes = await TicketAPI.getByStatus('RESOLVED')

      let allTix = [...openRes.data, ...progRes.data, ...resRes.data]
      setTickets(allTix)
    } catch (err) {
      setError('Failed to load your tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchResources = async () => {
    try {
      const response = await ResourceAPI.getAll()
      setResources(response.data.filter(r => r.status === 'ACTIVE'))
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    try {
      await TicketAPI.create({
        ...newTicket,
        resourceId: parseInt(newTicket.resourceId),
        reportedById: userId
      })
      setShowCreateModal(false)
      setNewTicket({ title: '', description: '', priority: 'MEDIUM', resourceId: '' })
      fetchMyTickets()
      alert('Ticket submitted successfully!')
    } catch (err) {
      setError('Failed to create ticket')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
      case 'IN_PROGRESS': return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }
      case 'RESOLVED':
      case 'CLOSED': return { bg: '#dcfce7', text: '#166534', border: '#86efac' }
      default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT': return '🔴'
      case 'MEDIUM': return '🟡'
      case 'LOW': return '🟢'
      default: return '⚪'
    }
  }

  const filteredTickets = tickets.filter(t => {
    if (activeTab === 'ALL') return true
    if (activeTab === 'OPEN') return t.status === 'OPEN' || t.status === 'IN_PROGRESS'
    if (activeTab === 'RESOLVED') return t.status === 'RESOLVED' || t.status === 'CLOSED'
    return true
  })

  return (
    <div className="page-container" style={{ paddingBottom: '4rem' }}>

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        borderRadius: '1rem',
        padding: '3rem 2rem',
        color: 'white',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {user?.name ? `Hi ${user.name.split(' ')[0]}, here are your Tickets` : 'My Requests & Tickets'}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px' }}>
            Report issues, request equipment repairs, and track the status of your ongoing maintenance requests.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: 'white',
            color: '#1e40af',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '999px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          + New Ticket
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
        {['ALL', 'OPEN', 'RESOLVED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: activeTab === tab ? 'bold' : '500',
              color: activeTab === tab ? '#1e40af' : '#6b7280',
              borderBottom: activeTab === tab ? '3px solid #1e40af' : '3px solid transparent',
              paddingBottom: '0.25rem',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'ALL' ? 'All Tickets' : tab === 'OPEN' ? 'Active / Open' : 'Resolved'}
          </button>
        ))}
      </div>

      {error && <div className="error-message" style={{ marginBottom: '2rem' }}>{error}</div>}

      {/* Ticket Cards */}
      {loading ? (
        <p style={{ textAlign: 'center', margin: '3rem', fontSize: '1.2rem', color: '#6b7280' }}>Loading your tickets...</p>
      ) : filteredTickets.length === 0 ? (
        <div style={{ textAlign: 'center', backgroundColor: '#f9fafb', padding: '4rem 2rem', borderRadius: '1rem', border: '2px dashed #d1d5db' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>No tickets found!</h3>
          <p style={{ color: '#6b7280' }}>Everything seems to be working perfectly. Need help? Create a new ticket.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredTickets.map(ticket => {
            const statusStyle = getStatusColor(ticket.status)
            return (
              <div key={ticket.id} style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                border: `1px solid #e5e7eb`,
                borderTop: `4px solid ${statusStyle.border}`,
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    #{ticket.ticketNumber || `T-${ticket.id}`}
                  </span>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                    borderRadius: '999px',
                    border: `1px solid ${statusStyle.border}`
                  }}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {ticket.title}
                </h3>

                <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>
                  {ticket.description.length > 100 ? ticket.description.substring(0, 100) + '...' : ticket.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>{getPriorityIcon(ticket.priority)}</span>
                    {ticket.priority} Priority
                  </div>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    View Details →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '100%', borderRadius: '1rem', padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>Submit New Ticket</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
              >✕</button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Projector bulb is dead"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Which resource?</label>
                <select
                  required
                  value={newTicket.resourceId}
                  onChange={(e) => setNewTicket({ ...newTicket, resourceId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                >
                  <option value="">-- Select a facility/resource --</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.resourceName} ({r.location})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Details of the issue</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Please describe exactly what is wrong..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Urgency</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                >
                  <option value="LOW">Low (Cosmetic / No disruption)</option>
                  <option value="MEDIUM">Medium (Partial disruption)</option>
                  <option value="HIGH">High (Major disruption)</option>
                  <option value="URGENT">Urgent (Safety hazard / Critical)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.75rem 1.5rem', border: 'none', background: '#2563eb', color: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
