import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TicketAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { FaTicketAlt, FaPlus, FaSearch, FaFilter, FaClock, FaCheckCircle, FaExclamationCircle, FaTools, FaEye } from 'react-icons/fa'

export default function UserTickets() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [user])

  const fetchTickets = async () => {
    try {
      if (user?.userId) {
        const response = await TicketAPI.getByUser(user.userId)
        setTickets(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || ''
    if (statusLower.includes('open') || statusLower.includes('pending')) {
      return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: FaClock, label: 'Pending' }
    }
    if (statusLower.includes('progress')) {
      return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: FaTools, label: 'In Progress' }
    }
    if (statusLower.includes('completed') || statusLower.includes('resolved')) {
      return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: FaCheckCircle, label: 'Completed' }
    }
    if (statusLower.includes('closed')) {
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: FaCheckCircle, label: 'Closed' }
    }
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: FaExclamationCircle, label: 'Open' }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status?.toLowerCase() === filter.toLowerCase()
    const matchesSearch = searchQuery === '' || 
      ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
            <p className="text-gray-500">Manage and track your support tickets</p>
          </div>
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-600/30 font-semibold"
          >
            <FaPlus />
            <span>Create New Ticket</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-12 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium min-w-[180px]"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', count: tickets.length, color: 'gray' },
            { label: 'Pending', count: tickets.filter(t => t.status?.toLowerCase().includes('pending') || t.status?.toLowerCase().includes('open')).length, color: 'amber' },
            { label: 'In Progress', count: tickets.filter(t => t.status?.toLowerCase().includes('progress')).length, color: 'blue' },
            { label: 'Completed', count: tickets.filter(t => t.status?.toLowerCase().includes('completed') || t.status?.toLowerCase().includes('resolved')).length, color: 'green' },
          ].map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTicketAlt className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first support ticket to get started'}
            </p>
            {!searchQuery && filter === 'all' && (
              <button
                onClick={() => navigate('/tickets')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
              >
                <FaPlus />
                <span>Create Ticket</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const statusStyle = getStatusColor(ticket.status)
              const StatusIcon = statusStyle.icon
              
              return (
                <div
                  key={ticket._id || ticket.id}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                          <FaTicketAlt className="text-lg text-gray-400 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {ticket.title || 'Untitled Ticket'}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {ticket.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                      <StatusIcon className="text-sm" />
                      <span className="text-sm font-semibold">{statusStyle.label}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-400" />
                        <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        #{ticket._id?.slice(-6).toUpperCase() || 'N/A'}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/tickets')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <FaEye />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
