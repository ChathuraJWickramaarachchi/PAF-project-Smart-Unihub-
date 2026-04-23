import React, { useState, useEffect } from 'react'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheckCircle, FaWhatsapp, FaGlobe, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaChevronDown, FaRocket, FaHeadset, FaUsers, FaStar, FaArrowRight, FaCopy, FaCheck, FaPlayCircle } from 'react-icons/fa'

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [openFaq, setOpenFaq] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Check if office is currently open
  const isOfficeOpen = () => {
    const day = currentTime.getDay()
    const hour = currentTime.getHours()
    const minute = currentTime.getMinutes()
    const timeInMinutes = hour * 60 + minute
    
    // Monday (1) to Friday (5), 8:30 AM (510 min) to 5:30 PM (1050 min)
    return day >= 1 && day <= 5 && timeInMinutes >= 510 && timeInMinutes <= 1050
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    setShowSuccessModal(true)
    setFormData({ name: '', email: '', subject: '', message: '', inquiryType: 'general' })
    
    setTimeout(() => {
      setIsSubmitted(false)
      setShowSuccessModal(false)
    }, 5000)
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: 'Email Address',
      items: [
        { label: 'Contact Email', value: 'smartuniportal@gmail.com', link: 'mailto:smartuniportal@gmail.com' }
      ],
      color: 'from-blue-500 to-blue-600',
      description: 'Response within 24 hours',
      stats: 'Email Support'
    },
    {
      icon: FaPhone,
      title: 'Phone Number',
      items: [
        { label: 'Contact Number', value: '070 529 6464', link: 'tel:+94705296464' }
      ],
      color: 'from-green-500 to-green-600',
      description: 'Mon-Fri, 8:30 AM - 5:30 PM',
      stats: 'Call Us'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Office Location',
      items: [
        { label: 'Campus', value: 'SLIIT Malabe Campus' },
        { label: 'Address', value: 'New Kandy Road, Malabe' }
      ],
      color: 'from-orange-500 to-orange-600',
      description: 'Visit by appointment',
      stats: 'Main Campus'
    },
    {
      icon: FaClock,
      title: 'Office Hours',
      items: [
        { label: 'Monday - Friday', value: '8:30 AM - 5:30 PM', status: 'open' },
        { label: 'Saturday', value: 'Closed', status: 'closed' },
        { label: 'Sunday', value: 'Closed', status: 'closed' }
      ],
      color: 'from-purple-500 to-purple-600',
      description: isOfficeOpen() ? 'Currently Open' : 'Currently Closed',
      isLive: true,
      stats: '40 Hours/Week'
    }
  ]

  const testimonials = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Dean of Technology',
      university: 'Tech University',
      quote: 'SmartUni Portal transformed how we manage campus resources. The support team is exceptional!',
      rating: 5,
      avatar: 'S'
    },
    {
      name: 'Prof. James Anderson',
      role: 'IT Director',
      university: 'State College',
      quote: 'Implementation was smooth and the ongoing support has been incredible. Highly recommended!',
      rating: 5,
      avatar: 'J'
    },
    {
      name: 'Maria Rodriguez',
      role: 'Campus Manager',
      university: 'Metro University',
      quote: 'The best decision we made for our campus. Student satisfaction increased by 40%!',
      rating: 5,
      avatar: 'M'
    }
  ]

  const faqs = [
    {
      question: 'How quickly can we implement SmartUni Portal?',
      answer: 'Most universities are fully onboarded within 2-4 weeks. Our dedicated team handles the entire setup process, including data migration, custom configuration, and staff training.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes! We offer a 30-day free trial with full access to all features. No credit card required, and you can cancel anytime. Our team will provide full support during your trial period.'
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'We provide comprehensive support including 24/7 email support, live chat during business hours, phone support for urgent issues, and dedicated account managers for enterprise clients.'
    },
    {
      question: 'Can we customize the platform for our specific needs?',
      answer: 'Absolutely! SmartUni Portal is highly customizable. We work closely with you to tailor workflows, dashboards, reports, and integrations to match your institution\'s unique requirements.'
    },
    {
      question: 'What are the pricing plans?',
      answer: 'We offer flexible pricing based on campus size, number of users, and features needed. Contact our sales team for a custom quote tailored to your institution\'s needs.'
    },
    {
      question: 'Do you provide training for our staff?',
      answer: 'Yes! We provide comprehensive training sessions including live workshops, video tutorials, detailed documentation, and ongoing support to ensure your team can use the platform effectively.'
    }
  ]

  const features = [
    { icon: FaRocket, title: 'Quick Setup', description: 'Get started in under 2 weeks', color: 'text-blue-500' },
    { icon: FaHeadset, title: '24/7 Support', description: 'Round-the-clock assistance', color: 'text-green-500' },
    { icon: FaUsers, title: 'Expert Team', description: 'Dedicated specialists', color: 'text-purple-500' },
    { icon: FaStar, title: '5-Star Rated', description: 'Trusted by 100+ universities', color: 'text-yellow-500' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 backdrop-blur-sm rounded-full mb-8 border border-primary/30">
            <FaRocket className="text-primary text-sm" />
            <span className="text-primary text-sm font-semibold">Get in Touch</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Let's Start a <span className="text-primary">Conversation</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
            Have questions about SmartUni Portal? We'd love to hear from you. Our team is ready to help you transform campus management.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {[
              { number: '100+', label: 'Universities' },
              { number: '24/7', label: 'Support' },
              { number: '< 4hrs', label: 'Response Time' },
              { number: '99.9%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-gray-50 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Top accent line */}
                <div className={`h-1 bg-gradient-to-r ${info.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                
                <div className="p-6 relative">
                  {/* Icon with animated background */}
                  <div className="relative mb-5">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${info.color} text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <info.icon className="w-7 h-7" />
                    </div>
                    {/* Pulsing ring effect */}
                    <div className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${info.color} opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500 animate-ping`}></div>
                  </div>
                  
                  {/* Stats badge */}
                  <div className="absolute top-6 right-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                      {info.stats}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-5 group-hover:text-gray-900 transition-colors">{info.title}</h3>
                  
                  {/* Contact items */}
                  <div className="space-y-4 mb-5">
                    {info.items.map((item, i) => (
                      <div key={i} className="group/item relative">
                        {/* Hover background */}
                        <div className="absolute inset-0 bg-gray-50 rounded-lg transform scale-x-0 group-hover/item:scale-x-100 transition-transform duration-300 origin-left"></div>
                        
                        <div className="relative flex items-start justify-between py-2 px-2 -mx-2 rounded-lg">
                          <div className="flex-1 pr-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{item.label}</p>
                            {item.link ? (
                              <a href={item.link} className="text-sm text-gray-900 hover:text-primary font-medium transition-colors hover:underline block">
                                {item.value}
                              </a>
                            ) : (
                              <p className="text-sm text-gray-900 font-medium">{item.value}</p>
                            )}
                          </div>
                          {item.value.includes('@') && (
                            <button
                              onClick={() => copyToClipboard(item.value, `${info.title}-${i}`)}
                              className="relative flex-shrink-0 p-2 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300 group/btn"
                            >
                              {copiedField === `${info.title}-${i}` ? (
                                <FaCheck className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <FaCopy className="w-3.5 h-3.5 text-gray-400 group-hover/btn:text-primary transition-colors" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Status badge */}
                  <div className={`relative px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 overflow-hidden transition-all duration-300 ${
                    info.isLive 
                      ? isOfficeOpen()
                        ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 group-hover:from-green-100 group-hover:to-green-200'
                        : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 group-hover:from-red-100 group-hover:to-red-200'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200 group-hover:from-gray-100 group-hover:to-gray-200'
                  }`}>
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {info.isLive && (
                      <span className={`relative flex h-2.5 w-2.5 ${isOfficeOpen() ? 'text-green-500' : 'text-red-500'}`}>
                        {isOfficeOpen() && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOfficeOpen() ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      </span>
                    )}
                    <span className="relative z-10">{info.description}</span>
                  </div>
                </div>
                
                {/* Bottom gradient line */}
                <div className={`h-0.5 bg-gradient-to-r ${info.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100 origin-right`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-all group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 group-hover:bg-white group-hover:shadow-lg transition-all mb-4`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white p-10 rounded-2xl border border-gray-200 shadow-lg">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                <p className="text-gray-600">Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>
              
              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                  <FaCheckCircle className="text-green-600 text-xl" />
                  <div>
                    <p className="font-semibold text-green-900">Message Sent Successfully!</p>
                    <p className="text-sm text-green-700">We'll respond to your inquiry soon.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="john@university.edu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Inquiry Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="sales">Sales & Pricing</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="Tell us more about your needs..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>Send Message</span>
                      <FaArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Office Status Card */}
              <div className={`p-6 rounded-2xl border-2 ${
                isOfficeOpen() 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300' 
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
              }`}>
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                    isOfficeOpen() ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    <FaClock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {isOfficeOpen() ? 'Open Now' : 'Closed'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                    <span className="text-sm font-semibold text-gray-900">Weekdays</span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">8:30 AM - 5:30 PM</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                    <span className="text-sm font-semibold text-gray-900">Weekends</span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Closed</span>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-5">Quick Contact</h3>
                  <div className="space-y-3">
                    <a href="tel:+94112874500" className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all group">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <FaPhone className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-300 mb-0.5">Call Us</p>
                        <p className="text-sm font-bold">+94 112 874 500</p>
                      </div>
                      <FaArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <a href="https://wa.me/94771234567" className="flex items-center gap-4 p-4 bg-green-600/20 backdrop-blur-sm rounded-xl hover:bg-green-600/30 transition-all group">
                      <div className="w-10 h-10 bg-green-600/30 rounded-lg flex items-center justify-center">
                        <FaWhatsapp className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-300 mb-0.5">WhatsApp</p>
                        <p className="text-sm font-bold">+94 77 123 4567</p>
                      </div>
                      <FaArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <a href="mailto:support@smartuni.edu" className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all group">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <FaEnvelope className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-300 mb-0.5">Email</p>
                        <p className="text-sm font-bold">support@smartuni.edu</p>
                      </div>
                      <FaArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Testimonial Card */}
              <div className="bg-gradient-to-br from-primary/5 to-blue-50 p-6 rounded-2xl border border-primary/10">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed italic text-sm">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{testimonials[activeTestimonial].name}</p>
                    <p className="text-xs text-gray-500">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i === activeTestimonial ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Compact Sidebar Style */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left side - Contact info */}
            <div className="lg:col-span-2">
              <div className="text-center lg:text-left mb-12">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full mb-4">
                  <FaPlayCircle className="text-primary text-sm" />
                  <span className="text-primary text-sm font-semibold">FAQ</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600">Find quick answers to common questions about SmartUni Portal</p>
              </div>
              <div className="space-y-3">
                {faqs.slice(0, 4).map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 pr-4">{faq.question}</h3>
                      <FaChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === index && (
                      <div className="px-5 pb-5 animate-fade-in">
                        <div className="w-full h-px bg-gray-200 mb-3"></div>
                        <p className="text-gray-600 leading-relaxed text-sm">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center lg:text-left">
                <p className="text-sm text-gray-600 mb-3">Can't find what you're looking for?</p>
                <a href="mailto:support@smartuni.edu" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                  <FaEnvelope className="w-4 h-4" />
                  <span>Contact our support team</span>
                  <FaArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Right side - Quick FAQ sidebar */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary/5 to-blue-50 p-6 rounded-2xl border border-primary/10 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Help</h3>
                <div className="space-y-3">
                  {faqs.slice(0, 3).map((faq, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-primary/10 hover:shadow-md transition-all cursor-pointer" onClick={() => setOpenFaq(index)}>
                      <p className="text-xs font-semibold text-gray-900 mb-2 line-clamp-2">{faq.question}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-primary/10">
                  <p className="text-xs text-gray-600 mb-3">Need more help?</p>
                  <a href="tel:+94112874500" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all">
                    <FaPhone className="w-3 h-3" />
                    <span>Call Support</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full mb-4">
              <FaMapMarkerAlt className="text-primary text-sm" />
              <span className="text-primary text-sm font-semibold">Our Location</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Visit Our Office</h2>
            <p className="text-gray-600">SLIIT Malabe Campus, New Kandy Road, Malabe, Sri Lanka</p>
          </div>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl h-96 flex items-center justify-center border-2 border-gray-300 shadow-inner">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaMapMarkerAlt className="w-12 h-12 text-primary" />
              </div>
              <p className="text-gray-900 font-bold text-2xl mb-2">SLIIT Malabe Campus</p>
              <p className="text-sm text-gray-600 mb-6">New Kandy Road, Malabe, Sri Lanka</p>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/25">
                <FaGlobe className="w-5 h-5" />
                <span>Open in Google Maps</span>
                <FaArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Connect With Us</h2>
          <div className="flex justify-center gap-4">
            {[
              { icon: FaFacebook, label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700', members: '10K+' },
              { icon: FaTwitter, label: 'Twitter', color: 'bg-sky-500 hover:bg-sky-600', members: '5K+' },
              { icon: FaLinkedin, label: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-800', members: '8K+' },
              { icon: FaInstagram, label: 'Instagram', color: 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700', members: '12K+' }
            ].map((social, i) => (
              <button key={i} className={`${social.color} text-white px-6 py-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-1 group`}>
                <social.icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-xs font-bold mb-1">{social.label}</p>
                <p className="text-[10px] opacity-75">{social.members}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Our team is here to help you make the best decision for your institution
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:support@smartuni.edu" className="px-12 py-5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transform hover:-translate-y-1">
              Email Support
            </a>
            <a href="tel:+94112874500" className="px-12 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all transform hover:-translate-y-1">
              Call Now
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
