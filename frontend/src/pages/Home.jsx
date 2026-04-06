import React from 'react'
import { Link } from 'react-router-dom'
import './Pages.css'

export default function Home() {
  return (
    <div className="home-page-simple">
      {/* Hero Section */}
      <section className="hero-simple">
        <div className="hero-content-simple">
          <h1>Welcome to SmartUni Portal</h1>
          <p>Your one-stop platform for smart campus management</p>
          <Link to="/login" className="btn-get-started">
            Get Started →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-simple">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <div className="features-grid-simple">
            <div className="feature-card-simple">
              <div className="feature-icon-simple">🏢</div>
              <h3>Resource Management</h3>
              <p>Book and manage campus facilities easily</p>
            </div>
            <div className="feature-card-simple">
              <div className="feature-icon-simple">📅</div>
              <h3>Smart Bookings</h3>
              <p>Schedule rooms and facilities in real-time</p>
            </div>
            <div className="feature-card-simple">
              <div className="feature-icon-simple">🎫</div>
              <h3>Support Tickets</h3>
              <p>Submit and track maintenance requests</p>
            </div>
            <div className="feature-card-simple">
              <div className="feature-icon-simple">🔔</div>
              <h3>Notifications</h3>
              <p>Stay updated with instant alerts</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-simple">
        <div className="container">
          <h2 className="section-title">About SmartUni</h2>
          <p className="about-text">
            SmartUni Portal simplifies campus operations by providing an integrated platform 
            for managing facilities, bookings, and support services. Whether you're a student, 
            staff member, or administrator, our platform makes campus life easier and more efficient.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-simple">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Login now to access all features</p>
          <Link to="/login" className="btn-login">
            Login Here
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-simple">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} SmartUni Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
