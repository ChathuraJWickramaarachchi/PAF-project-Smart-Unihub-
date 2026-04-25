import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthAPI } from '../services/api'
import { FaEye, FaEyeSlash, FaLock, FaUser, FaEnvelope, FaPhone, FaCheckCircle } from 'react-icons/fa'

export default function SignUp() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('')
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
    
    if (!selectedRole) {
      setError('Please select a role (Lecture or Student)')
      return
    }
    
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
        phoneNumber: formData.phoneNumber,
        role: selectedRole === 'lecture' ? 'MANAGER' : 'USER'
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
              Join SmartUni Portal
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-md">
              Create your account and start managing campus resources efficiently.
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              'Easy account setup',
              'Role-based access control',
              'Instant platform access',
              'Comprehensive support'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <FaCheckCircle className="text-white/90 flex-shrink-0" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-white/60">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Select your role and fill in your details</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('lecture')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 hover:-translate-y-0.5 ${
                selectedRole === 'lecture'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="text-5xl">👨‍🏫</div>
              <div className="text-center">
                <h3 className={`text-base font-semibold ${selectedRole === 'lecture' ? 'text-primary' : 'text-gray-900'}`}>
                  Lecture
                </h3>
                <p className="text-xs text-gray-500 mt-1">Teaching Staff</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 hover:-translate-y-0.5 ${
                selectedRole === 'student'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="text-5xl">👨‍🎓</div>
              <div className="text-center">
                <h3 className={`text-base font-semibold ${selectedRole === 'student' ? 'text-primary' : 'text-gray-900'}`}>
                  Student
                </h3>
                <p className="text-xs text-gray-500 mt-1">Enrolled Learner</p>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm flex items-center gap-2">
                <span>✅</span>
                <span>Account created successfully! Redirecting...</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaUser className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaEnvelope className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="your.email@university.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaPhone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="+1 234 567 8900"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-12 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="Minimum 6 characters"
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
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-12 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                  placeholder="Re-enter your password"
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
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
             <p className="text-gray-600 text-sm">
               Already have an account?{' '}
               <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                 Sign In
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
