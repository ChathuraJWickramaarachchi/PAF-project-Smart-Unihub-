# Quick Start: Google OAuth Setup

## Prerequisites
1. Google Cloud Account
2. Node.js (v18+) and npm
3. Java 17+ and Maven

## Quick Setup (5 minutes)

### Step 1: Get Google Credentials
1. Go to https://console.cloud.google.com
2. Create new project: "SmartUni Portal"
3. Enable Google+ API
4. Create OAuth 2.0 Web credentials
5. Add authorized origins: `http://localhost:3000`, `http://localhost:5173`
6. Copy **Client ID** (you'll need this)

### Step 2: Configure Frontend
```bash
cd frontend
# Create .env.local with your Client ID
echo "VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE" > .env.local
echo "VITE_API_URL=http://localhost:8080/api" >> .env.local
```

### Step 3: Configure Backend
```bash
cd backend
# Create .env with your credentials
echo "GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE" > .env
echo "GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE" >> .env
```

### Step 4: Start the Application
```bash
# Terminal 1 - Backend
cd backend
mvn clean install
mvn spring-boot:run

# Terminal 2 - Frontend (wait for backend to start)
cd frontend
npm install
npm run dev
```

### Step 5: Test
1. Open http://localhost:3000/login
2. Click "Login with Google"
3. Sign in with your Google account
4. Should redirect to dashboard

## Troubleshooting

### "Google Authentication Failed" Error
1. Check browser console (F12 > Console)
2. Check backend logs for token verification errors
3. Verify Client ID matches in frontend and backend

### Google Login Button Not Showing
1. Check `frontend/.env.local` exists
2. Run `npm run dev` again
3. Clear browser cache

### Backend Token Verification Error
1. Check `.env` file has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Run `mvn clean install` to rebuild with new dependencies
3. Check backend logs: `Application startup failed`

## Common Issues

| Issue | Fix |
|-------|-----|
| "Invalid origin" | Add frontend URL to Google Console Authorized JavaScript origins |
| "Invalid Client ID" | Verify IDs match between Google Console, `.env.local`, and `.env` |
| CORS errors | Backend is running on http://localhost:8080 |
| Port already in use | Change port in `frontend/vite.config.js` (port) or backend `application.yml` (server.port) |

## File Checklist
- [ ] `frontend/.env.local` exists with `VITE_GOOGLE_CLIENT_ID`
- [ ] `backend/.env` exists with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Both files are in `.gitignore` (shouldn't be committed)
- [ ] Backend has spring-dotenv dependency (check pom.xml)
- [ ] No errors in backend startup logs

## Next Steps
For detailed setup, see [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)
