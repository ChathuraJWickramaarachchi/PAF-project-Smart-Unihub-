import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { FaEye, FaEyeSlash, FaLock, FaUser, FaGoogle, FaShieldAlt, FaCheckCircle } from 'react-icons/fa'

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    { id: 'admin', title: 'Admin', description: 'Full system access', icon: '👑', demoEmail: 'admin@smartuni.edu', demoPassword: 'password123' },
    { id: 'user', title: 'User', description: 'Student access', icon: '👤', demoEmail: 'user@smartuni.edu', demoPassword: 'password123' },
    { id: 'technician', title: 'Technician', description: 'Maintenance team', icon: '🔧', demoEmail: 'tech@smartuni.edu', demoPassword: 'password123' },
    { id: 'manager', title: 'Manager', description: 'Department head', icon: '📋', demoEmail: 'faculty@smartuni.edu', demoPassword: 'password123' }
  ]

  const handleRoleSelect = useCallback((roleId) => {
    setSelectedRole(roleId)
    const role = roles.find(r => r.id === roleId)
    if (role) {
      setEmail(role.demoEmail)
      setPassword(role.demoPassword)
      setError('')
    }
  }, [roles])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    
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
      setError(err.message || 'Invalid credentials. Please try again.')
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
      setError(err.message || 'Google authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google Authentication Failed.')
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl mb-6">
              🎓
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
              Welcome to SmartUni Portal
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-md">
              The centralized platform for managing campus resources, bookings, and maintenance efficiently.
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              'Streamlined resource management',
              'Real-time booking system',
              'Automated maintenance tracking',
              'Analytics and reporting'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <FaCheckCircle className="text-white/90 flex-shrink-0" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-white/80" />
              <span className="text-white/80 font-medium">Enterprise-Grade Security</span>
            </div>
            <p className="text-sm text-white/60">
              Your data is protected with industry-standard encryption and security protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-2xl mb-4">
              🎓
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SmartUni Portal</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Select your role and enter your credentials</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center text-center gap-2 ${
                  selectedRole === role.id 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <span className="text-2xl">{role.icon}</span>
                <div>
                  <div className={`text-sm font-semibold ${selectedRole === role.id ? 'text-primary' : 'text-gray-900'}`}>
                    {role.title}
                  </div>
                  <div className="text-xs text-gray-500">{role.description}</div>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2" role="alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaUser className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="your.email@university.edu"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-12 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-900">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="font-medium">Remember me</span>
              </label>
              <button type="button" className="text-primary hover:text-primary-dark font-medium transition-colors">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-4 text-gray-400 mb-6">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs font-medium uppercase tracking-wide">Or continue with</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
          
            <div className="flex flex-col sm:flex-row gap-3">
               <div className="flex-1">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={handleGoogleError}
                    theme="outline"
                    shape="rectangular"
                    size="large"
                    text="signin_with"
                    width="100%"
                  />
               </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
             <p className="text-gray-600 text-sm">
               Don't have an account?{' '}
               <Link to="/signup" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                 Sign Up
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
