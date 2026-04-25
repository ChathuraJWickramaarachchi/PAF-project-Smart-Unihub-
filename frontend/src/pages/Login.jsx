import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('admin')
  const [email, setEmail] = useState('admin@smartcampus.edu')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, googleLogin, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role.toLowerCase()
      let redirectPath = '/'
      if (userRole.includes('admin')) {
        redirectPath = '/admin-dashboard'
      } else if (userRole.includes('technician')) {
        redirectPath = '/technician-dashboard'
      } else if (userRole.includes('manager')) {
        redirectPath = '/manager-dashboard'
      } else {
        redirectPath = '/user-dashboard'
      }
      navigate(redirectPath, { replace: true, state: { showLoginToast: true } })
    }
  }, [isAuthenticated, user, navigate])

  const roles = [
    { id: 'admin', title: 'Admin', description: 'Root Access', icon: '👑', demoEmail: 'admin@smartcampus.edu', demoPassword: 'password123' },
    { id: 'user', title: 'User', description: 'End Node', icon: '👤', demoEmail: 'user@smartcampus.edu', demoPassword: 'password123' },
    { id: 'technician', title: 'Technician', description: 'Field Ops', icon: '🔧', demoEmail: 'tech@smartcampus.edu', demoPassword: 'password123' },
    { id: 'manager', title: 'Manager', description: 'Governance', icon: '📋', demoEmail: 'faculty@smartcampus.edu', demoPassword: 'password123' }
  ]

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId)
    const role = roles.find(r => r.id === roleId)
    if (role) {
      setEmail(role.demoEmail)
      setPassword(role.demoPassword)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      const userRole = result.data.role.toLowerCase()
      let redirectPath = '/'
      if (userRole.includes('admin')) redirectPath = '/admin-dashboard'
      else if (userRole.includes('technician')) redirectPath = '/technician-dashboard'
      else if (userRole.includes('manager')) redirectPath = '/manager-dashboard'
      else redirectPath = '/user-dashboard'
      navigate(redirectPath, { replace: true, state: { showLoginToast: true } })
    } catch (err) {
      setError(err.message || 'Verification sequence failed. Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (response) => {
    setError('')
    setLoading(true)
    try {
      const idToken = response.credential || response.id_token
      if (!idToken) throw new Error('No credential received from Google')
      const roleMapping = { 'admin': 'ADMIN', 'user': 'USER', 'technician': 'TECHNICIAN', 'manager': 'MANAGER' }
      const selectedRoleName = roleMapping[selectedRole] || 'USER'
      const data = await googleLogin(idToken, selectedRoleName)
      const userRole = data.role.toLowerCase()
      let redirectPath = '/'
      if (userRole.includes('admin')) redirectPath = '/admin-dashboard'
      else if (userRole.includes('technician')) redirectPath = '/technician-dashboard'
      else if (userRole.includes('manager')) redirectPath = '/manager-dashboard'
      else redirectPath = '/user-dashboard'
      navigate(redirectPath, { replace: true, state: { showLoginToast: true } })
    } catch (err) {
      setError(err.message || 'Google Auth relay interrupted.')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Establishing Secure Uplink...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex selection:bg-primary/20 relative overflow-hidden font-['Inter',_sans-serif]">
      {/* Visual Side: Background Image with Gradient Overlay */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden">
        <img 
          src="/login-bg.png" 
          alt="SmartUni Campus"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        
        {/* Cinematic Text Overlay */}
        <div className="absolute bottom-20 left-20 space-y-6 max-w-xl animate-slide-up">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl shadow-black/50">🎓</div>
              <div>
                 <h1 className="text-5xl font-black text-white tracking-tighter leading-none italic">UniBridge <span className="text-primary not-italic">Elite</span></h1>
                 <p className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mt-2">Next-Gen Campus Infrastructure</p>
              </div>
           </div>
           <p className="text-gray-400 text-sm font-medium leading-relaxed italic border-l-2 border-primary/30 pl-6">
             Experience the future of academic management. Integrated telemetry, real-time resource mapping, and localized governance in one unified interface.
           </p>
        </div>
      </div>

      {/* Logic Side: Login Form with Glassmorphism */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20 relative z-10">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-12 text-center space-y-4">
           <div className="w-20 h-20 bg-primary mx-auto rounded-[2.5rem] flex items-center justify-center text-3xl shadow-2xl shadow-primary/40 rotate-3">🎓</div>
           <h1 className="text-3xl font-black text-white tracking-tighter italic">UniBridge</h1>
        </div>

        <div className="w-full max-w-[500px] space-y-10">
          <div className="space-y-2">
             <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase">Gateway Access</h2>
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Select protocol and authenticate identity</p>
          </div>

          {/* New Creative Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`relative p-5 rounded-[2rem] border transition-all flex flex-col items-center text-center gap-3 group active:scale-95 ${
                  selectedRole === role.id 
                  ? 'bg-primary border-primary shadow-2xl shadow-primary/30 text-white translate-y-[-4px]' 
                  : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400'
                }`}
              >
                <span className={`text-2xl transition-all duration-500 ${selectedRole === role.id ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'opacity-30 group-hover:opacity-60'}`}>{role.icon}</span>
                <div>
                  <div className={`text-[11px] font-black uppercase tracking-widest ${selectedRole === role.id ? 'text-white' : 'text-gray-400'}`}>{role.title}</div>
                  <div className={`text-[8px] font-bold uppercase tracking-tighter ${selectedRole === role.id ? 'text-white/70' : 'text-gray-600'}`}>{role.description}</div>
                </div>
                {selectedRole === role.id && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] shadow-lg animate-bounce">✨</div>
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border-l-2 border-rose-500 text-rose-500 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest animate-shake italic">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-600 italic shadow-inner"
                  placeholder="Registry Identity (Email)"
                  required
                />
              </div>
              <div className="group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4.5 text-sm font-bold text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-600 italic shadow-inner"
                  placeholder="Security Key (Password)"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-slate-950 py-5 rounded-3xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
              ) : (
                <>
                  Authorize {selectedRole} Session
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          <div className="space-y-8">
            <div className="flex items-center gap-4 text-gray-700">
              <div className="h-[1px] bg-white/10 flex-1"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600">Cross-Auth Uplink</span>
              <div className="h-[1px] bg-white/10 flex-1"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1 min-w-[200px]">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => setError('Google Authentication Failed.')}
                    theme="filled_black"
                    shape="circle"
                    size="large"
                    width={300}
                  />
               </div>
               <button className="flex-1 bg-white/5 border border-white/10 text-white/60 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-3">
                  <span className="text-sm">🔑</span>
                  SSO
               </button>
            </div>
          </div>

          <div className="pt-8 flex justify-center gap-12">
             <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest group cursor-pointer hover:text-primary transition-colors">Forgot Cipher?</div>
             <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest group cursor-pointer hover:text-primary transition-colors">Request Node</div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slow-zoom {
          from { transform: scale(1.05); }
          to { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}} />
    </div>
  )
}
