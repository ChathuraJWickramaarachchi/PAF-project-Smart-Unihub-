import React, { useState, useEffect } from 'react'
import { ResourceAPI } from '../services/api'
import './Pages.css'

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

  // filter resources by search term
  const filteredResources = resources.filter(res => 
    res.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.resourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getIconForType = (type) => {
    switch(type) {
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
    <div className="page-container" style={{ paddingBottom: '4rem' }}>
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem', textAlign: 'center' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#1e3a8a' }}>Our Facilities</h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', maxWidth: '600px' }}>
          Explore the state-of-the-art facilities and resources available at our smart campus. 
        </p>
      </div>

      <div className="search-bar" style={{ maxWidth: '600px', margin: '0 auto 3rem auto', display: 'flex' }}>
        <input
          type="text"
          placeholder="Search classrooms, labs, locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            flex: 1, 
            padding: '0.8rem 1.2rem', 
            borderRadius: '2rem', 
            border: '1px solid #d1d5db', 
            fontSize: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>Loading facilities data...</p>
        </div>
      ) : error ? (
        <div className="error-message" style={{ textAlign: 'center', margin: '2rem auto', maxWidth: '600px' }}>
          {error}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: '#6b7280', fontSize: '1.2rem' }}>No facilities found matching your search.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2rem',
          padding: '1rem 0' 
        }}>
          {filteredResources.map((resource) => (
            <div key={resource.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              overflow: 'hidden',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #f3f4f6',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}>
              
              <div style={{
                height: '140px',
                background: 'linear-gradient(120deg, #1e3a8a 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '5rem'
              }}>
                {getIconForType(resource.resourceType)}
              </div>
              
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#111827', margin: 0, lineHeight: 1.2 }}>
                    {resource.resourceName}
                  </h3>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    padding: '0.25rem 0.75rem', 
                    backgroundColor: resource.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', 
                    color: resource.status === 'ACTIVE' ? '#166534' : '#991b1b',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap',
                    marginLeft: '0.5rem'
                  }}>
                    {resource.status}
                  </span>
                </div>
                
                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', color: '#4b5563', fontSize: '0.95rem' }}>
                  <span style={{ marginRight: '0.5rem', width: '20px', textAlign: 'center' }}>📍</span>
                  {resource.location}
                </div>
                
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', color: '#4b5563', fontSize: '0.95rem' }}>
                  <span style={{ marginRight: '0.5rem', width: '20px', textAlign: 'center' }}>👥</span>
                  Capacity: <strong style={{ marginLeft: '0.25rem' }}>{resource.capacity}</strong>
                </div>
                
                <div style={{ 
                  marginTop: 'auto', 
                  paddingTop: '1.25rem', 
                  borderTop: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    color: '#4b5563', 
                    backgroundColor: '#f3f4f6', 
                    padding: '0.35rem 0.75rem', 
                    borderRadius: '0.5rem',
                    fontWeight: '500'
                  }}>
                    {resource.resourceType?.replace('_', ' ')}
                  </span>
                  
                  <button style={{
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
