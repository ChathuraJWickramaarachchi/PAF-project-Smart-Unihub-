import React from 'react'
import { useLocation } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const location = useLocation()

  const dashboardPages = [
    '/admin-dashboard',
    '/admin/users',
    '/technician-dashboard',
    '/manager-dashboard',
    '/user-dashboard',
    '/profile',
    '/bookings',
    '/resources',
    '/admin/tickets',
    '/notifications',
    '/admin/analytics'
  ]

  if (dashboardPages.includes(location.pathname)) {
    return null
  }

  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          &copy; {currentYear} SmartUni Portal. System Verified.
        </p>
        <div className="flex gap-8">
          {['Privacy Protocol', 'Service Terms', 'Network Support'].map(link => (
            <a key={link} href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
