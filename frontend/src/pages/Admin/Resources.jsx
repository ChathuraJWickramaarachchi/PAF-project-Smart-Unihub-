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
    resourceType: 'LAB',
    location: '',
    capacity: ''
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
        capacity: parseInt(newResource.capacity),
        status: 'ACTIVE'
      })
      setShowAddModal(false)
      setNewResource({ resourceName: '', resourceType: 'LAB', location: '', capacity: '' })
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
                + New Resource
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
                 Search
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
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Resource Name</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Type</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Location</th>
                        <th className="px-8 py-5 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Capacity</th>
                        <th className="px-8 py-5 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Status</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {resources.map((resource) => (
                        <tr key={resource.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6 text-sm font-black text-gray-900 uppercase tracking-tight italic">{resource.resourceName}</td>
                          <td className="px-8 py-6 text-[11px] font-black text-gray-600 uppercase tracking-widest italic">{resource.resourceType?.replace(/_/g, ' ')}</td>
                          <td className="px-8 py-6 text-sm font-bold text-gray-700">{resource.location}</td>
                          <td className="px-8 py-6 text-center text-sm font-bold text-gray-700">{resource.capacity}</td>
                          <td className="px-8 py-6 text-center">
                            <span className={`inline-block px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest ${resource.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                              {resource.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex gap-3 justify-end">
                              <button className="text-[9px] font-black text-primary hover:text-black transition-colors uppercase italic underline underline-offset-4 decoration-primary/20">Edit</button>
                              <button onClick={() => handleDeleteResource(resource.id)} className="text-[9px] font-black text-rose-500 hover:text-rose-700 transition-colors uppercase italic underline underline-offset-4 decoration-rose-500/20">Delete</button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <div className="bg-white w-full max-w-3xl rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h2 className="text-2xl font-bold text-gray-900">Add New Resource</h2>
                   </div>
                   <button 
                     onClick={() => setShowAddModal(false)}
                     className="text-gray-400 hover:text-gray-600 text-2xl"
                   >
                      ✕
                   </button>
                </div>

                <form onSubmit={handleAddResource} className="space-y-6">
                   {/* Row 1: Resource Name & Type */}
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Resource Name</label>
                         <input 
                           type="text" 
                           placeholder="e.g. Hall C-110"
                           required 
                           value={newResource.resourceName}
                           onChange={(e) => setNewResource({ ...newResource, resourceName: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         />
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
                           value={newResource.location}
                           onChange={(e) => setNewResource({ ...newResource, location: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         />
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

                   {/* Row 3: Available From & Until */}
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Available From</label>
                         <input 
                           type="time" 
                           value={newResource.availableFrom}
                           onChange={(e) => setNewResource({ ...newResource, availableFrom: e.target.value })}
                           className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                         />
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
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
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
      </main>
    </div>
  )
}
