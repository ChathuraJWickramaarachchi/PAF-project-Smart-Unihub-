import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthAPI } from '../services/api'
import { FaEye, FaEyeSlash, FaLock, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa'

export default function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await AuthAPI.signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber
      })
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center selection:bg-primary/20 relative overflow-hidden font-['Inter',_sans-serif] p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/2 rounded-full blur-3xl"></div>
      </div>
      
      {/* White Background Container */}
      <div className="relative z-10 w-full max-w-[550px]">
        {/* Glowing Effect Behind Card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-3xl blur-xl opacity-50"></div>
        
        {/* Main White Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top Gradient Bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60"></div>
          
          {/* Form Container */}
          <div className="p-8 sm:p-10 lg:p-12">
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-3 text-center">
                 <div className="flex items-center justify-center gap-3 mb-4">
                   <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-primary/30">🎓</div>
                 </div>
                 <h1 className="text-2xl font-black text-gray-900 tracking-tight">SmartUni Portal</h1>
                 <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Create Your Account</p>
                 <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-4">Join SmartUni</h2>
                 <p className="text-sm font-medium text-gray-600">Fill in your details to create an account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-xl text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-xl text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      <span>Account created successfully! Redirecting to login...</span>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Full Name */}
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaUser className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-11 pr-4 py-4 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                      placeholder="Full Name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaEnvelope className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-11 pr-4 py-4 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                      placeholder="Email Address"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaPhone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-11 pr-4 py-4 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                      placeholder="Phone Number (Optional)"
                    />
                  </div>
                  
                  {/* Password */}
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaLock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-11 pr-12 py-4 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="group relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaLock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-11 pr-12 py-4 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                      placeholder="Confirm Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 text-center">
                 <p className="text-gray-600 text-sm">
                   Already have an account?{' '}
                   <Link to="/login" className="text-primary hover:text-primary/80 font-bold transition-colors hover:underline">
                     Sign In
                   </Link>
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
