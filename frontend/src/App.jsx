import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import AdminDashboard from './pages/Admin/AdminDashboard'
import TechnicianDashboard from './pages/Technician/TechnicianDashboard'
import ManagerDashboard from './pages/Manager/ManagerDashboard'
import ManagerBookings from './pages/Manager/Bookings'
import ManagerAnalytics from './pages/Manager/Analytics'
import UserDashboard from './pages/UserDashboard'
import Resources from './pages/Admin/Resources'
import AdminTickets from './pages/Technician/Tickets'
import Notifications from './pages/Admin/Notifications'
import NotFound from './pages/NotFound'
import UserManagement from './pages/Admin/UserManagement'
import Analytics from './pages/Admin/Analytics'
import UserProfile from './pages/UserProfile'
import Facilities from './pages/Facilities'
import PublicTickets from './pages/PublicTickets'

// Component to handle conditional Navbar/Footer
function AppContent() {
  const location = useLocation()

  // Define routes where navbar and footer should be HIDDEN
  const dashboardRoutes = [
    '/admin',
    '/manager',
    '/technician',
    '/tech',
    '/user-dashboard',
    '/resources',
    '/bookings',
    '/notifications',
    '/profile'
  ]

  const isDashboard = dashboardRoutes.some(route => location.pathname.startsWith(route))

  return (
    <div className="app-layout">
      {!isDashboard && <Navbar />}
      <main className="app-main">
        <Routes>
          <Route path="/login" element={
            <NavigateIfAuthenticated>
              <Login />
            </NavigateIfAuthenticated>
          } />

          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/analytics" element={<ManagerAnalytics />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<UserProfile />} />

            <Route path="/facilities" element={<Facilities />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/bookings" element={<ManagerBookings />} />
            <Route path="/tech/tickets" element={<AdminTickets />} />
            <Route path="/tickets" element={<PublicTickets />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </div>
  )
}

// Component to redirect if user is already authenticated
function NavigateIfAuthenticated({ children }) {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user) {
    const userRole = user.role.toLowerCase()
    let redirectPath = '/home'

    if (userRole.includes('admin')) {
      redirectPath = '/admin-dashboard'
    } else if (userRole.includes('technician')) {
      redirectPath = '/technician-dashboard'
    } else if (userRole.includes('manager')) {
      redirectPath = '/manager-dashboard'
    }

    return <Navigate to={redirectPath} replace />
  }

  // Only render children if not authenticated
  return isAuthenticated ? null : children
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}
