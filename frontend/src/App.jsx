import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
import TechnicianDashboard from './pages/TechnicianDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import UserDashboard from './pages/UserDashboard'
import Resources from './pages/Admin/Resources'
import Bookings from './pages/Admin/Bookings'
import AdminTickets from './pages/Admin/Tickets'
import Notifications from './pages/Admin/Notifications'
import NotFound from './pages/NotFound'
import UserManagement from './pages/Admin/UserManagement'
import Analytics from './pages/Admin/Analytics'
import UserProfile from './pages/UserProfile'
import Facilities from './pages/Facilities'
import PublicTickets from './pages/PublicTickets'

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

// Simple component to redirect the root path to the correct dashboard based on role
function RootRedirect() {
  const { user } = useAuth()
  const userRole = user?.role?.toLowerCase() || ''

  let redirectPath = '/user-dashboard'
  if (userRole.includes('admin')) {
    redirectPath = '/admin-dashboard'
  } else if (userRole.includes('technician')) {
    redirectPath = '/technician-dashboard'
  } else if (userRole.includes('manager')) {
    redirectPath = '/manager-dashboard'
  }

  return <Navigate to={redirectPath} replace />
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-layout">
          <Navbar />
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
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/profile" element={<UserProfile />} />

                <Route path="/facilities" element={<Facilities />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/admin/tickets" element={<AdminTickets />} />
                <Route path="/tickets" element={<PublicTickets />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}
