import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

if (!GOOGLE_CLIENT_ID) {
  console.error(
    'ERROR: VITE_GOOGLE_CLIENT_ID environment variable is not set.\n' +
    'Please create frontend/.env.local with:\n' +
    'VITE_GOOGLE_CLIENT_ID=your-client-id-from-google-console\n' +
    'See GOOGLE_AUTH_SETUP.md for detailed instructions.'
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {GOOGLE_CLIENT_ID ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'Arial' }}>
        <h1>⚠️ Configuration Error</h1>
        <p>Google Client ID is not configured. See console for details.</p>
      </div>
    )}
  </React.StrictMode>,
)
