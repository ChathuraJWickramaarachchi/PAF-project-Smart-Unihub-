# Google OAuth Authentication Setup Guide

## Overview
This project uses Google OAuth 2.0 for user authentication. Follow these steps to set up Google authentication properly.

## Prerequisites
- Google Cloud Project with OAuth 2.0 credentials
- Frontend and backend environment variables configured

## Step 1: Create Google OAuth 2.0 Credentials

### A. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown and select "New Project"
3. Enter project name (e.g., "SmartUni Portal")
4. Click "Create"

### B. Enable Google+ API
1. Go to APIs & Services > Library
2. Search for "Google+ API"
3. Click it and press "Enable"

### C. Create OAuth 2.0 Credentials
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Configure **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:5173
   https://yourdomain.com (for production)
   ```
5. Configure **Authorized redirect URIs**:
   ```
   http://localhost:3000/login
   http://localhost:5173/login
   https://yourdomain.com/login (for production)
   ```
6. Click "Create"
7. Copy your **Client ID** and **Client Secret**

## Step 2: Configure Frontend Environment

1. Update `frontend/.env.local`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-from-step-1
   VITE_API_URL=http://localhost:8080/api
   ```

2. Make sure this file is **NOT** committed to git (already in .gitignore)

## Step 3: Configure Backend Environment

1. Update `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-from-step-1
   GOOGLE_CLIENT_SECRET=your-client-secret-from-step-1
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   ```

2. Make sure this file is **NOT** committed to git (already in .gitignore)

## Step 4: Verify Configuration

### Frontend Check
- [ ] `.env.local` exists with `VITE_GOOGLE_CLIENT_ID`
- [ ] `main.jsx` loads the environment variable
- [ ] Google Login button appears on login page

### Backend Check
- [ ] `.env` exists with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] `application.yml` reads from environment variables: `${GOOGLE_CLIENT_ID:...}` and `${GOOGLE_CLIENT_SECRET:...}`
- [ ] `GoogleOAuthService` can verify tokens

## Step 5: Run the Application

### Terminal 1 - Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

## Common Issues & Fixes

### Issue 1: "Invalid Client ID" Error
- **Cause**: Wrong or mismatched Client ID
- **Fix**: Double-check Client ID matches in `frontend/.env.local` and `backend/.env`

### Issue 2: "Invalid origin" Error
- **Cause**: Frontend URL not in Google Console authorized origins
- **Fix**: Add `http://localhost:3000` (or your dev URL) to Google Console > Credentials > Authorized JavaScript origins

### Issue 3: Google Login Button Not Appearing
- **Cause**: Missing `VITE_GOOGLE_CLIENT_ID` environment variable
- **Fix**: Check `frontend/.env.local` exists and has the variable set

### Issue 4: Token Verification Fails
- **Cause**: Backend can't find environment variables
- **Fix**: Ensure `backend/.env` exists and Spring Boot can read it

### Issue 5: CORS Error on Backend
- **Cause**: Backend not configured for OAuth2 client
- **Fix**: Check `application.yml` has OAuth2 client configuration

## Security Notes

### ⚠️ CRITICAL
- **NEVER** commit `.env` files to git
- **NEVER** expose Client Secret in version control
- Use strong passwords for email/Gmail
- Rotate credentials if they're ever exposed
- For production, use secure environment variable management (e.g., AWS Secrets Manager, Azure Key Vault)

### Current Issues to Fix
- Remove exposed credentials from git history (backend/src/main/resources/application.yml contains hardcoded credentials)
- Use `dotenv` or Spring Cloud Config to load environment variables

## Testing the Authentication Flow

1. Open `http://localhost:3000/login`
2. Click "Login with Google"
3. Select your Google account
4. Check browser console for errors
5. Check backend logs for token verification errors

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React Google Login Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Spring Security OAuth2 Documentation](https://spring.io/projects/spring-security-oauth2-core)
