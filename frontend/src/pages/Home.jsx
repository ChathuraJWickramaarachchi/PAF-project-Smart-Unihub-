import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const features = [
    { icon: '🏢', title: 'Asset Logic', desc: 'Book and manage campus facilities via intelligent routing.' },
    { icon: '📅', title: 'Scheduling', desc: 'Real-time synchronization of shared lecture and lab spaces.' },
    { icon: '🎫', title: 'Ticket Flow', desc: 'Instant dispatch of maintenance telemetry to field staff.' },
    { icon: '🔔', title: 'Alert Node', desc: 'Instant push notifications for all status changes.' }
  ]

  return (
    <div className="bg-white min-h-screen selection:bg-primary/10">
      {/* Hero Section */}
      <section className="relative py-40 bg-gray-900 overflow-hidden">
        {/* Background Animation Bits */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Deployment v2.4.0</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] italic">
              Optimize <span className="text-primary not-italic">Campus</span> <br/> Resources.
            </h1>
            <p className="max-w-md text-xl text-gray-400 font-medium leading-relaxed italic">
              The neural center for smart university infrastructure management. 
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
              <Link to="/login" className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 hover:shadow-primary/50 transition-all active:scale-95">
                Initialize System
              </Link>
              <Link to="/about" className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                Registry Information
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative group">
             <div className="absolute inset-0 bg-primary/20 rounded-[4rem] rotate-3 group-hover:rotate-6 transition-transform"></div>
             <div className="relative bg-gray-800 border border-white/10 aspect-square rounded-[4rem] shadow-2xl overflow-hidden flex items-center justify-center -rotate-3 group-hover:-rotate-0 transition-transform">
                <div className="text-[200px] animate-float italic font-black text-primary opacity-20">UNI</div>
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
            <div className="max-w-xl">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-6 pl-1">Capability Matrix</h2>
              <p className="text-5xl font-black text-gray-900 tracking-tighter italic leading-none">Modules built for total campus <span className="text-primary not-italic underline decoration-primary/20">autonomy</span>.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50/50 p-12 rounded-[3.5rem] border border-gray-100 hover:bg-white hover:border-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-10 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">{feature.icon}</div>
                <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight uppercase italic">{feature.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Grid Break */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-900 rounded-[4rem] p-20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
              <div className="lg:w-1/2 space-y-8">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-snug italic">Synchronizing the <span className="text-primary not-italic">Academic</span> Ecosystem.</h2>
                <p className="text-gray-400 text-lg font-medium leading-relaxed">
                  SmartUni Portal isn't just an interface; it's a protocol for campus efficiency. We reduce administrative overhead by 40% through automated allocation algorithms.
                </p>
                <div className="flex gap-10 pt-4">
                  <div>
                    <div className="text-3xl font-black text-white italic tracking-tighter">150+</div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Managed Assets</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white italic tracking-tighter">24/7</div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Active Uptime</div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                <div className="aspect-[4/5] bg-white/5 rounded-[3rem] border border-white/10 group-hover:rotate-2 transition-transform"></div>
                <div className="aspect-[4/5] bg-primary/10 rounded-[3rem] border border-white/10 mt-12 group-hover:-rotate-2 transition-transform"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40">
        <div className="max-w-4xl mx-auto px-6 text-center italic relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-12 relative z-10">
            Interface <span className="text-primary flex items-center justify-center gap-4 mt-4">Now <span className="w-16 h-1 bg-primary/20 rounded-full"></span></span>
          </h2>
          <Link to="/login" className="inline-block relative z-10 bg-primary text-white px-16 py-6 rounded-2xl font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 hover:-translate-y-2 hover:shadow-primary/60 transition-all active:scale-95">
            Log into Portal
          </Link>
        </div>
      </section>
    </div>
  )
}
