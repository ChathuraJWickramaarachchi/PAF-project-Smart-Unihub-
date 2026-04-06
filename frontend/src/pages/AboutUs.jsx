import React from 'react'
import { Link } from 'react-router-dom'
import './Pages.css'

export default function AboutUs() {
  const team = [
    { name: 'Admin Team', role: 'Leadership', emoji: '👨‍💼' },
    { name: 'Facility Managers', role: 'Operations', emoji: '👩‍💼' },
    { name: 'Technical Staff', role: 'Support', emoji: '👨‍🔧' },
    { name: 'Student Representatives', role: 'Feedback', emoji: '👩‍🎓' }
  ]

  const values = [
    { icon: '🎯', title: 'Efficiency', description: 'Streamlining campus operations for better productivity' },
    { icon: '🤝', title: 'Collaboration', description: 'Bringing together all stakeholders in one platform' },
    { icon: '💡', title: 'Innovation', description: 'Leveraging technology for smart campus management' },
    { icon: '⭐', title: 'Excellence', description: 'Committed to providing the best user experience' }
  ]

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About SmartUni Portal</h1>
          <p>Empowering universities with intelligent facility management solutions</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              SmartUni Portal is designed to revolutionize campus facility management by providing 
              a comprehensive, user-friendly platform that connects students, staff, and administrators. 
              We aim to simplify resource booking, streamline maintenance requests, and enhance 
              communication across the entire university community.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Core Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2>Who We Serve</h2>
            <p>SmartUni Portal is built for the entire university community</p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-emoji">{member.emoji}</div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <h2>Our Story</h2>
            <p>
              SmartUni Portal was created to address the growing need for integrated campus management 
              solutions. We understood that universities face unique challenges in coordinating facilities, 
              managing resources, and maintaining efficient communication channels.
            </p>
            <p>
              Our platform brings together years of experience in educational technology and facility 
              management to deliver a solution that's both powerful and intuitive. From small departments 
              to large campuses, SmartUni Portal scales to meet your needs.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to Transform Your Campus Management?</h2>
          <Link to="/login" className="btn-primary btn-large">Get Started Today</Link>
        </div>
      </section>
    </div>
  )
}
