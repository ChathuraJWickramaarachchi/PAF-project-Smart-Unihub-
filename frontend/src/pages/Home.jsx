import React from 'react'
import { Link } from 'react-router-dom'
import { FaRocket, FaShieldAlt, FaUsers, FaChartLine, FaStar, FaCheckCircle } from 'react-icons/fa'

export default function Home() {
  const features = [
    { icon: '🏢', title: 'Asset Management', desc: 'Book and manage campus facilities through intelligent scheduling.' },
    { icon: '📅', title: 'Smart Scheduling', desc: 'Real-time synchronization of shared lecture halls and lab spaces.' },
    { icon: '🎫', title: 'Ticket System', desc: 'Instant dispatch of maintenance requests to field technicians.' },
    { icon: '🔔', title: 'Notifications', desc: 'Real-time alerts for all booking and maintenance status changes.' }
  ]

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-lg border border-primary/30">
              <span className="text-xs font-medium text-primary">Version 2.4.0</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Optimize <span className="text-primary">Campus</span> Resources
            </h1>
            <p className="max-w-lg text-lg text-gray-300 leading-relaxed">
              The central platform for smart university infrastructure management. Streamline bookings, maintenance, and resource allocation.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/login" className="bg-primary text-white px-8 py-3 rounded-lg font-medium text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25">
                Get Started
              </Link>
              <Link to="/about" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-lg font-medium text-sm hover:bg-white/20 transition-all">
                Learn More
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative">
             <div className="relative bg-gray-800/50 backdrop-blur-sm border border-white/10 aspect-square rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center">
                <div className="text-[180px] font-bold text-primary/20">UNI</div>
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">Features</h2>
            <p className="text-4xl font-bold text-gray-900">Everything you need to manage your campus</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl mb-6">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px]"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Simplifying Campus Management</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  SmartUni Portal reduces administrative overhead by 40% through automated scheduling and resource allocation.
                </p>
                <div className="flex gap-8 pt-4">
                  <div>
                    <div className="text-3xl font-bold text-white">150+</div>
                    <div className="text-sm text-gray-400 mt-1">Managed Resources</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">24/7</div>
                    <div className="text-sm text-gray-400 mt-1">System Uptime</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-white/5 rounded-xl border border-white/10"></div>
                <div className="aspect-square bg-primary/10 rounded-xl border border-white/10 mt-8"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">Testimonials</h2>
            <p className="text-4xl font-bold text-gray-900">What Universities Say</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Sarah Mitchell',
                role: 'Dean of Operations',
                university: 'Tech University',
                quote: 'SmartUni Portal transformed how we manage our 200+ facilities. Bookings are now seamless.',
                rating: 5
              },
              {
                name: 'Prof. James Chen',
                role: 'IT Director',
                university: 'State College',
                quote: 'The automation features saved us 20 hours per week. Incredible platform with excellent support.',
                rating: 5
              },
              {
                name: 'Maria Rodriguez',
                role: 'Facilities Manager',
                university: 'Metro University',
                quote: 'Maintenance requests are resolved 3x faster. Our campus has never run smoother.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.university}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">Getting Started</h2>
            <p className="text-4xl font-bold text-gray-900">Simple Setup, Powerful Results</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Sign Up & Configure',
                description: 'Create your account and configure your campus layout, resources, and user roles in minutes.',
                icon: FaRocket
              },
              {
                step: '02',
                title: 'Invite Your Team',
                description: 'Add staff, faculty, and students with role-based access controls and permissions.',
                icon: FaUsers
              },
              {
                step: '03',
                title: 'Launch & Optimize',
                description: 'Go live and use real-time analytics to continuously optimize campus resource utilization.',
                icon: FaChartLine
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                  <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-gray-300 text-3xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px]"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-500/30">
                  <FaShieldAlt className="text-green-400" />
                  <span className="text-xs font-medium text-green-400">Enterprise-Grade Security</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Your Data is Safe With Us</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  We use bank-level 256-bit encryption and comply with international data protection standards to ensure your institutional data remains secure.
                </p>
                <div className="space-y-3 pt-4">
                  {['256-bit SSL Encryption', 'GDPR Compliant', '99.9% Uptime SLA', 'Daily Automated Backups'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-400" />
                      <span className="text-gray-300 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="text-3xl font-bold text-white mb-1">256-bit</div>
                    <div className="text-sm text-gray-400">Encryption</div>
                  </div>
                  <div className="bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-xl p-6">
                    <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                    <div className="text-sm text-gray-400">Uptime</div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="text-3xl font-bold text-white mb-1">24/7</div>
                    <div className="text-sm text-gray-400">Monitoring</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                    <div className="text-3xl font-bold text-white mb-1">SOC2</div>
                    <div className="text-sm text-gray-400">Certified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Join thousands of universities already using SmartUni Portal
          </p>
          <Link to="/login" className="inline-block bg-primary text-white px-10 py-4 rounded-lg font-medium text-base hover:bg-primary-dark transition-all shadow-lg shadow-primary/25">
            Login to Portal
          </Link>
        </div>
      </section>
    </div>
  )
}
