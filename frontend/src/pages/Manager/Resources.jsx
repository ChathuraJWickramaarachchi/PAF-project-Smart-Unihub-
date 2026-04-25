import React, { useState, useEffect, useCallback } from 'react'
import { ResourceAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import ManagerSidebar from '../../components/ManagerSidebar'

const RESOURCE_TYPES = [
  { value: 'LAB', label: 'Laboratory' },
  { value: 'AUDITORIUM', label: 'Auditorium' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'SPORTS_FACILITY', label: 'Sports Facility' },
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'PROJECTOR', label: 'Projector' },
  { value: 'SMART_BOARD', label: 'Smart Board' },
  { value: 'WHITEBOARD', label: 'Whiteboard' },
  { value: 'SOUND_SYSTEM', label: 'Sound System' },
  { value: 'MICROPHONE', label: 'Microphone' },
  { value: 'VR_BOX', label: 'VR Box' },
]

const EMPTY_RESOURCE = {
  resourceName: '', resourceType: 'LAB', location: '',
  capacity: '', availableFrom: '08:00', availableUntil: '20:00',
  status: 'ACTIVE', features: ''
}

const TYPE_ICON = {
  LAB: '🔬', AUDITORIUM: '🎭', MEETING_ROOM: '🤝',
  SPORTS_FACILITY: '🏟️', LECTURE_HALL: '🏛️', PROJECTOR: '📽️',
  SMART_BOARD: '📋', WHITEBOARD: '📝', SOUND_SYSTEM: '🔊',
  MICROPHONE: '🎤', VR_BOX: '🥽',
}

