import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { AuthAPI } from '../services/api'
import './Pages.css'

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('admin')
  const [email, setEmail] = useState('admin@smartcampus.edu')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, googleLogin, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  React.useEffect(() => {
    console.log('Login useEffect - isAuthenticated:', isAuthenticated, 'user:', user)
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

      console.log('Redirecting to:', redirectPath)
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  // Don't render login form if already authenticated and redirecting
  if (isAuthenticated && user) {
    return (
      <div className="login-page-modern">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Redirecting...</p>
        </div>
      </div>
    )
  }

  const roles = [
    {
      id: 'admin',
      title: 'Admin',
      description: 'Full access',
      icon: '👑',
      demoEmail: 'admin@smartcampus.edu',
      demoPassword: 'password123'
    },
    {
      id: 'user',
      title: 'User',
      description: 'Student / Staff',
      icon: '👤',
      demoEmail: 'user@smartcampus.edu',
      demoPassword: 'password123'
    },
    {
      id: 'technician',
      title: 'Technician',
      description: 'Ticket updates',
      icon: '🔧',
      demoEmail: 'tech@smartcampus.edu',
      demoPassword: 'password123'
    },
    {
      id: 'manager',
      title: 'Manager',
      description: 'Approvals',
      icon: '📋',
      demoEmail: 'faculty@smartcampus.edu',
      demoPassword: 'password123'
    }
  ]

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId)
    // Auto-fill demo credentials
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

      console.log('Regular login successful - Role from backend:', result.data.role)

      // Redirect based on role
      const userRole = result.data.role.toLowerCase()
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
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (response) => {
    setError('')
    setLoading(true)
    try {
      console.log('Google login response:', response)

      // The response object contains the credential (ID token)
      const idToken = response.credential || response.id_token

      if (!idToken) {
        throw new Error('No credential received from Google')
      }

      // Get the selected role mapping
      const roleMapping = {
        'admin': 'ADMIN',
        'user': 'USER',
        'technician': 'TECHNICIAN',
        'manager': 'MANAGER'
      }

      const selectedRoleName = roleMapping[selectedRole] || 'USER'

      console.log('Selected role for OAuth:', selectedRoleName)

      // Use AuthContext's googleLogin method to properly update state
      const data = await googleLogin(idToken, selectedRoleName)

      console.log('Backend response:', data)

      // Check if role matches selected role (show warning if user tried to change role)
      if (data.role !== selectedRoleName && localStorage.getItem('authUser')) {
        // User already exists and role didn't change
        const existingUser = JSON.parse(localStorage.getItem('authUser'))
        setError(`⚠️ Your role is permanently set as ${existingUser.role}. You cannot change it yourself. Contact admin for role changes.`)
        setTimeout(() => setError(''), 5000) // Auto-clear after 5 seconds
      }

      // Redirect based on role
      const userRole = data.role.toLowerCase()
      let redirectPath = '/'

      if (userRole.includes('admin')) {
        redirectPath = '/resources'
      } else if (userRole.includes('technician')) {
        redirectPath = '/tickets'
      } else if (userRole.includes('manager')) {
        redirectPath = '/bookings'
      }

      console.log('Navigating to:', redirectPath)
      navigate(redirectPath, { replace: true })
    } catch (err) {
      console.error('Google login error:', err)
      setError(err.response?.data?.message || err.message || 'Google login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLoginError = () => {
    setError('Google login failed. Please try again.')
    setLoading(false)
  }

  const handleSLIITLogin = async () => {
    setError('')
    setLoading(true)
    try {
      // Simulate SLIIT SSO - in production, integrate with SLIIT SAML/OAuth provider
      // For demo, we'll create a mock SLIIT user based on selected role
      const email = `${selectedRole}@my.sliit.lk`
      const name = `SLIIT ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
      const sliitId = `sliit_${selectedRole}_${Date.now()}`

      // Call backend using AuthAPI (reuse Google login endpoint for demo)
      const response = await AuthAPI.googleLogin({
        email,
        name,
        googleId: sliitId // Using same field for demo
      })

      const data = response.data

      if (!data.token) {
        throw new Error(data.message || 'SLIIT login failed')
      }

      // Manually update auth context since we're not using the googleLogin method
      localStorage.setItem('authToken', data.token)
      const userInfo = {
        email: data.email,
        fullName: data.fullName,
        role: data.role.toLowerCase(),
        userId: data.userId,
        isSLIITUser: true
      }
      localStorage.setItem('authUser', JSON.stringify(userInfo))

      // Force a re-render by updating window location to trigger auth check
      window.location.href = '/'
    } catch (err) {
      console.error('SLIIT login error:', err)
      setError(err.response?.data?.message || err.message || 'SLIIT SSO login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-modern">
      <div className="login-container-modern">
        <div className="login-card">
          {/* Header Section */}
          <div className="login-header">
            <div className="app-icon">
              <svg
                className="icon-svg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1 className="login-title-modern">SmartUni Portal</h1>
            <p className="login-subtitle-modern">
              Manage facilities, bookings & campus operations in one place
            </p>
          </div>

          {/* Role Selection Section */}
          <div className="role-section">
            <label className="role-label">SIGN IN AS</label>
            <div className="role-grid">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                >
                  <span className="role-icon">{role.icon}</span>
                  <div className="role-title">{role.title}</div>
                  <div className="role-description">{role.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form-modern">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group-modern">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group-modern">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-submit-modern"
              disabled={loading || !email || !password}
            >
              {loading ? 'Logging in...' : `Sign in as ${roles.find(r => r.id === selectedRole)?.title}`}
            </button>
          </form>

          {/* Authentication Buttons */}
          <div className="auth-buttons">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.error('Google login error')
                setError('Google login failed. Please try again.')
              }}
              useOneTap
              text="signin_with"
              theme="outline"
              size="large"
              width="300"
            />

            <div className="divider">or</div>

            <button
              onClick={handleSLIITLogin}
              disabled={loading}
              className="btn-sso"
            >
              <svg className="sso-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
              <span>SLIIT SSO Login</span>
            </button>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p className="demo-hint">
              <strong>Demo:</strong> Select a role above to auto-fill credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
