import React, { useState, useEffect } from 'react'
import { ResourceAPI } from '../services/api'

export default function Facilities() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

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
      setError('Failed to load facilities. ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources.filter(res =>
    res.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.resourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getIconForType = (type) => {
    switch (type) {
      case 'CLASSROOM': return '🏫'
      case 'LAB': return '🔬'
      case 'AUDITORIUM': return '🎭'
      case 'MEETING_ROOM': return '💼'
      case 'SPORTS_FACILITY': return '⚽'
      case 'EQUIPMENT': return '💻'
      default: return '🏢'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 flex flex-col gap-10 selection:bg-primary/10">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gray-900 p-20 rounded-[4rem] group shadow-2xl shadow-gray-200">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-48 -mt-48 group-hover:bg-primary/20 transition-all duration-1000"></div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none italic">
              Campus <span className="text-primary not-italic">Infrastructure</span>
            </h1>
            <p className="max-w-2xl text-gray-400 font-medium text-lg leading-relaxed italic">
              Access the complete inventory of academic and technical facilities. 
              Search, filter, and allocate resources in real-time.
            </p>
            <div className="relative w-full max-w-xl group">
              <input 
                type="text" 
                placeholder="Search classrooms, labs, telemetry nodes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-12 py-5 text-white placeholder:text-gray-500 font-medium italic focus:ring-2 focus:ring-primary outline-none transition-all" 
              />
              <span className="absolute left-4 top-5 text-gray-500 group-focus-within:text-primary transition-colors">🔍</span>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center italic text-gray-400 font-black uppercase tracking-widest text-xs">Accessing Facility Matrix...</div>
      ) : error ? (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-[10px] font-black text-rose-700 uppercase tracking-widest animate-fade-in mx-auto max-w-xl w-full">{error}</div>
      ) : filteredResources.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8 animate-fade-in opacity-50 italic grayscale">
           <div className="text-6xl text-gray-300">🕵️</div>
           <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">No matching entities in the registry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/20 group hover:-translate-y-1 transition-all cursor-pointer">
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
                    Cap: {resource.capacity}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic truncate">{resource.resourceType?.replace('_', ' ')}</span>
                  <button className="bg-primary text-white px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-gray-900 transition-colors whitespace-nowrap">Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
