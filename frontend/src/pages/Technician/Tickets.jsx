import React, { useState, useEffect } from 'react'
import { TicketAPI, CommentAPI, ResourceAPI, UserAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'
import TechnicianSidebar from '../../components/TechnicianSidebar'

export default function Tickets() {
  const { user } = useAuth()
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
  const [technicians, setTechnicians] = useState([])
  const [assigningId, setAssigningId] = useState(null)
  
  const isTechnician = user?.role?.includes('TECHNICIAN')

  useEffect(() => {
    fetchTickets()
    if (showCreateModal) {
      fetchResources()
    }
    if (!isTechnician) {
      fetchTechnicians()
    }
  }, [statusFilter])

  const fetchTickets = async () => {
    setLoading(true)
    setError('')
    try {
      if (statusFilter === 'MY_TICKETS' && isTechnician) {
        const response = await TicketAPI.getAssigned(user.userId)
        setTickets(response.data)
      } else {
        const response = await TicketAPI.getByStatus(statusFilter)
        setTickets(response.data)
      }
    } catch (err) {
      setError('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      const response = await UserAPI.getAll()
      // Filter users who have TECHNICIAN role
      const techs = response.data.filter(u => u.roles?.some(r => r.name === 'ROLE_TECHNICIAN') || u.role?.includes('TECHNICIAN'))
      setTechnicians(techs)
    } catch (err) {
      console.error('Failed to fetch technicians', err)
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
        reportedById: 1
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

  const handleAssignTicket = async (technicianId) => {
    try {
      await TicketAPI.assign(selectedTicket.id, technicianId)
      fetchTickets()
      setSelectedTicket({ ...selectedTicket, assignedToId: technicianId })
    } catch (err) {
      setError('Failed to assign ticket')
    }
  }

  const handleQuickAssign = async (ticketId, technicianId) => {
    if (!technicianId) return;
    try {
      await TicketAPI.assign(ticketId, technicianId)
      fetchTickets()
    } catch (err) {
      setError('Failed to assign ticket')
    }
  }

  const handleAcceptTicket = async (id) => {
    try {
      await TicketAPI.updateStatus(id, 'IN_PROGRESS')
      fetchTickets()
      setSelectedTicket({ ...selectedTicket, status: 'IN_PROGRESS' })
    } catch (err) {
      setError('Failed to accept ticket')
    }
  }

  const handleDenyTicket = async (id) => {
    try {
      await TicketAPI.unassign(id)
      fetchTickets()
      setSelectedTicket(null)
    } catch (err) {
      setError('Failed to deny ticket')
    }
  }

  const myNewAssignments = tickets.filter(t => t.assignedToId === user?.userId && t.status === 'OPEN')

  return (
    <div className="flex bg-gray-50/50 min-h-screen selection:bg-primary/10">
      {isTechnician ? <TechnicianSidebar /> : <AdminSidebar />}

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-gray-900 tracking-tight italic">Incident <span className="text-primary not-italic">Stream</span></h1>
          </div>
          <div className="flex items-center gap-6">

            <div className="flex items-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-lg hover:bg-gray-100">🔔</button>
              <button className="w-10 h-10 flex items-center justify-center bg-gray-900 rounded-xl text-lg text-white">👤</button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {error && <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-black text-rose-700 uppercase tracking-widest animate-fade-in">{error}</div>}

          <div className="flex items-center gap-6 pb-2">
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', ...(isTechnician ? ['MY_TICKETS'] : [])].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  {status.replace('_', ' ')}
                  {status === 'MY_TICKETS' && myNewAssignments.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[8px]">{myNewAssignments.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {isTechnician && myNewAssignments.length > 0 && statusFilter === 'MY_TICKETS' && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🔔</span>
                <div>
                  <h3 className="text-sm font-bold text-primary">New Assignment Received</h3>
                  <p className="text-xs font-medium text-primary/70">System Administrator has assigned new tasks for your node. Inspect and accept to begin protocol.</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[3rem] p-4 border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Sequence ID</th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Subject</th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Priority</th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">State</th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] text-right">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-gray-50 rounded-full w-full"></div></td>
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] italic">No active telemetry found for this filter.</td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-6 font-black text-gray-900 tracking-tighter italic">#{t.ticketNumber}</td>
                      <td className="px-6 py-6 font-bold text-gray-600 truncate max-w-[200px]">{t.title}</td>
                      <td className="px-6 py-6">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border shadow-sm ${t.priority === 'URGENT' || t.priority === 'HIGH' ? 'bg-rose-50 text-rose-500 border-rose-100' : t.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-primary/5 text-primary border-primary/10'}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm ${t.status === 'CLOSED' ? 'bg-emerald-500 text-white' : t.status === 'IN_PROGRESS' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100 text-gray-400'}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end items-center gap-3">
                          {!isTechnician && (
                            <select
                              onChange={(e) => handleQuickAssign(t.id, e.target.value)}
                              value={t.assignedToId || ''}
                              className="bg-white border border-gray-100 text-[9px] font-bold text-gray-600 px-3 py-2 rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-primary w-28 uppercase"
                            >
                              <option value="">UNASSIGNED</option>
                              {technicians.map(tech => (
                                <option key={tech.userId} value={tech.userId}>{tech.fullName?.split(' ')[0] || tech.email.split('@')[0]}</option>
                              ))}
                            </select>
                          )}
                          <button onClick={() => handleSelectTicket(t)} className="bg-gray-50 text-[10px] font-black text-gray-900 px-6 py-2 rounded-xl uppercase tracking-widest border border-gray-100 hover:bg-gray-900 hover:text-white transition-all shrink-0">Inspect</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View/Edit Modal (Ticket Detail) */}
        {selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-gray-900/20 animate-fade-in" onClick={() => setSelectedTicket(null)}>
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-zoom-in" onClick={(e) => e.stopPropagation()}>
              <div className="p-12 border-b border-gray-50 shrink-0">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-3xl font-black text-gray-900 tracking-tighter italic">#{selectedTicket.ticketNumber}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border ${selectedTicket.priority === 'URGENT' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-primary/5 text-primary border-primary/20'}`}>{selectedTicket.priority}</span>
                    </div>
                    <h2 className="text-xl font-medium text-gray-400 italic">Target: {selectedTicket.title}</h2>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="text-gray-300 hover:text-gray-900 transition-colors text-xl">✕</button>
                </div>

                <div className="flex items-center gap-8">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <h4 className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Current State</h4>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                      className="bg-transparent text-[11px] font-black text-gray-900 uppercase tracking-widest outline-none italic cursor-pointer"
                    >
                      {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="h-10 w-[1px] bg-gray-100"></div>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed italic max-w-lg">{selectedTicket.description}</p>
                </div>

                {isTechnician && selectedTicket.status === 'OPEN' && selectedTicket.assignedToId === user?.userId && (
                  <div className="mt-8 flex gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <button onClick={() => handleAcceptTicket(selectedTicket.id)} className="flex-1 bg-primary text-white text-[11px] font-black py-4 rounded-xl uppercase tracking-widest shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all">Accept Assignment</button>
                    <button onClick={() => handleDenyTicket(selectedTicket.id)} className="flex-1 bg-white text-rose-500 border border-rose-100 text-[11px] font-black py-4 rounded-xl uppercase tracking-widest hover:bg-rose-50 transition-all">Deny Assignment</button>
                  </div>
                )}

                {!isTechnician && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Assign Technician</h4>
                    <select
                      value={selectedTicket.assignedToId || ''}
                      onChange={(e) => handleAssignTicket(e.target.value)}
                      className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-bold text-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                      <option value="">-- Unassigned --</option>
                      {technicians.map(tech => (
                        <option key={tech.userId} value={tech.userId}>{tech.fullName || tech.email}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-4">Communication Log <span className="flex-1 h-[1px] bg-gray-50"></span></h4>
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="py-10 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No registry entries added.</div>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-50 flex gap-6 group hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">{c.authorId}</div>
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest italic">Observer Node #{c.authorId}</span>
                              <span className="text-[9px] font-bold text-gray-300 uppercase">{new Date(c.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium italic">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="p-12 bg-gray-50/50 border-t border-gray-100 shrink-0">
                <form onSubmit={handleAddComment} className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Input telemetry updates..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-white border-none rounded-2xl px-8 py-5 text-sm font-medium italic shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                  <button type="submit" className="bg-gray-900 text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all active:scale-95">Push Update</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-gray-900/20 animate-fade-in" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-gray-100 p-12 space-y-10 animate-zoom-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">Launch <span className="text-primary not-italic">Sequence</span></h2>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-2">Initializing new incident protocol...</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-300 hover:text-gray-900 transition-colors text-xl">✕</button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Identifier Group</label>
                    <input
                      type="text"
                      required
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="e.g. Server Node Offline"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Criticality</label>
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

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Target Mapping (Resource)</label>
                  <select
                    required
                    value={newTicket.resourceId}
                    onChange={(e) => setNewTicket({ ...newTicket, resourceId: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all italic"
                  >
                    <option value="">Select Resource Node...</option>
                    {resources.map(r => <option key={r.id} value={r.id}>{r.resourceName} · {r.location}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Incident Telemetry (Description)</label>
                  <textarea
                    required
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-primary outline-none transition-all min-h-[120px] italic"
                    placeholder="Detailed telemetry for field nodes..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-50 text-[11px] font-black text-gray-400 py-5 rounded-2xl uppercase tracking-widest hover:bg-gray-100 transition-all">Abort</button>
                  <button type="submit" className="flex-2 bg-primary text-white text-[11px] font-black py-5 rounded-2xl uppercase tracking-widest shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all">Engage Ticket</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
