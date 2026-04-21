import React, { useState, useEffect } from 'react'
import { ResourceAPI } from '../../services/api'
import AdminSidebar from '../../components/AdminSidebar'

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newResource, setNewResource] = useState({
    resourceName: '',
    resourceType: 'CLASSROOM',
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
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await ResourceAPI.delete(id)
        fetchResources()
      } catch (err) {
        setError('Failed to delete resource')
      }
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
                + Register Asset
             </button>
          </div>
        </header>

        <div className="p-12 space-y-12">
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-2xl text-[10px] font-black text-rose-700 uppercase tracking-widest animate-shake">
                {error}
              </div>
            )}

            <div className="relative group max-w-xl">
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
                 Execute
               </button>
            </div>

            {loading ? (
              <div className="min-h-[400px] flex items-center justify-center italic text-gray-400 font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Registry...</div>
            ) : resources.length === 0 ? (
               <div className="min-h-[400px] flex flex-col items-center justify-center p-20 text-center space-y-8 bg-white rounded-[4rem] border border-dashed border-gray-200 opacity-50 grayscale italic">
                <div className="text-6xl">🏢</div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">No matching nodes in registry.</p>
              </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {resources.map((resource) => (
                    <div key={resource.id} className="bg-white p-2 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 group hover:-translate-y-2 transition-all">
                       <div className="relative aspect-video bg-gray-900 rounded-[3rem] overflow-hidden flex items-center justify-center text-5xl">
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                          {resource.resourceType === 'CLASSROOM' ? '🏫' : resource.resourceType === 'LAB' ? '🔬' : '🏢'}
                       </div>
                       
                       <div className="p-8 space-y-8">
                          <div className="flex justify-between items-start">
                             <h3 className="text-xl font-black text-gray-900 tracking-tight italic uppercase truncate">{resource.resourceName}</h3>
                             <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${resource.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                {resource.status}
                             </span>
                          </div>

                          <div className="space-y-3">
                             <div className="flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-widest italic">
                               <span className="text-primary opacity-50 text-base">📍</span>
                               {resource.location}
                             </div>
                             <div className="flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-widest italic">
                               <span className="text-primary opacity-50 text-base">👥</span>
                               {resource.capacity} Active Slots
                             </div>
                          </div>

                          <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">{resource.resourceType}</span>
                            <div className="flex gap-2">
                               <button className="text-[9px] font-black text-primary hover:text-black transition-colors uppercase italic underline underline-offset-4 decoration-primary/20 p-2">Edit</button>
                               <button onClick={() => handleDeleteResource(resource.id)} className="text-[9px] font-black text-rose-500 hover:text-rose-700 transition-colors uppercase italic underline underline-offset-4 decoration-rose-500/20 p-2">Purge</button>
                            </div>
                          </div>
                       </div>
                    </div>
                  ))}
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
                              <option value="CLASSROOM">Classroom</option>
                              <option value="LAB">Laboratory</option>
                              <option value="AUDITORIUM">Auditorium</option>
                              <option value="MEETING_ROOM">Meeting Room</option>
                              <option value="SPORTS_FACILITY">Sports Facility</option>
                              <option value="EQUIPMENT">Equipment</option>
                              <option value="LECTURE_HALL">Lecture Hall</option>
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
                              <option value="INACTIVE">INACTIVE</option>
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

                      <div className="pt-10 flex gap-6">
                         <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-10 py-4 text-[12px] font-black uppercase tracking-[0.2em] text-gray-700 hover:text-gray-900 transition-colors italic border border-gray-200 rounded-2xl hover:border-gray-300 bg-gray-50">Cancel</button>
                         <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95">Add Resource</button>
                      </div>
                   </form>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}
