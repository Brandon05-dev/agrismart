# Multi-Channel Authentication System - AgriSmart Marketplace

## Overview

AgriSmart now supports **three authentication methods**:
1. **Email/Password** - Traditional login with email
2. **Phone/Password** - Login using phone number
3. **Google OAuth** - One-click sign-in with Google account
4. **OTP Verification** - Passwordless login via OTP sent to email or phone

All new user registrations require OTP verification (except Google OAuth, which is pre-verified).

---

## 🔐 Features

### 1. **Email/Password Authentication**
- Register with username, email, and password
- Receive 6-digit OTP via email
- Verify email before accessing the platform
- OTP expires in 5 minutes

### 2. **Phone/Password Authentication**
- Register with username, phone number, and password
- Receive 6-digit OTP via SMS
- Support for international phone numbers
- OTP expires in 5 minutes

### 3. **Google OAuth Authentication**
- One-click sign-in with Google account
- No password required
- Email automatically verified
- Seamless user experience

### 4. **Passwordless OTP Login**
- Enter email or phone number
- Receive OTP instantly
- Login without remembering password
- Secure and convenient

---

## 🛠️ Backend Setup

### Environment Variables

Add the following to your `backend/.env` file:

```env
# =====================================================
# Email Configuration (Nodemailer)
# =====================================================
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

# =====================================================
# Google OAuth Configuration
# =====================================================
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# =====================================================
# SMS Configuration
# =====================================================
SMS_PROVIDER=africastalking  # or 'twilio'

# Africa's Talking Configuration
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your_africastalking_api_key_here
AFRICASTALKING_SENDER_ID=AgriSmart

# Twilio Configuration (Alternative)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Setting Up Email (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Copy the 16-character password
3. **Add to .env**:
   ```env
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### Setting Up Africa's Talking (SMS)

1. **Create Account**: https://account.africastalking.com/auth/register
2. **Get API Key**:
   - Navigate to Settings → API Key
   - Copy your API key
3. **Sandbox vs Production**:
   - Sandbox: Free, limited phone numbers for testing
   - Production: Requires payment for real SMS
4. **Add to .env**:
   ```env
   AFRICASTALKING_USERNAME=sandbox  # or your username
   AFRICASTALKING_API_KEY=your_api_key_here
   ```

### Setting Up Twilio (Alternative SMS Provider)

1. **Create Account**: https://www.twilio.com/try-twilio
2. **Get Credentials**:
   - Account SID and Auth Token from Console Dashboard
   - Buy a phone number or use trial number
3. **Add to .env**:
   ```env
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Setting Up Google OAuth

1. **Create Google Cloud Project**:
   - Go to https://console.cloud.google.com/
   - Create a new project
2. **Enable Google+ API**:
   - Navigate to APIs & Services → Library
   - Search for "Google+ API" and enable it
3. **Create OAuth Credentials**:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000` (for development)
   - Authorized redirect URIs: Not needed for frontend Google Sign-In
4. **Get Client ID**:
   - Copy the Client ID
5. **Add to .env**:
   ```env
   GOOGLE_CLIENT_ID=1234567890-abcdefg.apps.googleusercontent.com
   ```

---

## 🎨 Frontend Setup

### Environment Variables

Add to `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

### Install Dependencies

The following packages are already installed:
- `google-auth-library` (backend)
- `nodemailer` (backend)
- `africastalking` (backend)
- `twilio` (backend)

---

## 📡 API Endpoints

### 1. **POST /api/auth/register**
Register a new user with email or phone.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",     // Optional (required if no phone)
  "phone": "+254712345678",         // Optional (required if no email)
  "password": "securepassword123",
  "role": "Buyer",                  // or "Farmer"
  "farmName": "Green Valley Farm"   // Required if role is Farmer
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered. Please verify your OTP.",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "method": "email",
    "destination": "john@example.com",
    "requiresVerification": true
  }
}
```

---

### 2. **POST /api/auth/send-otp**
Send OTP to email or phone.

**Request Body:**
```json
{
  "email": "john@example.com",    // Optional
  "phone": "+254712345678",       // Optional
  "userId": "507f1f77bcf86cd799439011"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to email",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "method": "email",
    "destination": "john@example.com"
  }
}
```

