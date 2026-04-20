import React, { useState, useEffect } from 'react'
import { TicketAPI, ResourceAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

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
    } catch (err) {
      setError('Failed to create ticket')
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
    <div className="min-h-screen bg-gray-50/50 p-8 flex flex-col gap-10 selection:bg-primary/10">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gray-900 p-16 rounded-[4rem] group shadow-2xl shadow-gray-200">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/20 transition-all duration-1000"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12 text-center lg:text-left">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none italic">
              Incident <span className="text-primary not-italic">Reporting</span>
            </h1>
            <p className="max-w-xl text-gray-400 font-medium text-lg leading-relaxed italic">
              Report campus infrastructure anomalies. Monitor resolution cycles in real-time.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-gray-900 px-12 py-6 rounded-2xl font-black text-[13px] uppercase tracking-[0.3em] shadow-xl hover:-translate-y-2 transition-all active:scale-95"
          >
            Launch Ticket
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 self-center">
        {['ALL', 'OPEN', 'RESOLVED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-900'}`}
          >
            {tab === 'ALL' ? 'Registry' : tab === 'OPEN' ? 'In Cycle' : 'Resolved'}
          </button>
        ))}
      </div>

      {error && <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-[10px] font-black text-rose-700 uppercase tracking-widest animate-fade-in mx-auto max-w-xl w-full">{error}</div>}

      {/* Ticket Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center italic text-gray-400 font-black uppercase tracking-widest text-xs">Accessing Ticket Streams...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8 animate-fade-in opacity-50 italic grayscale">
           <div className="text-6xl text-emerald-500">🛡️</div>
           <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Zero anomalies detected in your sector.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredTickets.map(ticket => {
            const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
            const isProgress = ticket.status === 'IN_PROGRESS'
            return (
              <div key={ticket.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 group hover:-translate-y-2 transition-all flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Node #{ticket.ticketNumber || ticket.id}</span>
                  <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${isResolved ? 'bg-emerald-500 text-white' : isProgress ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-white border border-gray-100 text-gray-400 italic'}`}>
                    {ticket.status.replace('_', ' ')}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight italic uppercase truncate">{ticket.title}</h3>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed italic line-clamp-3">
                    {ticket.description}
                  </p>
                </div>

                <div className="mt-auto flex justify-between items-center pt-8 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getPriorityIcon(ticket.priority)}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{ticket.priority} Flow</span>
                  </div>
                  <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Registry →</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-gray-900/20 animate-fade-in" onClick={() => setShowCreateModal(false)}>
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-gray-100 p-12 space-y-10 animate-zoom-in overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">Report <span className="text-primary not-italic">Anomaly</span></h2>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-2">Initializing new incident protocol...</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-300 hover:text-gray-900 transition-colors text-xl">✕</button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Identifier Group</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab 4 network failure"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Target Mapping</label>
                    <select
                      required
                      value={newTicket.resourceId}
                      onChange={(e) => setNewTicket({ ...newTicket, resourceId: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all italic"
                    >
                      <option value="">Select Resource Node...</option>
                      {resources.map(r => (
                        <option key={r.id} value={r.id}>{r.resourceName} · {r.location}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Flow Frequency</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all italic"
                    >
                      <option value="LOW">Low (Trival)</option>
                      <option value="MEDIUM">Medium (Stable)</option>
                      <option value="HIGH">High (Impact)</option>
                      <option value="URGENT">Urgent (Breakback)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Telemetry Details</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Provide specific incident telemetry..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-primary outline-none transition-all min-h-[120px] italic placeholder:text-gray-300"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-50 text-[11px] font-black text-gray-400 py-5 rounded-2xl uppercase tracking-widest hover:bg-gray-100 transition-all">Abort Proc</button>
                  <button type="submit" className="flex-2 bg-primary text-white text-[11px] font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all">Engage Portal</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
