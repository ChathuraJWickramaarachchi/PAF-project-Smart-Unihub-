import React, { useState, useEffect } from 'react'
import { ResourceAPI } from '../services/api'
import './Pages.css'

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
      setNewResource({ resourceName: '', resourceType: 'CLASSROOM', location: '', capacity: '' })
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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Facilities & Assets</h1>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>Add Resource</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn-primary" onClick={handleSearch} disabled={loading}>
          Search
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
      ) : resources.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No resources found</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id}>
                  <td>{resource.resourceName}</td>
                  <td>{resource.resourceType}</td>
                  <td>{resource.location}</td>
                  <td>{resource.capacity}</td>
                  <td>
                    <span className={`badge badge-${
                      resource.status === 'ACTIVE' ? 'success' : 'warning'
                    }`}>
                      {resource.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-primary">Edit</button>
                      <button className="btn-danger" onClick={() => handleDeleteResource(resource.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add New Resource</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddResource}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Resource Name</label>
                  <input
                    type="text"
                    required
                    value={newResource.resourceName}
                    onChange={(e) => setNewResource({...newResource, resourceName: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type</label>
                  <select
                    value={newResource.resourceType}
                    onChange={(e) => setNewResource({...newResource, resourceType: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  >
                    <option value="CLASSROOM">Classroom</option>
                    <option value="LAB">Laboratory</option>
                    <option value="AUDITORIUM">Auditorium</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="SPORTS_FACILITY">Sports Facility</option>
                    <option value="EQUIPMENT">Equipment</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Location</label>
                  <input
                    type="text"
                    required
                    value={newResource.location}
                    onChange={(e) => setNewResource({...newResource, location: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Capacity</label>
                  <input
                    type="number"
                    required
                    value={newResource.capacity}
                    onChange={(e) => setNewResource({...newResource, capacity: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Add Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
