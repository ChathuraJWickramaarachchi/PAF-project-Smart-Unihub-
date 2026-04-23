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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Campus Facilities
            </h1>
            <p className="max-w-2xl mx-auto text-gray-300 text-lg">
              Browse and manage all campus resources, classrooms, labs, and equipment.
            </p>
            <div className="relative w-full max-w-xl mx-auto">
              <input 
                type="text" 
                placeholder="Search facilities..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" 
              />
              <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-sm text-red-700 max-w-xl mx-auto">
            {error}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">No facilities found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-video bg-gray-100 flex items-center justify-center text-5xl relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                  {getIconForType(resource.resourceType)}
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-semibold text-gray-900 truncate flex-1">{resource.resourceName}</h3>
                    <span className={`ml-2 px-2.5 py-1 rounded-md text-xs font-medium ${
                      resource.status === 'ACTIVE' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {resource.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{resource.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>Capacity: {resource.capacity}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      {resource.resourceType?.replace('_', ' ')}
                    </span>
                    <button className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
