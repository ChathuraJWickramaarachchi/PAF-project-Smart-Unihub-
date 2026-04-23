import React, { useState, useEffect } from 'react'
import { ResourceAPI } from '../../services/api'
import AdminSidebar from '../../components/AdminSidebar'

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
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

  const filteredResources = resources.filter(res =>
    (selectedType === '' || res.resourceType === selectedType)
  )

  const handleAddResource = async (e) => {
    e.preventDefault()
    try {
      await ResourceAPI.create({
        ...newResource,
        capacity: parseInt(newResource.capacity)
      })
      setShowAddModal(false)
      setNewResource({ resourceName: '', resourceType: 'CLASSROOM', location: '', capacity: '', availableFrom: '08:00', availableUntil: '20:00', status: 'ACTIVE', features: '' })
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
                className="bg-white border border-gray-100 rounded-[2rem] px-6 py-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all shadow-xl shadow-gray-200/20 italic cursor-pointer appearance-none bg-no-repeat"
                style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"8\" viewBox=\"0 0 12 8\"><path fill=\"%23374151\" d=\"M1 1l5 5 5-5\"/></svg>')", backgroundPosition: 'right 14px center', backgroundSize: '16px 12px', paddingRight: '40px'}}
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
            </div>

            {loading ? (
              <div className="min-h-[400px] flex items-center justify-center italic text-gray-400 font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Registry...</div>
            ) : filteredResources.length === 0 ? (
               <div className="min-h-[400px] flex flex-col items-center justify-center p-20 text-center space-y-8 bg-white rounded-[4rem] border border-dashed border-gray-200 opacity-50 grayscale italic">
                <div className="text-6xl">🏢</div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">No matching nodes in registry.</p>
              </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {resources.map((resource) => (
                    <div key={resource.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/20 group hover:-translate-y-1 transition-all">
                       <div className="space-y-4">
                          <div className="flex justify-between items-start gap-2">
                             <h3 className="text-base font-black text-gray-900 tracking-tight italic uppercase truncate">{resource.resourceName}</h3>
                             <span className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest whitespace-nowrap ${resource.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                                {resource.status}
                             </span>
                          </div>

                          <div className="space-y-2">
                             <div className="flex items-center gap-2 text-gray-400 text-[9px] font-black uppercase tracking-widest italic">
                               <span className="text-primary opacity-50">📍</span>
                               <span className="truncate">{resource.location}</span>
                             </div>
                             <div className="flex items-center gap-2 text-gray-400 text-[9px] font-black uppercase tracking-widest italic">
                               <span className="text-primary opacity-50">👥</span>
                               {resource.capacity} Slots
                             </div>
                          </div>

                          <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic truncate">{resource.resourceType}</span>
                            <div className="flex gap-1">
                               <button className="text-[8px] font-black text-primary hover:text-black transition-colors uppercase italic p-1 hover:bg-gray-50 rounded">Edit</button>
                               <button onClick={() => handleDeleteResource(resource.id)} className="text-[8px] font-black text-rose-500 hover:text-rose-700 transition-colors uppercase italic p-1 hover:bg-rose-50 rounded">Del</button>
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
                      {/* Row 1: Resource Name & Type */}
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
                              <option value="EQUIPMENT">Equipment</option>
                              <option value="LECTURE_HALL">Lecture Hall</option>
                            </select>
                         </div>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Type</label>
                         <select 
                           value={newResource.resourceType}
                           onChange={(e) => setNewResource({ ...newResource, resourceType: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer appearance-none bg-no-repeat"
                           style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"8\" viewBox=\"0 0 12 8\"><path fill=\"%23666\" d=\"M1 1l5 5 5-5\"/></svg>')", backgroundPosition: 'right 12px center'}}
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

                      {/* Row 2: Location & Capacity */}
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

                      {/* Row 3: Available From & Until */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Available From</label>
                            <input 
                              type="time" 
                              value={newResource.availableFrom}
                              onChange={(e) => setNewResource({ ...newResource, availableFrom: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm" 
                            />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Available Until</label>
                            <input 
                              type="time" 
                              value={newResource.availableUntil}
                              onChange={(e) => setNewResource({ ...newResource, availableUntil: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm" 
                            />
                         </div>
                      </div>

                      {/* Row 4: Status */}
                      <div className="grid grid-cols-1 gap-4">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Status</label>
                            <select 
                              value={newResource.status}
                              onChange={(e) => setNewResource({ ...newResource, status: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm cursor-pointer"
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="MAINTENANCE">MAINTENANCE</option>
                            </select>
                         </div>
                      </div>

                      {/* Row 5: Features */}
                      <div className="grid grid-cols-1 gap-4">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Features</label>
                            <textarea 
                              placeholder="e.g. Projector, AC, Whiteboard..."
                              value={newResource.features}
                              onChange={(e) => setNewResource({ ...newResource, features: e.target.value })}
                              rows="3"
                              className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm resize-none" 
                            />
                         </div>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Capacity</label>
                         <input 
                           type="number" 
                           placeholder="e.g. 60"
                           required 
                           value={newResource.capacity}
                           onChange={(e) => setNewResource({ ...newResource, capacity: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         />
                      </div>
                   </div>

                      <div className="pt-10 flex gap-6">
                         <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-10 py-4 text-[12px] font-black uppercase tracking-[0.2em] text-gray-700 hover:text-gray-900 transition-colors italic border border-gray-200 rounded-2xl hover:border-gray-300 bg-gray-50">Cancel</button>
                         <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95">Add Resource</button>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Available Until</label>
                         <input 
                           type="time" 
                           value={newResource.availableUntil}
                           onChange={(e) => setNewResource({ ...newResource, availableUntil: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         />
                      </div>
                   </div>

                   {/* Row 4: Status */}
                   <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Status</label>
                      <select 
                        value={newResource.status}
                        onChange={(e) => setNewResource({ ...newResource, status: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer appearance-none bg-no-repeat"
                        style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"8\" viewBox=\"0 0 12 8\"><path fill=\"%23666\" d=\"M1 1l5 5 5-5\"/></svg>')", backgroundPosition: 'right 12px center'}}
                      >
                        <option value="ACTIVE">Active</option>

                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                   </div>

                   {/* Row 5: Features */}
                   <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Features</label>
                      <textarea 
                        placeholder="e.g. Projector, AC, Whiteboard..."
                        value={newResource.features}
                        onChange={(e) => setNewResource({ ...newResource, features: e.target.value })}
                        rows="4"
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                      />
                   </div>

                   {/* Buttons */}
                   <div className="flex gap-4 pt-6">
                      <button 
                        type="button" 
                        onClick={() => setShowAddModal(false)} 
                        className="flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wide text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md"
                      >
                        Add Resource
                      </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <div className="bg-white w-full max-w-3xl rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h2 className="text-2xl font-bold text-gray-900">Edit Resource</h2>
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

                <form onSubmit={handleUpdateResource} className="space-y-6">
                   {/* Row 1: Resource Name & Type */}
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Resource Name</label>
                         <input 
                           type="text" 
                           placeholder="e.g. Hall C-110"
                           required 
                           value={editingResource.resourceName}
                           onChange={(e) => setEditingResource({ ...editingResource, resourceName: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Type</label>
                         <select 
                           value={editingResource.resourceType}
                           onChange={(e) => setEditingResource({ ...editingResource, resourceType: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer appearance-none bg-no-repeat"
                           style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"8\" viewBox=\"0 0 12 8\"><path fill=\"%23666\" d=\"M1 1l5 5 5-5\"/></svg>')", backgroundPosition: 'right 12px center'}}
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

                   {/* Row 2: Location & Capacity */}
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Location / Block</label>
                         <input 
                           type="text" 
                           placeholder="e.g. Block C, 1st Floor"
                           required 
                           value={editingResource.location}
                           onChange={(e) => setEditingResource({ ...editingResource, location: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Capacity</label>
                         <input 
                           type="number" 
                           placeholder="e.g. 60"
                           required 
                           value={editingResource.capacity}
                           onChange={(e) => setEditingResource({ ...editingResource, capacity: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         />
                      </div>
                   </div>

                   {/* Row 3: Status */}
                   <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Status</label>
                      <select 
                        value={editingResource.status}
                        onChange={(e) => setEditingResource({ ...editingResource, status: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer appearance-none bg-no-repeat"
                        style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"8\" viewBox=\"0 0 12 8\"><path fill=\"%23666\" d=\"M1 1l5 5 5-5\"/></svg>')", backgroundPosition: 'right 12px center'}}
                      >
                        <option value="ACTIVE">Active</option>

                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                   </div>

                   {/* Buttons */}
                   <div className="flex gap-4 pt-6">
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowEditModal(false)
                          setEditingResource(null)
                        }} 
                        className="flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wide text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md"
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
