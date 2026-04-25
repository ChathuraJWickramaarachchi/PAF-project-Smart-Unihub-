import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Resources API
export const ResourceAPI = {
  getAll: () => apiClient.get('/resources'),
  getById: (id) => apiClient.get(`/resources/${id}`),
  create: (data) => apiClient.post('/resources', data),
  update: (id, data) => apiClient.put(`/resources/${id}`, data),
  delete: (id) => apiClient.delete(`/resources/${id}`),
  search: (searchTerm) => apiClient.get('/resources/search', { params: { searchTerm } }),
  getByType: (type) => apiClient.get(`/resources/type/${type}`),
  getByStatus: (status) => apiClient.get(`/resources/status/${status}`),
  getByLocation: (location) => apiClient.get(`/resources/location/${location}`),
  changeStatus: (id, status) => apiClient.patch(`/resources/${id}/status`, null, { params: { status } }),
}

// Bookings API
export const BookingAPI = {
  getAll: () => apiClient.get('/bookings'),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  create: (data) => apiClient.post('/bookings', data),
  getByUser: (userId) => apiClient.get(`/bookings/user/${userId}`),
  getByResource: (resourceId) => apiClient.get(`/bookings/resource/${resourceId}`),
  getByStatus: (status) => apiClient.get(`/bookings/status/${status}`),
  approve: (id, notes) => apiClient.post(`/bookings/${id}/approve`, null, { params: { notes } }),
  reject: (id, notes) => apiClient.post(`/bookings/${id}/reject`, null, { params: { notes } }),
  cancel: (id) => apiClient.post(`/bookings/${id}/cancel`),
  update: (id, data) => apiClient.put(`/bookings/${id}`, data),
  delete: (id) => apiClient.delete(`/bookings/${id}`),
  checkAvailability: (resourceId, startTime, endTime) => apiClient.get('/bookings/check-availability', { params: { resourceId, startTime, endTime } }),
  getDailySchedule: (resourceId, date) => apiClient.get('/bookings/daily-schedule', { params: { resourceId, date } }),
}

// Tickets API
export const TicketAPI = {
  getAll: () => apiClient.get('/tickets'),
  getById: (id) => apiClient.get(`/tickets/${id}`),
  create: (data) => apiClient.post('/tickets', data),
  getByStatus: (status) => apiClient.get(`/tickets/status/${status}`),
  getByUser: (userId) => apiClient.get(`/tickets/user/${userId}`),
  getAssigned: (technicianId) => apiClient.get(`/tickets/assigned/${technicianId}`),
  getByResource: (resourceId) => apiClient.get(`/tickets/resource/${resourceId}`),
  updateStatus: (id, status) => apiClient.patch(`/tickets/${id}/status`, null, { params: { status } }),
  assign: (id, technicianId) => apiClient.post(`/tickets/${id}/assign`, null, { params: { technicianId } }),
  unassign: (id) => apiClient.post(`/tickets/${id}/unassign`),
  addResolutionNotes: (id, notes) => apiClient.patch(`/tickets/${id}/resolution-notes`, null, { params: { notes } }),
  uploadAttachments: (ticketId, files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return apiClient.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

// Comments API
export const CommentAPI = {
  getTicketComments: (ticketId) => apiClient.get(`/comments/ticket/${ticketId}`),
  getById: (id) => apiClient.get(`/comments/${id}`),
  add: (ticketId, content) => apiClient.post('/comments', { content }, { params: { ticketId } }),
  update: (id, content) => apiClient.put(`/comments/${id}`, { content }),
  delete: (id) => apiClient.delete(`/comments/${id}`),
}

// Notifications API
export const NotificationAPI = {
  getAll: (userId) => apiClient.get(`/notifications/user/${userId}`),
  getUnread: (userId) => apiClient.get(`/notifications/user/${userId}/unread`),
  getUnreadCount: (userId) => apiClient.get(`/notifications/user/${userId}/unread-count`),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: (userId) => apiClient.post(`/notifications/user/${userId}/read-all`),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
  deleteAll: (userId) => apiClient.delete(`/notifications/user/${userId}/all`),
}

// Auth API
export const AuthAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  signup: (userData) => apiClient.post('/auth/signup', userData),
  googleLogin: (idToken, requestedRole = 'USER') => apiClient.post('/auth/google-login', {
    idToken: typeof idToken === 'string' ? idToken : null,
    requestedRole,
    ...typeof idToken === 'object' ? idToken : {}
  }),
  logout: () => apiClient.post('/auth/logout'),
  health: () => apiClient.get('/auth/health'),
  verify2FASetup: (tempToken, code) => apiClient.post('/auth/2fa/verify-setup', { tempToken, code }),
  verify2FA: (tempToken, code) => apiClient.post('/auth/2fa/verify', { tempToken, code }),
}

// Users API (Admin only)
export const UserAPI = {
  getAll: () => apiClient.get('/users'),
  updateRole: (userId, role) => apiClient.put(`/users/${userId}/role`, { role }),
  updateStatus: (userId, isActive) => apiClient.put(`/users/${userId}/status`, { isActive }),
  delete: (userId) => apiClient.delete(`/users/${userId}`),
}

// Analytics API (Admin only)
export const AnalyticsAPI = {
  getStats: () => apiClient.get('/analytics'),
}

// Admin API
export const AdminAPI = {
  getPendingApprovals: () => apiClient.get('/users/pending-approvals'),
  approveUser: (userId) => apiClient.post(`/users/${userId}/approve`),
  rejectUser: (userId, data) => apiClient.post(`/users/${userId}/reject`, data),
}

export default apiClient
