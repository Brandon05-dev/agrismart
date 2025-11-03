import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OTPModal from '../components/OTPModal';
import './Auth.css';

// Declare Google Sign-In types
declare global {
  interface Window {
    google?: any;
  }
}

interface LoginFormData {
  email: string;
  phone: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    phone: '',
    password: ''
  });
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'otp'>('email');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpData, setOtpData] = useState<{userId?: string, method: 'email' | 'phone', destination: string} | null>(null);

  const { login, loginWithPhone, googleLogin, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
        );
      }
    };

    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    setError('');

    const result = await googleLogin(response.credential);

    if (result.success && result.user) {
      const from = (location.state as any)?.from?.pathname || (result.user.role === 'Farmer' ? '/dashboard/farmer' : '/marketplace');
      navigate(from);
    } else {
      setError(result.message || 'Google sign-in failed');
    }

    setLoading(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (authMethod === 'otp') {
      // Send OTP flow
      if (!formData.email && !formData.phone) {
        setError('Please enter email or phone number');
        return;
      }

      setLoading(true);

      const result = await sendOTP(
        formData.email || undefined,
        formData.phone || undefined
      );

      if (result.success) {
        setOtpData({
          method: result.method || 'email',
          destination: result.destination || formData.email || formData.phone,
          userId: result.userId
        });
        setShowOTPModal(true);
      } else {
        setError(result.message || 'Failed to send OTP');
      }

      setLoading(false);
      return;
    }

    // Regular login flow
    if (authMethod === 'email' && !formData.email) {
      setError('Email is required');
      return;
    }

    if (authMethod === 'phone' && !formData.phone) {
      setError('Phone number is required');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    const result = authMethod === 'email' 
      ? await login(formData.email, formData.password)
      : await loginWithPhone(formData.phone, formData.password);

    if (result.success && result.user) {
      const from = (location.state as any)?.from?.pathname || (result.user.role === 'Farmer' ? '/dashboard/farmer' : '/marketplace');
      navigate(from);
    } else {
      if (result.requiresVerification && result.userId) {
        // Show OTP modal for unverified account
        setOtpData({
          userId: result.userId,
          method: authMethod,
          destination: authMethod === 'email' ? formData.email : formData.phone
        });
        setShowOTPModal(true);
      } else {
        setError(result.message || 'Login failed');
      }
    }

    setLoading(false);
  };

  const handleVerifyOTP = async (otp: string) => {
    if (!otpData) return;

    const result = await verifyOTP(
      otp,
      otpData.userId,
      otpData.method === 'email' ? otpData.destination : undefined,
      otpData.method === 'phone' ? otpData.destination : undefined
    );

    if (result.success && result.user) {
      setShowOTPModal(false);
      const from = (location.state as any)?.from?.pathname || (result.user.role === 'Farmer' ? '/dashboard/farmer' : '/marketplace');
      navigate(from);
    } else {
      throw new Error(result.message || 'OTP verification failed');
    }
  };

  const handleResendOTP = async () => {
    if (!otpData) return;

    await sendOTP(
      otpData.method === 'email' ? otpData.destination : undefined,
      otpData.method === 'phone' ? otpData.destination : undefined,
      otpData.userId
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your AgriSmart account</p>
        
        {error && <div className="error-message">{error}</div>}

        {/* Google Sign-In Button */}
        <div className="google-signin-wrapper">
          <div id="googleSignInButton"></div>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        {/* Auth Method Toggle */}
        <div className="auth-method-toggle">
          <button
            type="button"
            className={`auth-method-btn ${authMethod === 'email' ? 'active' : ''}`}
            onClick={() => setAuthMethod('email')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
              <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
            </svg>
            Email
          </button>
          <button
            type="button"
            className={`auth-method-btn ${authMethod === 'phone' ? 'active' : ''}`}
            onClick={() => setAuthMethod('phone')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
            </svg>
            Phone
          </button>
          <button
            type="button"
            className={`auth-method-btn ${authMethod === 'otp' ? 'active' : ''}`}
            onClick={() => setAuthMethod('otp')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
            OTP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {authMethod === 'email' && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                disabled={loading}
              />
            </div>
          )}

          {authMethod === 'phone' && (
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+254712345678"
                disabled={loading}
              />
              <small>Include country code (e.g., +254 for Kenya)</small>
            </div>
          )}

          {authMethod === 'otp' && (
            <div className="form-group">
              <label>Email or Phone Number</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={(e) => {
                  // Auto-detect email vs phone
                  const value = e.target.value;
                  if (value.includes('@')) {
                    setFormData({ ...formData, email: value, phone: '' });
                  } else {
                    setFormData({ ...formData, phone: value, email: '' });
                  }
                }}
                required
                placeholder="Email or phone number"
                disabled={loading}
              />
              <small>Enter your email or phone to receive OTP</small>
            </div>
          )}

          {authMethod !== 'otp' && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (authMethod === 'otp' ? 'Sending OTP...' : 'Logging in...') : (authMethod === 'otp' ? 'Send OTP' : 'Login')}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>

      {showOTPModal && otpData && (
        <OTPModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          destination={otpData.destination}
          method={otpData.method}
        />
      )}
    </div>
  );
};

export default Login;
