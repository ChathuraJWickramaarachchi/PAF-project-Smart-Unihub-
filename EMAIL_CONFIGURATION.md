# Email Configuration for OTP Verification

## Overview
The SmartUni Portal now includes OTP-based email verification for:
1. **User Signup** - Users must verify their email before logging in
2. **Forgot Password** - Users receive OTP to reset their password

## Email Configuration

### For Development/Testing
The system is configured to use Gmail SMTP. You need to:

1. **Use App Password (Not Regular Password)**
   - Go to your Google Account: https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character app password

2. **Set Environment Variables**
   
   Create or update the `.env` file in the `backend` directory:
   ```bash
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   ```

3. **Alternative: Update application.yml directly**
   
   Edit `backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     mail:
       username: your-email@gmail.com
       password: your-app-password
   ```

### For Production
Consider using:
- **SendGrid** - Free tier available
- **AWS SES** - Cost-effective for high volume
- **Mailgun** - Developer-friendly

Update the mail configuration in `application.yml` accordingly.

## Features Implemented

### Backend
✅ OTP Service with 10-minute expiration
✅ Email templates (HTML) for signup and password reset
✅ Secure OTP generation (6-digit)
✅ Password reset token with 30-minute expiry
✅ Email verification status tracking

### Frontend
✅ Email Verification page with OTP input
✅ Forgot Password flow (3 steps: Email → OTP → Reset)
✅ Auto-redirect after signup to verification page
✅ Login page checks for email verification
✅ Resend OTP functionality
✅ Beautiful UI with animations

## API Endpoints

### Signup & Verification
- `POST /api/auth/signup` - Register user (sends OTP)
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP

### Password Reset
- `POST /api/auth/forgot-password/request` - Request password reset (sends OTP)
- `POST /api/auth/forgot-password/verify-otp` - Verify OTP for password reset
- `POST /api/auth/forgot-password/reset` - Reset password with token

## User Flow

### Signup Flow
1. User fills signup form
2. System creates account (inactive) and sends OTP
3. User redirected to verification page
4. User enters 6-digit OTP from email
5. Account activated, user can login

### Login Flow (Unverified User)
1. User tries to login
2. System checks email verification status
3. If not verified, shows error and redirects to verification
4. User verifies email, then can login

### Forgot Password Flow
1. User clicks "Forgot Password" on login page
2. Enters email address
3. Receives OTP via email
4. Enters OTP to verify identity
5. Sets new password
6. Can login with new password

## Security Features

- OTPs expire after 10 minutes
- Password reset tokens expire after 30 minutes
- OTPs are removed after successful verification
- Email verification required before first login
- Google OAuth users are auto-verified
- Passwords are encrypted with BCrypt

## Testing

To test without actual email (development):
1. Check backend console for OTP (it's logged)
2. Or use a service like Mailtrap for testing
3. Use real email in production

## Troubleshooting

**Email not sending?**
- Check SMTP credentials
- Ensure 2-Step Verification is enabled for Gmail
- Use App Password, not regular password
- Check firewall/network settings

**OTP not working?**
- OTPs are case-sensitive
- Check if OTP is expired (10 minutes)
- Verify email matches exactly

**User can't login?**
- Check if `emailVerified` field is true in database
- User account is inactive until email is verified
