import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const WelcomeScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get username from user object or localStorage
  const getUsername = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    
    // Fallback to localStorage
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      const parsedUser = JSON.parse(authUser);
      return parsedUser.name || parsedUser.email?.split('@')[0] || 'User';
    }
    
    return 'User';
  };

  const username = getUsername();

  // Fade-in animation
  useEffect(() => {
    setVisible(true);
  }, []);

  // Progress bar and redirect
  useEffect(() => {
    const duration = 2500; // 2.5 seconds
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        // Redirect based on user role
        const userRole = user?.role?.toLowerCase() || '';
        let redirectPath = '/user-dashboard';

        if (userRole.includes('admin')) {
          redirectPath = '/admin-dashboard';
        } else if (userRole.includes('technician')) {
          redirectPath = '/technician-dashboard';
        } else if (userRole.includes('manager')) {
          redirectPath = '/manager-dashboard';
        }

        navigate(redirectPath, { replace: true });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div
        className={`max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transition-all duration-700 transform ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Welcome Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>

        {/* Welcome Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Hi {username},
        </h1>
        <h2 className="text-xl font-semibold text-blue-600 mb-4">
          Welcome to SmartUni Portal
        </h2>
        
        {/* Subtitle */}
        <p className="text-gray-500 mb-8 text-sm">
          Completing Sign In...
        </p>

        {/* Loading Spinner */}
        <div className="mb-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-100 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Loading Text */}
        <p className="text-xs text-gray-400 mt-4">
          Please wait while we prepare your dashboard...
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
