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
    resourceId: '',
    category: '',
    preferredContact: ''
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [activeTab, setActiveTab] = useState('ALL') // ALL, OPEN, RESOLVED

  const userId = user?.userId || user?.id || "1"

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
    setLoading(true)
    try {
      const response = await TicketAPI.create({
        ...newTicket,
        resourceId: newTicket.resourceId,
        reportedById: userId
      })

      const createdTicket = response.data

      // Upload images if any
      if (selectedFiles.length > 0) {
        await TicketAPI.uploadAttachments(createdTicket.id, selectedFiles)
      }

      setShowCreateModal(false)
      setNewTicket({ title: '', description: '', priority: 'MEDIUM', resourceId: '', category: '', preferredContact: '' })
      setSelectedFiles([])
      fetchMyTickets()
    } catch (err) {
      setError('Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-gray-900/40 animate-fade-in" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-zoom-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-[18px] font-bold text-gray-800 tracking-tight">Report an Issue</h2>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTicket} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
              {/* Row 1: Category & Priority */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select
                    required
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select category...</option>
                    <option value="IT">IT Support</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="SECURITY">Security</option>
                    <option value="FACILITY">Facility Management</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Location / Resource */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location / Resource</label>
                <select
                  required
                  value={newTicket.resourceId}
                  onChange={(e) => setNewTicket({ ...newTicket, resourceId: e.target.value, title: resources.find(r => r.id === e.target.value)?.resourceName || '' })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  <option value="">e.g. Hall A-101, Lab B-202...</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.resourceName} · {r.location}</option>
                  ))}
                </select>
              </div>

              {/* Row 3: Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe the issue in detail..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[120px] resize-none"
                />
              </div>

              {/* Row 4: Attach Evidence */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Attach Evidence (Up to 3 Images)</label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full min-h-[160px] bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-100/80 hover:border-primary/20 transition-all group"
                  >
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <span className="text-3xl mb-3 opacity-60 group-hover:scale-110 transition-transform">📎</span>
                      <p className="text-[13px] font-bold text-gray-600">Click or drag images here</p>
                      <p className="text-[11px] text-gray-400 mt-1">PNG, JPG up to 5MB each · max 3 files</p>
                    </div>
                  </label>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 italic">
                        {f.name.length > 25 ? f.name.substring(0, 25) + '...' : f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 5: Preferred Contact */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Contact</label>
                <input
                  type="text"
                  placeholder="Phone or email for follow-up..."
                  value={newTicket.preferredContact}
                  onChange={(e) => setNewTicket({ ...newTicket, preferredContact: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-50 bg-gray-50/30 -mx-8 -mb-8 p-8">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="flex-1 bg-white border border-gray-200 text-[12px] font-bold text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-primary text-white text-[12px] font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