---

### 3. **POST /api/auth/verify-otp**
Verify OTP and activate account.

**Request Body:**
```json
{
  "otp": "123456",
  "userId": "507f1f77bcf86cd799439011",  // Optional
  "email": "john@example.com",           // Optional
  "phone": "+254712345678"               // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "Buyer",
      "verified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. **POST /api/auth/google**
Login or signup with Google OAuth.

**Request Body:**
```json
{
  "token": "google_id_token_here",
  "role": "Buyer",                    // Optional for new users
  "farmName": "Green Valley Farm"     // Required if role is Farmer
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "Buyer",
      "verified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 5. **POST /api/auth/login**
Login with email/phone and password.

**Request Body:**
```json
{
  "email": "john@example.com",     // Optional (use email OR phone)
  "phone": "+254712345678",        // Optional (use email OR phone)
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "Buyer",
      "verified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🧪 Testing

### Email OTP (Development)

For development, you can use:
- **Mailtrap** (fake SMTP server): https://mailtrap.io/
- **Gmail** with app password (see setup above)

### SMS OTP (Development)

- **Africa's Talking Sandbox**: Free, limited to registered test numbers
- **Twilio Trial**: Free $15 credit, limited to verified numbers

### Phone Number Format

Always use international format with country code:
- ✅ `+254712345678` (Kenya)
- ✅ `+1234567890` (USA)
- ❌ `0712345678` (Missing country code)

---

## 🚀 Usage Examples

### Frontend: Register with Email

```typescript
const result = await register({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'secure123',
  role: 'Buyer'
});

if (result.requiresVerification) {
  // Show OTP modal
  setShowOTPModal(true);
}
```

### Frontend: Register with Phone

```typescript
const result = await register({
  username: 'johndoe',
  phone: '+254712345678',
  password: 'secure123',
  role: 'Farmer',
  farmName: 'Green Valley Farm'
});

if (result.requiresVerification) {
  // Show OTP modal
  setShowOTPModal(true);
}
```

### Frontend: Google Sign-In

```typescript
// Handled automatically by Google Sign-In button
// Callback receives credential token
const result = await googleLogin(credential, 'Buyer');
```

### Frontend: OTP Login

```typescript
// Send OTP
const result = await sendOTP('john@example.com');

// Verify OTP
const verifyResult = await verifyOTP('123456', result.userId);
```

---

## 📝 User Model Schema

```javascript
{
  username: String (required),
  email: String (unique, sparse),
  phone: String (unique, sparse),
  password: String (hashed, optional for OAuth),
  googleId: String (unique, sparse),
  role: String (Farmer/Buyer),
  farmName: String (required if Farmer),
  verified: Boolean (default: false),
  otpCode: String,
  otpExpiry: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: 30-day expiration
3. **OTP Expiry**: 5 minutes
4. **Rate Limiting**: (Recommended to add)
5. **HTTPS Only**: (Production)
6. **Environment Variables**: Sensitive data not in code

---

## 🐛 Troubleshooting

### Email Not Sending
- Check Gmail app password is correct
- Ensure 2FA is enabled on Gmail
- Check EMAIL_USER and EMAIL_PASSWORD in .env

### SMS Not Sending
- Verify API keys are correct
- Check phone number format (include country code)
- Ensure sufficient balance (production)
- Check sandbox phone numbers are registered (Africa's Talking)

### Google Sign-In Not Working
- Verify GOOGLE_CLIENT_ID matches in frontend and backend
- Check authorized JavaScript origins in Google Console
- Ensure Google+ API is enabled

### OTP Modal Not Showing
- Check browser console for errors
- Verify OTPModal component is imported
- Ensure showOTPModal state is toggled correctly

---

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Africa's Talking API](https://developers.africastalking.com/)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Google Sign-In for Web](https://developers.google.com/identity/gsi/web)

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API endpoint documentation
3. Check server logs for error messages
4. Verify environment variables are set correctly

---

**Built with ❤️ for AgriSmart Marketplace**
