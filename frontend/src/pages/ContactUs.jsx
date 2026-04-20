import React, { useState } from 'react'

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
    { icon: '🕐', label: 'Hours', value: 'Mon - Fri', subtext: '9:00 AM - 6:00 PM' }
  ]

  return (
    <div className="bg-white min-h-screen selection:bg-primary/10">
      {/* Hero Section */}
      <section className="relative py-32 bg-gray-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Contact Gateway</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic mb-8">
            Get <span className="text-primary not-italic">Synchronized</span>.
          </h1>
          <p className="max-w-xl mx-auto text-lg text-gray-400 font-medium">
            Open a direct support channel with our infrastructure management team.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:-translate-y-2 transition-all group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-primary/10 transition-colors">{info.icon}</div>
                <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">{info.label}</div>
                <div className="text-sm font-black text-gray-900 tracking-tight leading-snug">
                  {info.label === 'Office' ? (
                    <a href="#" className="hover:text-primary transition-colors underline decoration-primary/20 underline-offset-4">{info.value}</a>
                  ) : (
                    info.value
                  )}
                </div>
                {info.subtext && <div className="text-[10px] font-bold text-gray-400 mt-2 uppercase">{info.subtext}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-stretch">
            <div className="lg:w-1/3 space-y-8">
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none italic">
                Send a <span className="text-primary not-italic">Transmission</span>
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Describe your inquiry or technical requirement below. Our response algorithm prioritizes system-critical requests.
              </p>
              <div className="pt-10 border-t border-gray-100">
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 italic">Response Threshold</div>
                <div className="text-sm font-black text-gray-900">&lt; 24 Hour Turnaround</div>
              </div>
            </div>

            <div className="lg:w-2/3 bg-gray-50/50 p-12 rounded-[3.5rem] border border-gray-100">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-zoom-in">
                  <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl shadow-emerald-500/30">✓</div>
                  <h3 className="text-2xl font-black text-gray-900 italic">Transmission Dispatched.</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting feedback loop...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Initiator Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                        placeholder="Verified Identity"
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Relay Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                        placeholder="contact@relay.io"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Primary Objective</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                      placeholder="Inquiry Identifier"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pl-1">Extended Telemetry</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-white border-none rounded-2xl px-6 py-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm min-h-[200px]"
                      placeholder="Payload data..."
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-gray-900 text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-gray-900/20 hover:bg-black hover:-translate-y-1 transition-all active:scale-95"
                  >
                    Authorize Dispatch 📡
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
