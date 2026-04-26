import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: Reset Password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const otpRefs = useRef([])

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)

    const nextIndex = Math.min(pastedData.length, 5)
    otpRefs.current[nextIndex]?.focus()
  }

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      const response = await AuthAPI.forgotPasswordRequest(email)
      toast.success(response.data.message)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')

    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await AuthAPI.forgotPasswordVerifyOtp(email, otpValue)
      setResetToken(response.data.resetToken)
      toast.success(response.data.message)
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
      toast.error(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await AuthAPI.resetPassword(email, resetToken, newPassword)
      toast.success(response.data.message)
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed')
      toast.error(err.response?.data?.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setResendLoading(true)
    
    try {
      const response = await AuthAPI.resendOtp(email, 'FORGOT_PASSWORD')
      toast.success(response.data.message)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="forgot-password-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        
        .forgot-password-page {
          --fp-navy: #07101f;
          --fp-navy-2: #0d1b2e;
          --fp-navy-3: #112035;
          --fp-blue: #1a6cf0;
          --fp-blue-light: #3d87ff;
          --fp-blue-glow: rgba(26,108,240,0.15);
          --fp-accent: #00e5ff;
          --fp-white: #ffffff;
          --fp-muted: rgba(255,255,255,0.45);
          --fp-muted2: rgba(255,255,255,0.65);
          --fp-border: rgba(255,255,255,0.07);
          --fp-border2: rgba(255,255,255,0.12);
          --fp-card: rgba(255,255,255,0.04);
          --fp-card-hover: rgba(255,255,255,0.07);
          --fp-red: #ff4d6a;
          --fp-green: #00d084;
          --fp-display: 'Syne', sans-serif;
          --fp-sans: 'DM Sans', sans-serif;
          
          min-height: 100vh;
          background: var(--fp-navy);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: var(--fp-sans);
        }
        
        /* Animated Background Orbs */
        .forgot-password-page::before,
        .forgot-password-page::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 8s ease-in-out infinite;
        }
        
        .forgot-password-page::before {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, var(--fp-blue) 0%, transparent 70%);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }
        
        .forgot-password-page::after {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, var(--fp-accent) 0%, transparent 70%);
          bottom: -150px;
          right: -150px;
          animation-delay: 2s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        
        /* Grid Pattern Overlay */
        .fp-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
          pointer-events: none;
        }
        .fp-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 480px;
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .forgot-password-page .fp-card {
          background: rgba(13, 27, 46, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid var(--fp-border);
          border-radius: 16px;
          padding: 32px 28px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        
        .forgot-password-page .fp-header {
          text-align: center;
          margin-bottom: 28px;
        }
        
        .forgot-password-page .fp-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--fp-blue), var(--fp-blue-light));
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 8px 24px rgba(26, 108, 240, 0.3);
        }
        
        .forgot-password-page .fp-icon svg {
          width: 24px;
          height: 24px;
          color: var(--fp-white);
        }
        
        .forgot-password-page .fp-title {
          font-family: var(--fp-display);
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--fp-white);
          margin-bottom: 6px;
          line-height: 1.2;
        }
        
        .forgot-password-page .fp-subtitle {
          font-size: 13px;
          font-weight: 400;
          color: var(--fp-muted2);
          line-height: 1.5;
        }
        
        .forgot-password-page .fp-error {
          margin-bottom: 20px;
          padding: 12px 14px;
          background: rgba(255, 77, 106, 0.1);
          border: 1px solid rgba(255, 77, 106, 0.3);
          border-radius: 10px;
          animation: shake 0.5s;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        
        .forgot-password-page .fp-error p {
          color: var(--fp-red);
          font-size: 12px;
          font-weight: 500;
        }
        
        .forgot-password-page .fp-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        
        .forgot-password-page .fp-field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--fp-muted2);
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }
        
        .forgot-password-page .fp-input {
          width: 100%;
          padding: 12px 16px;
          background: var(--fp-card);
          border: 1px solid var(--fp-border);
          border-radius: 10px;
          color: var(--fp-white);
          font-size: 14px;
          font-family: var(--fp-sans);
          transition: all 0.2s;
          outline: none;
        }
        
        .forgot-password-page .fp-input::placeholder {
          color: var(--fp-muted);
        }
        
        .forgot-password-page .fp-input:focus {
          border-color: var(--fp-blue);
          background: var(--fp-card-hover);
          box-shadow: 0 0 0 3px var(--fp-blue-glow);
        }
        
        .forgot-password-page .fp-input-wrapper {
          position: relative;
        }
        
        .forgot-password-page .fp-input-wrapper .fp-input {
          padding-right: 48px;
        }
        
        .forgot-password-page .fp-toggle-password {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--fp-muted);
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        
        .forgot-password-page .fp-toggle-password:hover {
          color: var(--fp-white);
        }
        
        .forgot-password-page .fp-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, var(--fp-blue), var(--fp-blue-light));
          color: var(--fp-white);
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: var(--fp-sans);
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(26, 108, 240, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .forgot-password-page .fp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(26, 108, 240, 0.5);
        }
        
        .forgot-password-page .fp-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .forgot-password-page .fp-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .forgot-password-page .fp-btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .forgot-password-page .fp-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: var(--fp-white);
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .forgot-password-page .otp-container {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        
        .forgot-password-page .otp-input {
          width: 48px;
          height: 56px;
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          font-family: var(--fp-display);
          background: var(--fp-card);
          border: 1px solid var(--fp-border);
          border-radius: 10px;
          color: var(--fp-white);
          transition: all 0.2s;
          outline: none;
        }
        
        .forgot-password-page .otp-input:focus {
          border-color: var(--fp-blue);
          background: var(--fp-card-hover);
          box-shadow: 0 0 0 3px var(--fp-blue-glow);
          transform: scale(1.05);
        }
        
        .forgot-password-page .fp-resend {
          text-align: center;
          margin-top: 16px;
        }
        
        .forgot-password-page .fp-resend p {
          font-size: 12px;
          color: var(--fp-muted);
          margin-bottom: 6px;
        }
        
        .forgot-password-page .fp-resend-btn {
          background: none;
          border: none;
          color: var(--fp-blue-light);
          font-size: 13px;
          font-weight: 600;
          font-family: var(--fp-sans);
          cursor: pointer;
          transition: all 0.2s;
          padding: 6px 14px;
          border-radius: 6px;
        }
        
        .forgot-password-page .fp-resend-btn:hover:not(:disabled) {
          color: var(--fp-blue);
          background: var(--fp-blue-glow);
        }
        
        .forgot-password-page .fp-resend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .forgot-password-page .fp-back {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--fp-border);
          text-align: center;
        }
        
        .forgot-password-page .fp-back-link {
          color: var(--fp-muted);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        
        .forgot-password-page .fp-back-link:hover {
          color: var(--fp-white);
        }
        
        .forgot-password-page .fp-back-link svg {
          width: 14px;
          height: 14px;
          transition: transform 0.2s;
        }
        
        .forgot-password-page .fp-back-link:hover svg {
          transform: translateX(-3px);
        }
        
        .forgot-password-page .fp-info {
          margin-top: 20px;
          padding: 16px;
          background: var(--fp-blue-glow);
          border: 1px solid rgba(26, 108, 240, 0.2);
          border-radius: 10px;
        }
        
        .forgot-password-page .fp-info-content {
          display: flex;
          gap: 12px;
        }
        
        .forgot-password-page .fp-info-icon {
          width: 16px;
          height: 16px;
          color: var(--fp-blue-light);
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .forgot-password-page .fp-info-text {
          font-size: 12px;
          color: var(--fp-muted2);
          line-height: 1.5;
        }
        
        .forgot-password-page .fp-info-text strong {
          color: var(--fp-white);
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
        }
        
        .forgot-password-page .fp-info-text ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .forgot-password-page .fp-info-text li {
          font-size: 11px;
          margin-bottom: 3px;
          color: var(--fp-muted);
        }
        
        .forgot-password-page .fp-info-text li:before {
          content: '• ';
          color: var(--fp-blue-light);
          font-weight: bold;
        }
      `}</style>

      {/* Background Grid */}
      <div className="fp-bg-grid"></div>

      <div className="fp-container">
        {/* Card */}
        <div className="fp-card">
          {/* Header */}
          <div className="fp-header">
            <div className="fp-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="fp-title">
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Verify OTP'}
              {step === 3 && 'New Password'}
            </h1>
            <p className="fp-subtitle">
              {step === 1 && 'Enter your email to receive a verification code'}
              {step === 2 && `We've sent a 6-digit OTP to ${email}`}
              {step === 3 && 'Create a new strong password'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="fp-error">
              <p>{error}</p>
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="fp-form">
              <div className="fp-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="fp-input"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="fp-btn"
              >
                {loading ? (
                  <span className="fp-btn-loading">
                    <span className="fp-spinner"></span>
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="fp-form">
              <div className="otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="otp-input"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="fp-btn"
              >
                {loading ? (
                  <span className="fp-btn-loading">
                    <span className="fp-spinner"></span>
                    Verifying...
                  </span>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className="fp-resend">
                <p>Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="fp-resend-btn"
                >
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="fp-form">
              <div className="fp-field">
                <label>New Password</label>
                <div className="fp-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="fp-input"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="fp-toggle-password"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="fp-field">
                <label>Confirm Password</label>
                <div className="fp-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="fp-input"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="fp-toggle-password"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="fp-btn"
              >
                {loading ? (
                  <span className="fp-btn-loading">
                    <span className="fp-spinner"></span>
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="fp-back">
            <Link to="/login" className="fp-back-link">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="fp-info">
          <div className="fp-info-content">
            <svg className="fp-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="fp-info-text">
              <strong>Security Tips:</strong>
              <ul>
                <li>Use a strong password with at least 6 characters</li>
                <li>OTP is valid for 10 minutes</li>
                <li>Check spam folder if you don't see the email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
