import React, { useState, useEffect } from 'react'
import { ResourceAPI } from '../../services/api'
import AdminSidebar from '../../components/AdminSidebar'

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedAvailability, setSelectedAvailability] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [editingResource, setEditingResource] = useState(null)
  const [newResource, setNewResource] = useState({
    resourceName: '',
    resourceType: 'LAB',
    location: '',
    capacity: '',
    availableFrom: '08:00',
    availableUntil: '20:00',
    status: 'ACTIVE',
    features: ''
  })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await ResourceAPI.getAll()
      setResources(response.data)
    } catch (err) {
      setError('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchResources()
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await ResourceAPI.search(searchTerm)
      setResources(response.data)
    } catch (err) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources.filter(res => {
    const matchesType = selectedType === '' || res.resourceType === selectedType;
    const matchesAvailability = selectedAvailability === '' ||
      (selectedAvailability === 'AVAILABLE' ? res.status === 'ACTIVE' : res.status !== 'ACTIVE');
    return matchesType && matchesAvailability;
  })

  const handleAddResource = async (e) => {
    e.preventDefault()
    try {
      await ResourceAPI.create({
        ...newResource,
        capacity: parseInt(newResource.capacity)
      })
      setShowAddModal(false)
      setNewResource({ resourceName: '', resourceType: 'LAB', location: '', capacity: '', availableFrom: '08:00', availableUntil: '20:00', status: 'ACTIVE', features: '' })
      fetchResources()
    } catch (err) {
      setError('Failed to create resource')
    }
  }

  const handleDeleteResource = async (id) => {
    setDeleteTargetId(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      await ResourceAPI.delete(deleteTargetId)
      setShowDeleteConfirm(false)
      setDeleteTargetId(null)
      fetchResources()
    } catch (err) {
      setError('Failed to delete resource')
      setShowDeleteConfirm(false)
    }
  }

  const handleEditResource = (resource) => {
    setEditingResource(resource)
    setShowEditModal(true)
  }

  const handleUpdateResource = async (e) => {
    e.preventDefault()
    try {
      await ResourceAPI.update(editingResource.id, {
        ...editingResource,
        capacity: parseInt(editingResource.capacity)
      })
      setShowEditModal(false)
      setEditingResource(null)
      fetchResources()
    } catch (err) {
      setError('Failed to update resource')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row selection:bg-primary/10">
      <AdminSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto w-full">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-12 py-8 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Asset <span className="text-primary not-italic">Inventory</span></h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Infrastructure Management / Registry Control</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
            >
              + Add Resource
            </button>
          </div>
        </header>

        <div className="p-12 space-y-12">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-2xl text-[10px] font-black text-rose-700 uppercase tracking-widest animate-shake">
              {error}
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            <div className="relative group flex-1 min-w-[250px] max-w-xl">
              <input
                type="text"
                placeholder="Search assets, locations, clusters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-[2rem] px-10 py-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all shadow-xl shadow-gray-200/20 italic"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-3 bg-gray-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
              >
                Search
              </button>
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white border border-gray-100 rounded-[2rem] px-6 py-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all shadow-xl shadow-gray-200/20 italic cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="LAB">Laboratory</option>
              <option value="AUDITORIUM">Auditorium</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="SPORTS_FACILITY">Sports Facility</option>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="PROJECTOR">Projector</option>
              <option value="SMART_BOARD">Smart Board</option>
              <option value="WHITEBOARD">Whiteboard</option>
              <option value="SOUND_SYSTEM">Sound System</option>
              <option value="MICROPHONE">Microphone</option>
              <option value="VR_BOX">VR Box</option>
            </select>

            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="bg-white border border-gray-100 rounded-[2rem] px-6 py-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all shadow-xl shadow-gray-200/20 italic cursor-pointer"
            >
              <option value="">Any Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>

          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center italic text-gray-400 font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Registry...</div>
          ) : filteredResources.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center p-20 text-center space-y-8 bg-white rounded-[4rem] border border-dashed border-gray-200 opacity-50 grayscale italic">
              <div className="text-6xl">🏢</div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">No matching nodes in registry.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Resource Name</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Type</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Location</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">Capacity</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredResources.map((resource) => (
                      <tr key={resource.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-10 py-6">
                           <div className="text-sm font-black text-gray-900 tracking-tight italic uppercase">{resource.resourceName}</div>
                           <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">ID: {resource.id?.substring(0, 8)}...</div>
                        </td>
                        <td className="px-10 py-6">
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">{resource.resourceType?.replace('_', ' ')}</span>
                        </td>
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                             <span className="text-primary">📍</span>
                             {resource.location}
                           </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <span className="text-xs font-black text-gray-900">{resource.capacity}</span>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${resource.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                             {resource.status}
                           </span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex justify-end gap-3 translate-x-4 group-hover:translate-x-0 transition-all opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => handleEditResource(resource)}
                              className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
                              title="Edit Asset"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteResource(resource.id)} 
                              className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-100"
                              title="Delete Asset"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 lg:p-20 shadow-2xl relative overflow-hidden animate-zoom-in">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>

              <div className="relative space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Add New <span className="text-primary not-italic">Resource</span></h2>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Register a new asset or facility</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddResource} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Resource Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Hall C-110"
                      required
                      value={newResource.resourceName}
                      onChange={(e) => setNewResource({ ...newResource, resourceName: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Type</label>
                    <select
                      value={newResource.resourceType}
                      onChange={(e) => setNewResource({ ...newResource, resourceType: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm cursor-pointer"
                    >
                      <option value="LAB">Laboratory</option>
                      <option value="AUDITORIUM">Auditorium</option>
                      <option value="MEETING_ROOM">Meeting Room</option>
                      <option value="SPORTS_FACILITY">Sports Facility</option>
                      <option value="LECTURE_HALL">Lecture Hall</option>
                      <option value="PROJECTOR">Projector</option>
                      <option value="SMART_BOARD">Smart Board</option>
                      <option value="WHITEBOARD">Whiteboard</option>
                      <option value="SOUND_SYSTEM">Sound System</option>
                      <option value="MICROPHONE">Microphone</option>
                      <option value="VR_BOX">VR Box</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Location / Block</label>
                    <input
                      type="text"
                      placeholder="e.g. Block C, 1st Floor"
                      required
                      value={newResource.location}
                      onChange={(e) => setNewResource({ ...newResource, location: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Capacity</label>
                    <input
                      type="number"
                      placeholder="e.g. 60"
                      required
                      value={newResource.capacity}
                      onChange={(e) => setNewResource({ ...newResource, capacity: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="pt-10 flex gap-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-10 py-4 text-[12px] font-black uppercase tracking-[0.2em] text-gray-700 hover:text-gray-900 transition-colors italic border border-gray-200 rounded-2xl hover:border-gray-300 bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95">Add Resource</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full">
              <div className="text-center space-y-6">
                <div className="text-5xl text-rose-500">⚠️</div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 uppercase italic mb-2">Confirm Deletion</h3>
                  <p className="text-sm text-gray-600">Are you sure you want to delete this resource? This action cannot be undone.</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteTargetId(null)
                    }}
                    className="flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wide text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 lg:p-20 shadow-2xl relative overflow-hidden animate-zoom-in">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>

              <div className="relative space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Edit <span className="text-primary not-italic">Resource</span></h2>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Modify existing asset configuration</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingResource(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateResource} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Resource Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Hall C-110"
                      required
                      value={editingResource.resourceName}
                      onChange={(e) => setEditingResource({ ...editingResource, resourceName: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Type</label>
                    <select
                      value={editingResource.resourceType}
                      onChange={(e) => setEditingResource({ ...editingResource, resourceType: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm cursor-pointer"
                    >
                      <option value="LAB">Laboratory</option>
                      <option value="AUDITORIUM">Auditorium</option>
                      <option value="MEETING_ROOM">Meeting Room</option>
                      <option value="SPORTS_FACILITY">Sports Facility</option>
                      <option value="LECTURE_HALL">Lecture Hall</option>
                      <option value="PROJECTOR">Projector</option>
                      <option value="SMART_BOARD">Smart Board</option>
                      <option value="WHITEBOARD">Whiteboard</option>
                      <option value="SOUND_SYSTEM">Sound System</option>
                      <option value="MICROPHONE">Microphone</option>
                      <option value="VR_BOX">VR Box</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Location / Block</label>
                    <input
                      type="text"
                      placeholder="e.g. Block C, 1st Floor"
                      required
                      value={editingResource.location}
                      onChange={(e) => setEditingResource({ ...editingResource, location: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Capacity</label>
                    <input
                      type="number"
                      placeholder="e.g. 60"
                      required
                      value={editingResource.capacity}
                      onChange={(e) => setEditingResource({ ...editingResource, capacity: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Status</label>
                  <select
                    value={editingResource.status}
                    onChange={(e) => setEditingResource({ ...editingResource, status: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>

                <div className="pt-10 flex gap-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingResource(null)
                    }}
                    className="flex-1 px-10 py-4 text-[12px] font-black uppercase tracking-[0.2em] text-gray-700 hover:text-gray-900 transition-colors italic border border-gray-200 rounded-2xl hover:border-gray-300 bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95"
                  >
                    Update Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
