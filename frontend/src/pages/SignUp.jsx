import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { AuthAPI } from '../services/api'
import { FaEye, FaEyeSlash, FaLock, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa'

export default function SignUp() {
  const navigate = useNavigate()
  const { googleLogin, isAuthenticated, user } = useAuth()
  const [selectedRole, setSelectedRole] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = (user.role || '').toLowerCase()
      if (userRole.includes('admin')) navigate('/admin-dashboard', { replace: true })
      else if (userRole.includes('technician')) navigate('/technician-dashboard', { replace: true })
      else if (userRole.includes('manager')) navigate('/manager-dashboard', { replace: true })
      else navigate('/user-dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched({ ...touched, [name]: true })
    validateField(name, value)
  }

  const validateField = (name, value) => {
    let error = ''

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Full name is required'
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters'
        } else if (value.trim().length > 50) {
          error = 'Name must be less than 50 characters'
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          error = 'Name can only contain letters, spaces, hyphens, and apostrophes'
        }
        break

      case 'email':
        if (!value) {
          error = 'Email address is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address'
        } else if (!/\.[a-z]{2,}$/i.test(value)) {
          error = 'Please enter a valid email address with proper domain'
        }
        break

      case 'phoneNumber':
        if (value && !/^[\d\s+()-]+$/.test(value)) {
          error = 'Please enter a valid phone number'
        } else if (value && value.replace(/\D/g, '').length < 7) {
          error = 'Phone number must be at least 7 digits'
        } else if (value && value.replace(/\D/g, '').length > 15) {
          error = 'Phone number must be less than 15 digits'
        }
        break

      case 'password':
        if (!value) {
          error = 'Password is required'
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters'
        } else if (value.length > 128) {
          error = 'Password must be less than 128 characters'
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = 'Password must contain at least one lowercase letter'
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Password must contain at least one uppercase letter'
        } else if (!/(?=.*\d)/.test(value)) {
          error = 'Password must contain at least one number'
        }
        break

      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password'
        } else if (value !== formData.password) {
          error = 'Passwords do not match'
        }
        break

      default:
        break
    }

    setErrors({ ...errors, [name]: error })
    return !error
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
      isValid = false
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters'
      isValid = false
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Name can only contain letters, spaces, hyphens, and apostrophes'
      isValid = false
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email address is required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    // Validate phone (optional but must be valid if provided)
    if (formData.phoneNumber && !/^[\d\s+()-]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number'
      isValid = false
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
      isValid = false
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
      isValid = false
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    // Validate role
    if (!selectedRole) {
      newErrors.role = 'Please select a role'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate all fields
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      setTouched({
        fullName: true,
        email: true,
        phoneNumber: true,
        password: true,
        confirmPassword: true,
        role: true
      })
      return
    }

    setLoading(true)
    try {
      const response = await AuthAPI.signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        role: selectedRole
      })
      
      setSuccess(true)
      setSuccessMessage(response.data?.message || 'OTP sent to your email!')
      
      // Redirect to email verification page
      setTimeout(() => {
        navigate('/verify-email', { state: { email: formData.email } })
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async (response) => {
    setError('')
    setLoading(true)
    try {
      const idToken = response.credential || response.id_token
      if (!idToken) throw new Error('No credential received from Google')
      // Use selected role or default to USER
      const roleToUse = selectedRole || 'USER'
      const data = await googleLogin(idToken, roleToUse)
      setSuccess(true)
      setSuccessMessage('Account created successfully! Redirecting...')
      setTimeout(() => {
        const userRole = (data.role || '').toLowerCase()
        if (userRole.includes('admin')) navigate('/admin-dashboard', { replace: true })
        else if (userRole.includes('technician')) navigate('/technician-dashboard', { replace: true })
        else if (userRole.includes('manager')) navigate('/manager-dashboard', { replace: true })
        else navigate('/user-dashboard', { replace: true })
      }, 1500)
    } catch (err) {
      console.error('Google signup error:', err)
      setError(err.message || 'Google authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google Authentication Failed. Please try again.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      {/* Form Frame */}
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-lg p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600 text-sm">Join SmartUni Portal to get started</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3.5 text-gray-400 text-sm" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-gray-50 border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 outline-none transition-all ${
                  errors.fullName && touched.fullName
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
                }`}
                placeholder="John Doe"
                required
              />
            </div>
            {errors.fullName && touched.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3.5 text-gray-400 text-sm" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-gray-50 border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 outline-none transition-all ${
                  errors.email && touched.email
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
                }`}
                placeholder="you@university.edu"
                required
              />
            </div>
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-3.5 text-gray-400 text-sm" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-gray-50 border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 outline-none transition-all ${
                  errors.phoneNumber && touched.phoneNumber
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
                }`}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            {errors.phoneNumber && touched.phoneNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Role Selection Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              onBlur={() => setTouched({ ...touched, role: true })}
              className={`w-full bg-gray-50 border rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 outline-none transition-all appearance-none cursor-pointer ${
                errors.role && touched.role
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
              }`}
              required
            >
              <option value="">Select your role...</option>
              <option value="USER">User (Auto-approved)</option>
              <option value="MANAGER">Manager (Admin approval required)</option>
              <option value="TECHNICIAN">Technician (Admin approval required)</option>
            </select>
            {errors.role && touched.role && (
              <p className="mt-1 text-xs text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Approval Status Note */}
          {selectedRole && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2.5 rounded-lg text-xs leading-relaxed">
              {selectedRole === 'USER' && '✓ Your account will be automatically approved. You can login immediately after registration.'}
              {selectedRole === 'MANAGER' && '⏳ Manager accounts require admin approval. You\'ll receive an approval notification via email.'}
              {selectedRole === 'TECHNICIAN' && '⏳ Technician accounts require admin approval. You\'ll receive an approval notification via email.'}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3.5 text-gray-400 text-sm" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-gray-50 border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:bg-white focus:ring-2 outline-none transition-all ${
                  errors.password && touched.password
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
                }`}
                placeholder="Minimum 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
            {!errors.password && formData.password && (
              <div className="mt-2 space-y-1">
                <p className={`text-xs ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                  {formData.password.length >= 6 ? '✓' : '○'} At least 6 characters
                </p>
                <p className={`text-xs ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                  {/(?=.*[a-z])/.test(formData.password) ? '✓' : '○'} One lowercase letter
                </p>
                <p className={`text-xs ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                  {/(?=.*[A-Z])/.test(formData.password) ? '✓' : '○'} One uppercase letter
                </p>
                <p className={`text-xs ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                  {/(?=.*\d)/.test(formData.password) ? '✓' : '○'} One number
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3.5 text-gray-400 text-sm" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full bg-gray-50 border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:bg-white focus:ring-2 outline-none transition-all ${
                  errors.confirmPassword && touched.confirmPassword
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary/20 focus:border-primary'
                }`}
                placeholder="Re-enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
            {formData.confirmPassword && !errors.confirmPassword && (
              <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 text-xs font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Google Sign Up */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSignUp}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="100%"
            text="signup_with"
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
