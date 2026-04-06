import React from 'react'
import { Link } from 'react-router-dom'
import './Pages.css'

export default function NotFound() {
  return (
    <div className="page-container">
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>404</h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem' }}>
          Page not found
        </p>
        <Link to="/" className="btn-primary">
          Go back to dashboard
        </Link>
      </div>
    </div>
  )
}
