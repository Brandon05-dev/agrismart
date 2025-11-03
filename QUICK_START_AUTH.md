# 🚀 Quick Start Guide - Multi-Channel Authentication

## Step 1: Install Backend Dependencies

Already installed! The following packages have been added:
- `nodemailer` - Email sending
- `africastalking` - SMS (Africa's Talking)
- `twilio` - SMS (Twilio, alternative)
- `google-auth-library` - Google OAuth verification

## Step 2: Configure Environment Variables

### Minimum Configuration (Development)

Edit `backend/.env` and add:

```env
# Email (Gmail for testing)
EMAIL_SERVICE=gmail
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Google OAuth (Get from Google Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# SMS Provider (Choose one)
SMS_PROVIDER=africastalking
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your-api-key
```

### Get Gmail App Password
1. Enable 2FA on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate a new app password for "Mail"
4. Copy the 16-character password (no spaces)

### Get Google Client ID
1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Copy the Client ID

### Get Africa's Talking API Key (Optional, for SMS)
1. Sign up: https://account.africastalking.com/auth/register
2. Use sandbox for free testing
3. Get API Key from Settings → API Key

## Step 3: Update Frontend Environment

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Step 4: Start the Application

### Terminal 1 (Backend)
```bash
cd backend
npm start
```

### Terminal 2 (Frontend)
```bash
cd frontend
npm start
```

## Step 5: Test Authentication

### Test Email Registration
1. Go to http://localhost:3000/register
2. Select "Email" method
3. Fill in: username, email, password, role
4. Click "Create Account"
5. Check your email for OTP code
6. Enter OTP in the modal
7. Success! You're logged in

### Test Phone Registration
1. Go to http://localhost:3000/register
2. Select "Phone" method
3. Fill in: username, phone (+country code), password, role
4. Click "Create Account"
5. Check your phone for SMS OTP
6. Enter OTP in the modal
7. Success! You're logged in

### Test Google Sign-In
1. Go to http://localhost:3000/register
2. Click "Sign up with Google" button
3. Select your Google account
4. Choose your role (Farmer/Buyer)
5. Success! You're logged in

### Test OTP Login (Passwordless)
1. Go to http://localhost:3000/login
2. Select "OTP" method
3. Enter your email or phone
4. Click "Send OTP"
5. Check email/SMS for OTP code
6. Enter OTP in the modal
7. Success! You're logged in

## Testing Tips

### Email Testing (Development)
- Use your real Gmail for testing
- Or use Mailtrap.io for a fake SMTP server
- OTP codes are 6 digits (e.g., 123456)

### SMS Testing (Development)
- Africa's Talking Sandbox: Free but limited to test numbers
- Twilio Trial: $15 free credit
- **Important**: Use international format: +254712345678

### Google Sign-In Testing
- Works immediately with any Google account
- No verification needed (Google emails are pre-verified)

## Common Issues

### ❌ Email not sending
**Solution**: Check Gmail app password, ensure 2FA is enabled

### ❌ SMS not sending
**Solution**: Verify phone format (+country code), check API keys

### ❌ Google button not showing
**Solution**: Check REACT_APP_GOOGLE_CLIENT_ID is set, clear cache

### ❌ OTP expired
**Solution**: OTP expires in 5 minutes, request a new one

### ❌ "User already exists"
**Solution**: Email/phone/username already registered, try login instead

## API Testing with Postman/cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "Buyer"
  }'
```

### Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userId": "USER_ID_FROM_REGISTER"
  }'
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456",
    "userId": "USER_ID_FROM_REGISTER"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
├─────────────────────────────────────────────────────────┤
│  • LoginNew.tsx / RegisterNew.tsx                       │
│  • OTPModal.tsx (verification UI)                       │
│  • OTPInput.tsx (6-digit input)                         │
│  • AuthContext.tsx (state management)                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────┐
│                  BACKEND (Node.js)                      │
├─────────────────────────────────────────────────────────┤
│  Routes: /api/auth/*                                    │
│    • POST /register → Create user + Send OTP            │
│    • POST /send-otp → Send OTP to email/phone           │
│    • POST /verify-otp → Verify OTP + Login              │
│    • POST /login → Email/Phone login                    │
│    • POST /google → Google OAuth login                  │
│                                                          │
│  Services:                                              │
│    • otpService.js → Generate/Send/Verify OTP           │
│    • googleAuthService.js → Verify Google tokens        │
│                                                          │
│  Models:                                                │
│    • User.js → Store users with OTP fields              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────┤
│  • Nodemailer → Gmail SMTP (Email OTP)                  │
│  • Africa's Talking → SMS API (Phone OTP)               │
│  • Twilio → SMS API (Alternative)                       │
│  • Google OAuth → Token verification                    │
└─────────────────────────────────────────────────────────┘
```

## Next Steps

1. ✅ Configure environment variables
2. ✅ Test all authentication methods
3. 🔲 Add rate limiting (recommended)
4. 🔲 Set up production email service
5. 🔲 Purchase SMS credits (production)
6. 🔲 Configure Google OAuth for production domain
7. 🔲 Add password reset functionality
8. 🔲 Implement account security features

## Production Checklist

- [ ] Use production Gmail account or transactional email service (SendGrid, AWS SES)
- [ ] Purchase Africa's Talking or Twilio SMS credits
- [ ] Update Google OAuth authorized domains
- [ ] Enable HTTPS
- [ ] Add rate limiting to prevent abuse
- [ ] Set strong JWT_SECRET
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring and logging
- [ ] Test on multiple devices and browsers

## Support

Need help? Check:
1. Full documentation: `docs/MULTI_CHANNEL_AUTH_GUIDE.md`
2. Backend logs: Terminal running `npm start`
3. Browser console: F12 → Console tab
4. Network tab: F12 → Network tab

---

**You're all set! 🎉**

Start the servers and test the authentication system.