export default function ManagerResources() {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [newResource, setNewResource] = useState(EMPTY_RESOURCE)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => { fetchResources() }, [])

  const fetchResources = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await ResourceAPI.getAll()
      setResources(res.data || [])
    } catch {
      setError('Failed to load resources.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) { fetchResources(); return }
    setLoading(true)
    try {
      const res = await ResourceAPI.search(searchTerm)
      setResources(res.data || [])
    } catch {
      setError('Search failed.')
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources.filter(r =>
    selectedType === '' || r.resourceType === selectedType
  )

  /* ── ADD ── */
  const handleAddResource = async (e) => {
    e.preventDefault()
    try {
      await ResourceAPI.create({ ...newResource, capacity: parseInt(newResource.capacity) })
      setShowAddModal(false)
      setNewResource(EMPTY_RESOURCE)
      fetchResources()
      showToast('Resource added successfully!')
    } catch {
      setError('Failed to create resource.')
    }
  }

  /* ── EDIT ── */
  const handleEditResource = (resource) => {
    setEditingResource({ ...resource })
    setShowEditModal(true)
  }

  const handleUpdateResource = async (e) => {
    e.preventDefault()
    try {
      await ResourceAPI.update(editingResource.id, {
        ...editingResource, capacity: parseInt(editingResource.capacity)
      })
      setShowEditModal(false)
      setEditingResource(null)
      fetchResources()
      showToast('Resource updated successfully!')
    } catch {
      setError('Failed to update resource.')
    }
  }

  /* ── DELETE ── */
  const confirmDelete = async () => {
    const id = confirmDeleteId
    setConfirmDeleteId(null)
    try {
      await ResourceAPI.delete(id)
      fetchResources()
      showToast('Resource deleted!', 'error')
    } catch {
      setError('Failed to delete resource.')
    }
  }

  /* ── STATUS TOGGLE ── */
  const handleStatusToggle = async (resource) => {
    const next = resource.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE'
    try {
      await ResourceAPI.changeStatus(resource.id, next)
      fetchResources()
      showToast(`Status set to ${next}`)
    } catch {
      setError('Failed to update status.')
    }
  }

  /* ─────────────────────────── JSX ─────────────────────────── */
  return (
    <>
      <div className="flex bg-[#f8fafc] min-h-screen selection:bg-primary/10">
        <ManagerSidebar />

        <main className="flex-1 min-w-0 h-screen overflow-y-auto w-full custom-scrollbar">
          {/* Header */}
          <header className="bg-white border-b border-gray-100 flex justify-between items-center px-12 py-5 sticky top-0 z-10">
            <div>
              <h1 className="text-[14px] font-black text-gray-900 tracking-tight uppercase italic">
                Facility <span className="text-primary not-italic">Resources</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">👤</div>
              <div className="text-right hidden sm:block">
                <div className="text-[12px] font-bold text-gray-900 leading-none">{user?.fullName || 'Manager'}</div>
                <div className="text-[10px] font-medium text-gray-400 mt-1">Manager</div>
              </div>
              <span className="text-gray-300 text-[10px] ml-1">▼</span>
            </div>
          </header>

          <div className="p-10 space-y-8 max-w-7xl mx-auto">
            {/* Error */}
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-2xl text-[11px] font-black text-rose-700 uppercase tracking-widest">
                {error}
              </div>
            )}

            {/* Search + Filter */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[260px] max-w-md">
                <input
                  type="text"
                  placeholder="Search name, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-24 py-3 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none shadow-sm"
                />
                <span className="absolute left-3.5 top-3.5 text-gray-400 text-xs">🔍</span>
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1.5 bg-gray-900 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                  Search
                </button>
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-5 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 outline-none shadow-sm cursor-pointer"
              >
                <option value="">All Types</option>
                {RESOURCE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              <div className="ml-auto text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="min-h-[400px] flex items-center justify-center text-gray-400 font-black uppercase tracking-[0.4em] text-[11px] animate-pulse">
                Loading Resources...
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-6 bg-white rounded-[2.5rem] border border-dashed border-gray-200 opacity-50 grayscale">
                <div className="text-5xl">🏢</div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">No resources found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col"
                  >
                    {/* Card top colour bar */}
                    <div className={`h-1.5 w-full rounded-t-2xl ${resource.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'}`} />

                    <div className="p-5 flex flex-col gap-3 flex-1">
                      {/* Title row */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl">{TYPE_ICON[resource.resourceType] || '🏢'}</span>
                          <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase truncate">
                            {resource.resourceName}
                          </h3>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border
                        ${resource.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'}`}
                        >
                          {resource.status}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <span>📍</span><span className="truncate">{resource.location || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>👥</span><span>Capacity: {resource.capacity}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>🏷️</span>
                          <span>{RESOURCE_TYPES.find(t => t.value === resource.resourceType)?.label || resource.resourceType}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2 mt-auto">
                        <button
                          onClick={() => handleStatusToggle(resource)}
                          className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all
                          ${resource.status === 'ACTIVE'
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                          {resource.status === 'ACTIVE' ? '⏸ Deactivate' : '▶ Activate'}
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditResource(resource)}
                            className="text-[8px] font-black text-primary hover:text-black uppercase italic px-2 py-1 hover:bg-gray-50 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(resource.id)}
                            className="text-[8px] font-black text-rose-500 hover:text-rose-700 uppercase italic px-2 py-1 hover:bg-rose-50 rounded transition-colors"
                          >
                            Del
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* ── Add Modal ── */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Add New Resource</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Register a new facility or asset</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">✕</button>
              </div>
              <form onSubmit={handleAddResource} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Resource Name</label>
                    <input type="text" required placeholder="e.g. Hall C-110"
                      value={newResource.resourceName}
                      onChange={e => setNewResource({ ...newResource, resourceName: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</label>
                    <select value={newResource.resourceType}
                      onChange={e => setNewResource({ ...newResource, resourceType: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                    >
                      {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Location</label>
                    <input type="text" required placeholder="e.g. Block C, Floor 1"
                      value={newResource.location}
                      onChange={e => setNewResource({ ...newResource, location: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Capacity</label>
                    <input type="number" required min="1" placeholder="e.g. 60"
                      value={newResource.capacity}
                      onChange={e => setNewResource({ ...newResource, capacity: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 text-sm font-black text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95">Add Resource</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Edit Modal ── */}
        {showEditModal && editingResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Edit Resource</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Modify asset configuration</p>
                </div>
                <button onClick={() => { setShowEditModal(false); setEditingResource(null) }} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">✕</button>
              </div>
              <form onSubmit={handleUpdateResource} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Resource Name</label>
                    <input type="text" required
                      value={editingResource.resourceName}
                      onChange={e => setEditingResource({ ...editingResource, resourceName: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</label>
                    <select value={editingResource.resourceType}
                      onChange={e => setEditingResource({ ...editingResource, resourceType: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                    >
                      {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Location</label>
                    <input type="text" required
                      value={editingResource.location}
                      onChange={e => setEditingResource({ ...editingResource, location: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Capacity</label>
                    <input type="number" required min="1"
                      value={editingResource.capacity}
                      onChange={e => setEditingResource({ ...editingResource, capacity: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</label>
                  <select value={editingResource.status}
                    onChange={e => setEditingResource({ ...editingResource, status: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingResource(null) }} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 text-sm font-black text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95">Update Resource</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete Confirm Modal ── */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/55 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center gap-5 animate-zoom-in">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-3xl">🗑️</div>
              <div className="text-center">
                <h3 className="font-black text-gray-900 text-base mb-1">Delete Resource?</h3>
                <p className="text-sm text-gray-500">This is permanent and cannot be undone.</p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold text-sm text-white transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: toast.type === 'success' ? '#059669' : '#dc2626',
          color: '#fff', padding: '1rem 1.5rem', borderRadius: '1rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.02em',
          animation: 'slideInToast 0.35s cubic-bezier(.21,1.02,.73,1) forwards',
        }}>
          <span style={{ fontSize: '1.2rem' }}>{toast.type === 'success' ? '✅' : '🗑️'}</span>
          {toast.message}
        </div>
      )}

      <style>{`
      @keyframes slideInToast {
        from { opacity: 0; transform: translateY(2rem) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
    </>
  )
}
