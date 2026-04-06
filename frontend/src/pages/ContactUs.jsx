import React, { useState } from 'react'
import './Pages.css'

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Contact form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const contactInfo = [
    { icon: '📧', label: 'Email', value: 'unibridge@gmail.com' },
    { icon: '📞', label: 'Phone', value: '+94 11587469' },
    { icon: '📍', label: 'Office', value: 'SLIIT Malabe Campus', subtext: 'New Kandy Road, Malabe' },
    { icon: '🕐', label: 'Working Hours', value: 'Monday - Friday', subtext: '9:00 AM - 6:00 PM IST' }
  ]

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get In Touch</h1>
          <p>We'd love to hear from you. Send us a message!</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-info-card">
                <div className="contact-info-icon">{info.icon}</div>
                <div className="contact-info-label">{info.label}</div>
                {info.label === 'Office' ? (
                  <a 
                    href="https://www.google.com/maps/search/SALIIT+Malabe+Campus+New+Kandy+Road+Malabe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-info-value-link"
                  >
                    {info.value}
                  </a>
                ) : (
                  <div className="contact-info-value">{info.value}</div>
                )}
                {info.subtext && (
                  <div className="contact-info-subtext">{info.subtext}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="contact-form-container">
            <div className="form-header">
              <h2>Send Us a Message</h2>
              <p>Fill out the form below and we'll get back to you as soon as possible</p>
            </div>

            {submitted ? (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Message Sent!</h3>
                <p>Thank you for contacting us. We'll respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit">
                  Send Message 📨
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="map-section">
        <div className="map-placeholder">
          <div className="map-content">
            <h3>📍 Our Location</h3>
            <p>Interactive map would be displayed here</p>
            <p>123 University Ave, Campus City</p>
          </div>
        </div>
      </section>
    </div>
  )
}
