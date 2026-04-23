import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { FaEye, FaEyeSlash, FaLock, FaUser, FaGoogle } from 'react-icons/fa'

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [rememberMe, setRememberMe] = useState(false)
  const { login, googleLogin, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

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
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const roles = [
    { id: 'admin', title: 'Admin', description: 'Root Access', icon: '👑', demoEmail: 'admin@smartuni.edu', demoPassword: 'password123' },
    { id: 'user', title: 'User', description: 'End Node', icon: '👤', demoEmail: 'user@smartuni.edu', demoPassword: 'password123' },
    { id: 'technician', title: 'Technician', description: 'Field Ops', icon: '🔧', demoEmail: 'tech@smartuni.edu', demoPassword: 'password123' },
    { id: 'manager', title: 'Manager', description: 'Governance', icon: '📋', demoEmail: 'faculty@smartuni.edu', demoPassword: 'password123' }
  ]

  const handleRoleSelect = useCallback((roleId) => {
    setSelectedRole(roleId)
    const role = roles.find(r => r.id === roleId)
    if (role) {
      setEmail(role.demoEmail)
      setPassword(role.demoPassword)
      setError('') // Clear error on role change
    }
  }, [roles])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate inputs
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    
    // Handle remember me
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }
    
    setLoading(true)
    try {
      const result = await login(email, password)
      const userRole = result.data.role.toLowerCase()
      let redirectPath = '/'
      if (userRole.includes('admin')) redirectPath = '/admin-dashboard'
      else if (userRole.includes('technician')) redirectPath = '/technician-dashboard'
      else if (userRole.includes('manager')) redirectPath = '/manager-dashboard'
      else redirectPath = '/user-dashboard'
      navigate(redirectPath, { replace: true })
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
      navigate(redirectPath, { replace: true })
    } catch (err) {
      console.error('Google login error:', err)
      setError(err.message || 'Google Auth relay interrupted.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google Authentication Failed.')
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-primary/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-[11px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Establishing Secure Connection</div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Redirecting to dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex selection:bg-primary/20 relative overflow-hidden font-['Inter',_sans-serif]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/2 rounded-full blur-3xl"></div>
      </div>
      
      {/* Visual Side: Background Image with Gradient Overlay */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden">
        <img 
          src="C:\Users\Tumal\.gemini\antigravity\brain\e1ee2fc7-e71e-448c-95d4-1b3aa31a0677\modern_university_campus_abstract_login_bg_1776613879162.png" 
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
                 <h1 className="text-5xl font-black text-white tracking-tighter leading-none italic">SmartUni <span className="text-primary not-italic">Portal</span></h1>
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
           <h1 className="text-3xl font-black text-white tracking-tighter italic">SmartUni Portal</h1>
        </div>

        <div className="w-full max-w-[500px] space-y-8">
          <div className="space-y-3">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-primary/30">🎓</div>
               <div>
                 <h1 className="text-xl font-black text-white tracking-tight">SmartUni Portal</h1>
                 <p className="text-[8px] font-bold text-primary uppercase tracking-[0.3em]">Smart Campus Portal</p>
               </div>
             </div>
             <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
             <p className="text-[11px] font-medium text-gray-400">Select your role and sign in to continue</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center gap-2 group active:scale-95 ${
                  selectedRole === role.id 
                  ? 'bg-gradient-to-br from-primary to-primary/70 border-primary shadow-2xl shadow-primary/40 text-white scale-[1.02]' 
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8 text-gray-400 hover:text-white'
                }`}
              >
                <span className={`text-2xl transition-all duration-300 ${selectedRole === role.id ? 'scale-125 drop-shadow-lg' : 'group-hover:scale-110'}`}>{role.icon}</span>
                <div>
                  <div className={`text-[10px] font-black uppercase tracking-wider ${selectedRole === role.id ? 'text-white' : 'text-gray-300'}`}>{role.title}</div>
                  <div className={`text-[8px] font-semibold uppercase tracking-tight ${selectedRole === role.id ? 'text-white/80' : 'text-gray-500'}`}>{role.description}</div>
                </div>
                {selectedRole === role.id && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div className="bg-rose-500/10 border-l-2 border-rose-500 text-rose-500 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest animate-shake italic flex items-center gap-2" role="alert" aria-live="assertive">
                <span className="text-sm">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div className="group relative">
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-primary' : 'text-gray-500'}`}>
                  <FaUser className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4.5 text-sm font-bold text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-600 italic shadow-inner"
                  placeholder="Registry Identity (Email)"
                  required
                  autoComplete="email"
                  aria-label="Email Address"
                />
              </div>
              
              <div className="group relative">
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-primary' : 'text-gray-500'}`}>
                  <FaLock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-14 py-4.5 text-sm font-bold text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-600 italic shadow-inner"
                  placeholder="Security Key (Password)"
                  required
                  autoComplete="current-password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white transition-colors group">
                <input 
                  type="checkbox" 
                  className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="font-bold uppercase tracking-wider group-hover:underline">Remember me</span>
              </label>
              <button type="button" className="text-primary hover:text-primary/80 font-black uppercase tracking-wider transition-colors">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Sign in to your account"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </>
              )}
            </button>
          </form>

          <div className="space-y-8">
            <div className="flex items-center gap-4 text-gray-700">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">Or continue with</span>
              <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
            </div>
          
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1 min-w-[200px]">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={handleGoogleError}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    text="signin_with"
                  />
               </div>
               <button className="flex-1 bg-white/5 border border-white/10 text-white/60 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 group">
                  <FaGoogle className="text-sm group-hover:text-primary transition-colors" />
                  <span>Enterprise SSO</span>
               </button>
            </div>
          </div>
          
          <div className="pt-8 text-center">
             <p className="text-gray-500 text-xs">
               Don't have an account?{' '}
               <Link to="/signup" className="text-primary hover:text-primary/80 font-black uppercase tracking-wider transition-colors hover:underline">
                 Sign Up
               </Link>
             </p>
          </div>
          
          <div className="pt-4 flex justify-center gap-8">
             <button className="text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-primary transition-colors">Help</button>
             <span className="text-gray-700">•</span>
             <button className="text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-primary transition-colors">Privacy</button>
             <span className="text-gray-700">•</span>
             <button className="text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-primary transition-colors">Terms</button>
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
