import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

export default function BackNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  // Keep only entry pages clean; show back navigation elsewhere.
  const hiddenPaths = ['/', '/home', '/login', '/signup']
  const shouldHide = hiddenPaths.includes(location.pathname)

  if (shouldHide) {
    return null
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/home')
  }

  return (
    <button
      type="button"
      onClick={handleGoBack}
      className="fixed left-4 top-20 z-[120] inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur transition-colors hover:bg-white"
      aria-label="Go back"
    >
      <FaArrowLeft className="text-[11px]" />
      <span className="hidden sm:inline">Back</span>
    </button>
  )
}
