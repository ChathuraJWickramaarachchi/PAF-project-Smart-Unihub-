import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { AuthAPI } from '../services/api'
import { toast } from 'react-toastify'
import { QRCodeSVG } from 'qrcode.react'
import { FaEye, FaEyeSlash, FaLock, FaUser, FaShieldAlt, FaCheckCircle, FaCopy, FaKey } from 'react-icons/fa'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login, googleLogin, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  // 2FA states
  const [twoFAStep, setTwoFAStep] = useState(null) // null | 'setup' | 'verify'
  const [tempToken, setTempToken] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [verifying2FA, setVerifying2FA] = useState(false)
  const otpRefs = useRef([])

  const getRedirectPathForRole = (roleValue) => {
    const role = (roleValue || '').toLowerCase()
    if (role.includes('admin')) return '/admin-dashboard'
    if (role.includes('technician')) return '/technician-dashboard'
    if (role.includes('manager')) return '/manager-dashboard'
    return '/user-dashboard'
  }

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getRedirectPathForRole(user.role)
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  // Handle login response to detect 2FA requirement
  const processLoginResponse = (data) => {
    if (data.requires2FASetup === 'true') {
      setTwoFAStep('setup')
      setTempToken(data.tempToken)
      setQrCodeUrl(data.qrCodeUrl)
      setTotpSecret(data.secret)
      setOtpDigits(['', '', '', '', '', ''])
      setError('')
      return true
    }
    if (data.requires2FA === 'true') {
      setTwoFAStep('verify')
      setTempToken(data.tempToken)
      setOtpDigits(['', '', '', '', '', ''])
      setError('')
      return true
    }
    return false
  }

  // Complete login after 2FA verification
  const completeLogin = (data) => {
    localStorage.setItem('authToken', data.token)
    localStorage.setItem('authUser', JSON.stringify(data))
    // Force page reload to re-initialize auth context
    window.location.href = getRedirectPathForRole(data.role)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Email is required'); return }
    if (!password) { setError('Password is required'); return }

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    setLoading(true)
    try {
      const result = await login(email, password)
      // Check if 2FA is needed
      if (processLoginResponse(result)) {
        // 2FA required — don't navigate yet, clear the auth state
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        return
      }
      const redirectPath = getRedirectPathForRole(result.role)
      navigate(redirectPath, { replace: true })
    } catch (err) {
      // The login function throws on non-2xx, but for 2FA the backend returns 200
      // Check if the error response has 2FA data
      const responseData = err.response?.data
      if (responseData && (responseData.requires2FASetup || responseData.requires2FA)) {
        processLoginResponse(responseData)
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        return
      }
      setError(err.response?.data?.message || err.message || 'Invalid credentials. Please try again.')
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
      const data = await googleLogin(idToken)
      const redirectPath = getRedirectPathForRole(data.role)
      navigate(redirectPath, { replace: true })
    } catch (err) {
      console.error('Google login error:', err)
      setError(err.message || 'Google authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => setError('Google Authentication Failed.')

  // OTP input handling
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newDigits = [...otpDigits]
    for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || ''
    setOtpDigits(newDigits)
    const focusIdx = Math.min(pasted.length, 5)
    otpRefs.current[focusIdx]?.focus()
  }

  const getOtpCode = () => otpDigits.join('')

  // 2FA verification submit
  const handle2FASubmit = async () => {
    const code = getOtpCode()
    if (code.length !== 6) { setError('Please enter a 6-digit code'); return }

    setVerifying2FA(true)
    setError('')
    try {
      const endpoint = twoFAStep === 'setup' ? AuthAPI.verify2FASetup : AuthAPI.verify2FA
      const res = await endpoint(tempToken, code)
      toast.success('Two-factor authentication verified!')
      completeLogin(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.')
      setOtpDigits(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setVerifying2FA(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(totpSecret)
    toast.success('Secret key copied to clipboard')
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

  // ── 2FA SETUP VIEW ──
  if (twoFAStep === 'setup') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-['Inter',_sans-serif]">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-amber-500/25">
              <FaShieldAlt className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Set Up 2FA</h2>
            <p className="text-gray-500 text-sm mt-1">Scan the QR code with your authenticator app</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-inner">
              <QRCodeSVG value={qrCodeUrl} size={200} level="H" includeMargin={true} />
            </div>
          </div>

          {/* Manual key */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Or enter this key manually</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 break-all select-all">
                {totpSecret}
              </code>
              <button onClick={copySecret} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors" title="Copy">
                <FaCopy className="text-gray-500 w-4 h-4" />
              </button>
            </div>
          </div>

          {/* OTP Input */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Enter the 6-digit code from your app</p>
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-white"
                  autoFocus={i === 0}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handle2FASubmit}
            disabled={verifying2FA || getOtpCode().length !== 6}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifying2FA ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Verifying...</span></>
            ) : (
              <><FaCheckCircle /><span>Verify & Activate</span></>
            )}
          </button>

          <button onClick={() => { setTwoFAStep(null); setError('') }} className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
            ← Back to Login
          </button>
        </div>
      </div>
    )
  }

  // ── 2FA VERIFY VIEW ──
  if (twoFAStep === 'verify') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-['Inter',_sans-serif]">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <FaKey className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
            <p className="text-gray-500 text-sm mt-1">Enter the code from your authenticator app</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          {/* OTP Input */}
          <div className="py-4">
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">Code refreshes every 30 seconds</p>
          </div>

          <button
            onClick={handle2FASubmit}
            disabled={verifying2FA || getOtpCode().length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/25 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifying2FA ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Verifying...</span></>
            ) : (
              <><FaShieldAlt /><span>Verify</span></>
            )}
          </button>

          <button onClick={() => { setTwoFAStep(null); setError('') }} className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
            ← Back to Login
          </button>
        </div>
      </div>
    )
  }

  // ── NORMAL LOGIN VIEW ──
  return (
    <div className="min-h-screen bg-slate-950 flex selection:bg-primary/20 relative overflow-hidden font-['Inter',_sans-serif]">
      {/* Visual Side */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden">
        <img src="/login-bg.png" alt="SmartUni Campus" className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl mb-6">🎓</div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">Welcome to SmartUni Portal</h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-md">The centralized platform for managing campus resources, bookings, and maintenance efficiently.</p>
          </div>
          <div className="space-y-4">
            {['Streamlined resource management', 'Real-time booking system', 'Automated maintenance tracking', 'Analytics and reporting'].map((feature, index) => (
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
            <p className="text-sm text-white/60">Your data is protected with industry-standard encryption and security protocols.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl p-7 sm:p-9">
          <div className="lg:hidden mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-2xl mb-4">🎓</div>
            <h1 className="text-2xl font-bold text-gray-900">SmartUni Portal</h1>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Enter your account credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2" role="alert">
                <span>⚠️</span><span>{error}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FaUser className="w-4 h-4" /></div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400" placeholder="your.email@university.edu" required autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FaLock className="w-4 h-4" /></div>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-12 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400" placeholder="Enter your password" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-900">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="font-medium">Remember me</span>
              </label>
              <button type="button" className="text-primary hover:text-primary-dark font-medium transition-colors">Forgot Password?</button>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              {loading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Authenticating...</span></>) : (<span>Continue</span>)}
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
                <GoogleLogin onSuccess={handleGoogleLogin} onError={handleGoogleError} theme="outline" shape="rectangular" size="large" width={300} />
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">Don't have an account?{' '}<Link to="/signup" className="text-primary hover:text-primary-dark font-semibold transition-colors">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
