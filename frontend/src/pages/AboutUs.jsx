import React from 'react'
import { Link } from 'react-router-dom'
import { FaGraduationCap, FaUsers, FaChartLine, FaShieldAlt, FaClock, FaMobileAlt, FaCloud, FaStar, FaArrowRight, FaCheck, FaHeart, FaLightbulb, FaTrophy } from 'react-icons/fa'

export default function AboutUs() {
  const stats = [
    { icon: FaUsers, value: '10K+', label: 'Active Users', color: 'text-blue-600' },
    { icon: FaChartLine, value: '99.9%', label: 'Uptime', color: 'text-green-600' },
    { icon: FaShieldAlt, value: '256-bit', label: 'Encryption', color: 'text-purple-600' },
    { icon: FaClock, value: '24/7', label: 'Support', color: 'text-orange-600' }
  ]

  const features = [
    {
      icon: FaMobileAlt,
      title: 'Mobile Ready',
      description: 'Access the platform from any device with our responsive design and native mobile apps.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: FaCloud,
      title: 'Cloud Powered',
      description: 'Built on enterprise-grade cloud infrastructure for maximum reliability and scalability.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: FaShieldAlt,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and security protocols to protect your sensitive institutional data.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: FaChartLine,
      title: 'Advanced Analytics',
      description: 'Real-time dashboards and reports to make data-driven decisions for your campus.',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const team = [
    { name: 'Innovation Lab', role: 'Research & Development', emoji: '🔬' },
    { name: 'Engineering Team', role: 'Platform Development', emoji: '⚙️' },
    { name: 'Support Squad', role: 'Customer Success', emoji: '🎯' },
    { name: 'Design Studio', role: 'User Experience', emoji: '🎨' }
  ]

  const timeline = [
    { year: '2020', event: 'SmartUni Portal founded', icon: '🚀' },
    { year: '2021', event: 'First university partnership', icon: '🤝' },
    { year: '2022', event: '100+ campuses onboarded', icon: '📈' },
    { year: '2023', event: 'AI-powered features launched', icon: '🤖' },
    { year: '2024', event: 'Global expansion begins', icon: '🌍' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-white text-sm font-medium">Trusted by 500+ Universities Worldwide</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Transforming Campus Management
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            SmartUni Portal is revolutionizing how universities manage resources, schedule facilities, and maintain campus infrastructure through intelligent automation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5">
              Get in Touch
              <FaArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all hover:-translate-y-0.5">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-50 mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-xs font-semibold text-primary">Our Mission</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Empowering Education Through Smart Technology
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that when universities have the right tools, they can focus on what matters most: education. Our platform eliminates administrative bottlenecks, reduces resource conflicts by 80%, and gives campus staff more time to support students.
              </p>
              <div className="space-y-4 pt-4">
                {['Reduce administrative overhead by 40%', 'Increase facility utilization by 65%', 'Improve response time by 3x'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FaCheck className="text-green-600 text-xs" />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-blue-100 rounded-2xl flex items-center justify-center">
                <FaGraduationCap className="w-48 h-48 text-primary/30" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-gray-200">
                <div className="text-3xl font-bold text-primary mb-1">80%</div>
                <div className="text-sm text-gray-600">Reduction in Resource Conflicts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <span className="text-xs font-semibold text-primary">Why Choose Us</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for Modern Universities</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enterprise-grade features designed specifically for academic institutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">Our Journey</h2>
            <h3 className="text-4xl font-bold text-gray-900">Milestones That Define Us</h3>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200"></div>
            {timeline.map((item, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-12' : 'text-left pl-12'}`}>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-sm font-semibold text-primary mb-1">{item.year}</div>
                    <div className="text-gray-900 font-medium">{item.event}</div>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white shadow"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <span className="text-xs font-semibold text-primary">Our Teams</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The People Behind the Platform</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Dedicated professionals working to transform campus management</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform shadow-lg">
                  {member.emoji}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Campus?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join 500+ universities already using SmartUni Portal
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5">
              Schedule Demo
              <FaArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/about" className="inline-flex items-center gap-2 px-10 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all hover:-translate-y-0.5">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
