import { createContext, useState, useContext, useCallback } from 'react'
import { AuthAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('authUser')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [token, setToken] = useState(localStorage.getItem('authToken'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await AuthAPI.login(email, password)
      const data = response.data
      
      // If 2FA is required, return data without storing token/user
      if (data.requires2FASetup === 'true' || data.requires2FA === 'true') {
        return data
      }
      
      // If email verification is required, throw error to be handled by login page
      if (data.requiresVerification === 'true') {
        const error = new Error('Email not verified')
        error.response = { data }
        throw error
      }
      
      const { token } = data
      localStorage.setItem('authToken', token)
      
      // Save the entire response.data (which contains user info like role, email, etc.)
      localStorage.setItem('authUser', JSON.stringify(data))
      setToken(token)
      setUser(data)
      
      return data
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const googleLogin = useCallback(async (idToken, requestedRole = 'USER') => {
    setLoading(true)
    setError(null)
    try {
      const response = await AuthAPI.googleLogin(idToken, requestedRole)
      const { token } = response.data
      localStorage.setItem('authToken', token)
      
      // Save user info from Google login response
      localStorage.setItem('authUser', JSON.stringify(response.data))
      setToken(token)
      setUser(response.data)
      
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  const value = {
    user,
    token,
    loading,
    error,
    login,
    googleLogin,
    logout,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
