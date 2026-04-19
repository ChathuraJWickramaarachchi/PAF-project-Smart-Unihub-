import React, { useState, useEffect } from 'react'
import { NotificationAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  // Get current user ID from auth context
  const userId = user?.userId ? parseInt(user.userId) : 0

  useEffect(() => {
    fetchNotifications()
  }, [showUnreadOnly])

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      let response
      if (showUnreadOnly) {
        response = await NotificationAPI.getUnread(userId)
      } else {
        response = await NotificationAPI.getAll(userId)
      }
      setNotifications(response.data)
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await NotificationAPI.markAsRead(id)
      fetchNotifications()
    } catch (err) {
      setError('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationAPI.markAllAsRead(userId)
      fetchNotifications()
    } catch (err) {
      setError('Failed to mark all as read')
    }
  }

  const handleDelete = async (id) => {
    try {
      await NotificationAPI.delete(id)
      fetchNotifications()
    } catch (err) {
      setError('Failed to delete notification')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row selection:bg-primary/10">
      <AdminSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-12 py-8 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="space-y-1">
             <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Signal <span className="text-primary not-italic">Log</span></h1>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">System Intercepts / Incoming Transmissions</p>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={handleMarkAllAsRead}
               className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
             >
                Flush All Signals
             </button>
          </div>
        </header>

        <div className="p-12 space-y-12">
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-2xl text-[10px] font-black text-rose-700 uppercase tracking-widest animate-shake">
                {error}
              </div>
            )}

            <div className="flex items-center gap-6">
              <button 
                onClick={() => setShowUnreadOnly(false)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-xl transition-all ${!showUnreadOnly ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
              >
                All Frequency
              </button>
              <button 
                onClick={() => setShowUnreadOnly(true)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-xl transition-all ${showUnreadOnly ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
              >
                Unread Intercepts
              </button>
            </div>

            {loading ? (
              <div className="min-h-[400px] flex items-center justify-center italic text-gray-400 font-black uppercase tracking-[0.4em] animate-pulse">Scanning Transmission Buffer...</div>
            ) : notifications.length === 0 ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center p-20 text-center space-y-8 bg-white rounded-[4rem] border border-dashed border-gray-200 opacity-50 grayscale italic">
                <div className="text-6xl text-gray-200">📡</div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">No active signals in current range.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white p-10 rounded-[3rem] border transition-all duration-500 group relative overflow-hidden ${notification.isRead ? 'border-gray-50 opacity-80' : 'border-primary/20 shadow-2xl shadow-primary/5'}`}
                  >
                    {!notification.isRead && (
                       <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000"></div>
                    )}
                    
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                           <h3 className="text-xl font-black text-gray-900 tracking-tight italic uppercase truncate">
                             {notification.title}
                           </h3>
                           {!notification.isRead && (
                             <span className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(30,58,138,0.8)] animate-pulse"></span>
                           )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed italic max-w-3xl">
                          {notification.message}
                        </p>
                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic pt-2">
                          Received: {new Date(notification.createdAt).toLocaleString()} / Protocol: {notification.id}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="bg-primary/5 text-primary px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="bg-rose-50 text-rose-500 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                        >
                          Purge
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </main>
    </div>
  )
}
