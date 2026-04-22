import React from 'react'
import { Link } from 'react-router-dom'

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
    <div className="bg-white selection:bg-primary/10">
      {/* Hero Section */}
      <section className="relative py-32 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20 scale-105 blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Our Heritage</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic mb-8">
            Defining <span className="text-primary">Campus</span> intelligence.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-400 font-medium leading-relaxed">
            Empowering universities with the next generation of intelligent facility management solutions.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 border-b border-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-8">The Mission</h2>
          <p className="text-3xl font-black text-gray-900 tracking-tight leading-snug">
            SmartUni Portal is architected to revolutionize university infrastructure by providing
            a unified, user-centric ecosystem. We bridge the gap between human demand and 
            physical capacity through seamless technology.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
            <div className="max-w-xl">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-6 pl-1">Core Values</h2>
              <p className="text-4xl font-black text-gray-900 tracking-tighter">Principles that drive our innovation cycle.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:-translate-y-2 transition-all group">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-primary/10 transition-colors">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-6">Service Spectrum</h2>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">Built for the entire academic community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="w-32 h-32 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 group-hover:rotate-6 transition-transform group-hover:bg-primary/5">
                  {member.emoji}
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">{member.name}</h3>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 bg-gray-900 text-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em]">Our Origin</h2>
            <p className="text-4xl font-black tracking-tighter italic">Bridging the gap since inception.</p>
            <div className="space-y-6 text-lg text-gray-400 font-medium leading-relaxed">
              <p>
                SmartUni Portal emerged from the critical need to synchronize decentralized university complex systems.
                We observed that disconnected management tools were hindering academic excellence.
              </p>
              <p>
                Today, we support thousands of nodes across multiple campuses, providing a robust telemetry 
                and resource scheduling infrastructure that adapts to the fluid needs of modern education.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-primary/10 rounded-[3rem] border border-white/5 flex items-end p-8">
              <div className="text-4xl font-black">99%<br/><span className="text-[10px] uppercase tracking-widest text-gray-500">Uptime</span></div>
            </div>
            <div className="h-48 bg-white/5 rounded-[2.5rem] border border-white/5 mt-12 flex items-end p-6">
              <div className="text-2xl font-black">50k+<br/><span className="text-[10px] uppercase tracking-widest text-gray-500">Users</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center bg-gray-50 rounded-[4rem] py-24 border border-gray-100 italic relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.02] transition-opacity"></div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-10">
            Evolve your <span className="text-primary">infrastructure</span> today.
          </h2>
          <Link to="/login" className="inline-block bg-primary text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:-translate-y-1 hover:shadow-primary/50 transition-all">
            Initialize Access
          </Link>
        </div>
      </section>
    </div>
  )
}
