# Google OAuth - Verification & Testing Checklist

## Pre-Flight Checks

### Environment Variables ✓
- [ ] `frontend/.env.local` exists
- [ ] `frontend/.env.local` contains `VITE_GOOGLE_CLIENT_ID=...`
- [ ] `backend/.env` exists  
- [ ] `backend/.env` contains `GOOGLE_CLIENT_ID=...`
- [ ] `backend/.env` contains `GOOGLE_CLIENT_SECRET=...`
- [ ] Both `.env` files are in `.gitignore`

### Google Cloud Console ✓
- [ ] Google Cloud project created
- [ ] Google+ API is enabled
- [ ] OAuth 2.0 Web credentials created
- [ ] Authorized JavaScript origins include:
  - [ ] `http://localhost:3000`
  - [ ] `http://localhost:5173`
- [ ] Authorized redirect URIs include:
  - [ ] `http://localhost:3000/login`
  - [ ] `http://localhost:5173/login`

### Dependencies ✓
- [ ] Frontend: `npm list @react-oauth/google`
- [ ] Backend: pom.xml includes `spring-dotenv` dependency
- [ ] Backend: `mvn clean install` completed successfully

## Backend Verification

### Check 1: Application Startup
```bash
cd backend
mvn spring-boot:run
```
Expected logs:
- [ ] No errors containing "google.client.id"
- [ ] No errors containing "GOOGLE_CLIENT_SECRET"
- [ ] Application started on port 8080
- [ ] No JWT or OAuth configuration errors

### Check 2: Health Endpoint
```bash
curl http://localhost:8080/api/auth/health
```
Expected response:
```json
{"message": "OK"}
```

### Check 3: Google Service Configuration
In backend logs, you should see:
- [ ] Spring Security loaded
- [ ] OAuth2 client configuration loaded
- [ ] No "googleClientId" is null/empty warnings

## Frontend Verification

### Check 1: Application Startup
```bash
cd frontend
npm install
npm run dev
```
Expected output:
- [ ] No error message about missing `VITE_GOOGLE_CLIENT_ID`
- [ ] Application running on http://localhost:3000 or http://localhost:5173
- [ ] No console errors (F12 > Console)

### Check 2: Login Page
1. Open http://localhost:3000/login (or http://localhost:5173/login)
2. Expected:
   - [ ] Google Login button is visible
   - [ ] Button text contains "Login with Google" or similar
   - [ ] No error messages about configuration

### Check 3: Browser Console
Open DevTools (F12) > Console:
- [ ] No errors containing "clientId"
- [ ] No errors containing "VITE_GOOGLE_CLIENT_ID"
- [ ] No CORS errors

### Check 4: Network Inspection
1. Open DevTools (F12) > Network tab
2. Click Google Login button
3. Expected network requests:
   - [ ] Request to `https://accounts.google.com/gsi/button` (succeeds)
   - [ ] Request to `https://accounts.google.com/oauth2/v2/token` (with POST)

## End-to-End Testing

### Test 1: Google Login Flow
1. Navigate to http://localhost:3000/login
2. Click "Login with Google"
3. Select or sign in with your Google account
4. Expected result:
   - [ ] Success: Redirected to dashboard
   - [ ] User email should appear in profile
   - [ ] Browser console shows no errors
   - [ ] Backend logs show successful token verification

### Test 2: Check Backend Logs
During Test 1, backend logs should show:
```
Received Google login request with token length: ...
Verified Google token successfully
User created/found: [email]
Generating JWT token
```

### Test 3: Session Persistence
After successful login:
1. [ ] LocalStorage contains `authToken`
2. [ ] LocalStorage contains `authUser` with email and role
3. [ ] Refresh page (F5) - should still be logged in
4. [ ] Close and reopen browser - token should persist

## Debug Steps if Tests Fail

### Issue: "Google Authentication Failed"
1. Open browser console (F12)
2. Check for specific error message
3. Check backend logs for rejection reason
4. Run: `curl -X POST http://localhost:8080/api/auth/google-login -H "Content-Type: application/json" -d '{"idToken":"test"}'`
   - Should return a detailed error

### Issue: Google Login Button Not Showing
1. Check console for `VITE_GOOGLE_CLIENT_ID not set`
2. Verify `.env.local` exists with correct variable name
3. Kill dev server, delete `node_modules/.vite`, restart

### Issue: CORS Error
1. Check backend logs for CORS configuration
2. Verify `application.yml` has proper CORS setup
3. Request should go to `http://localhost:8080/api/auth/google-login`

### Issue: Token Verification Fails
1. Check backend logs: "Google token verification failed"
2. Verify Client ID matches in:
   - Google Console
   - `frontend/.env.local`
   - `backend/.env`
   - `application.yml` defaults
3. Check Google API is enabled in Cloud Console

## Quick Fixes

| Error | Solution |
|-------|----------|
| `Cannot read properties of undefined (reading 'clientId')` | Add `VITE_GOOGLE_CLIENT_ID` to `frontend/.env.local` |
| `{"message":"Invalid Google ID token"}` | Token expired - try login again |
| `400 Bad Request - no token provided` | Check handleGoogleLogin function in Login.jsx |
| `Failed to verify Google token - invalid token format` | Client ID mismatch - verify all 3 locations |
| `CORS error on POST to /api/auth/google-login` | Backend CORS not configured for frontend URL |

## Files to Check

- [x] `frontend/.env.local` - has Client ID
- [x] `backend/.env` - has Client ID and Secret
- [x] `backend/pom.xml` - has spring-dotenv dependency
- [x] `frontend/src/main.jsx` - validates Client ID on load
- [x] `backend/src/main/java/com/smartcampus/service/GoogleOAuthService.java` - verifies tokens
- [x] `backend/src/main/java/com/smartcampus/controller/AuthController.java` - /google-login endpoint
- [x] `frontend/src/pages/Login.jsx` - handleGoogleLogin function

## Support Resources

- Google OAuth Troubleshooting: https://developers.google.com/identity/protocols/oauth2/troubleshooting
- React Google Login: https://www.npmjs.com/package/@react-oauth/google
- Spring OAuth2: https://spring.io/projects/spring-security-oauth2-core
- Detailed Setup: See `GOOGLE_AUTH_SETUP.md`
