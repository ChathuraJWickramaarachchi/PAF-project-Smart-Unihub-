import React from 'react'
import { useLocation } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const location = useLocation()

  // Hide footer on dashboard pages (they have their own layouts)
  const dashboardPages = [
    '/admin-dashboard',
    '/admin/users',
    '/technician-dashboard',
    '/manager-dashboard',
    '/user-dashboard',
    '/profile',
    '/bookings',
    '/resources',
    '/tickets',
    '/notifications'
  ]
  
  if (dashboardPages.includes(location.pathname)) {
    return null
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-copyright">
          &copy; {currentYear} SmartUni Portal. All rights reserved.
        </p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </footer>
  )
}
