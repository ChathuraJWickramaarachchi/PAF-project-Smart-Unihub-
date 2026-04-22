import React, { useState, useEffect } from 'react'
import { ResourceAPI } from '../services/api'

export default function Facilities() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')

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
    (res.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.resourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.location?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedType === '' || res.resourceType === selectedType)
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

            <div className="relative w-full max-w-xs">
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-2xl px-6 py-5 text-gray-900 font-medium italic focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer appearance-none bg-no-repeat"
                style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"8\" viewBox=\"0 0 12 8\"><path fill=\"%23374151\" d=\"M1 1l5 5 5-5\"/></svg>')", backgroundPosition: 'right 12px center', paddingRight: '40px'}}
              >
                <option value="">All Resource Types</option>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 group hover:-translate-y-2 transition-all cursor-pointer">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                   <h3 className="text-xl font-black text-gray-900 tracking-tight italic uppercase truncate max-w-[150px]">{resource.resourceName}</h3>
                   <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${resource.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
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
                    Capacity: {resource.capacity} Nodes
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">{resource.resourceType?.replace('_', ' ')}</span>
                  <button className="bg-primary text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-gray-900 transition-colors">Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
