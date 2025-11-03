import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OTPModal from '../components/OTPModal';
import './Auth.css';

// Declare Google Sign-In types
declare global {
  interface Window {
    google?: any;
  }
}

interface RegisterFormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'Buyer' | 'Farmer';
  farmName: string;
  organizationName?: string;
  organizationType?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Buyer',
    farmName: '',
    organizationName: '',
    organizationType: ''
  });
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpData, setOtpData] = useState<{userId: string, method: 'email' | 'phone', destination: string} | null>(null);

  const { register, googleLogin, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

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
          { theme: 'outline', size: 'large', width: '100%', text: 'signup_with' }
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
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    setError('');

    const result = await googleLogin(response.credential, formData.role, formData.farmName);

    if (result.success && result.user) {
      if (result.user.role === 'Farmer') {
        navigate('/dashboard/farmer');
      } else {
        navigate('/marketplace');
      }
    } else {
      setError(result.message || 'Google sign-in failed');
    }

    setLoading(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username) {
      setError('Username is required');
      return;
    }

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'Farmer' && !formData.farmName) {
      setError('Farm name is required for farmers');
      return;
    }

    setLoading(true);

    const userData = {
      username: formData.username,
      email: authMethod === 'email' ? formData.email : undefined,
      phone: authMethod === 'phone' ? formData.phone : undefined,
      password: formData.password,
      role: formData.role,
      farmName: formData.farmName || undefined,
      organizationName: formData.organizationName || undefined,
      organizationType: formData.organizationType || undefined
    };

    const result = await register(userData);

    if (result.success) {
      if (result.requiresVerification && result.userId) {
        // Show OTP modal
        setOtpData({
          userId: result.userId,
          method: authMethod,
          destination: authMethod === 'email' ? formData.email : formData.phone
        });
        setShowOTPModal(true);
      } else if (result.user) {
        // Direct login (legacy flow)
        if (result.user.role === 'Farmer') {
          navigate('/dashboard/farmer');
        } else {
          navigate('/marketplace');
        }
      }
    } else {
      setError(result.message || 'Registration failed');
    }

    setLoading(false);
  };

  const handleVerifyOTP = async (otp: string) => {
    if (!otpData) return;

    const result = await verifyOTP(otp, otpData.userId);

    if (result.success && result.user) {
      setShowOTPModal(false);
      // Redirect based on user role
      if (result.user.role === 'Farmer') {
        navigate('/dashboard/farmer');
      } else {
        navigate('/marketplace');
      }
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
        <h2>Join AgriSmart</h2>
        <p className="auth-subtitle">Connect farmers with buyers directly</p>
        
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
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
              disabled={loading}
            />
          </div>

          {authMethod === 'email' ? (
            <div className="form-group">
              <label>Email *</label>
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
          ) : (
            <div className="form-group">
              <label>Phone Number *</label>
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

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>I am a: *</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="Buyer">Buyer (Organization/Institution)</option>
              <option value="Farmer">Farmer</option>
            </select>
          </div>

          {formData.role === 'Farmer' && (
            <div className="form-group">
              <label>Farm Name *</label>
              <input
                type="text"
                name="farmName"
                value={formData.farmName}
                onChange={handleChange}
                required
                placeholder="Enter your farm name"
                disabled={loading}
              />
            </div>
          )}

          {formData.role === 'Buyer' && (
            <>
              <div className="form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName || ''}
                  onChange={handleChange}
                  placeholder="Company, School, Hospital, etc."
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Organization Type</label>
                <select
                  name="organizationType"
                  value={formData.organizationType || ''}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select Type</option>
                  <option value="Company">Company/Corporation</option>
                  <option value="School">School/University</option>
                  <option value="Hospital">Hospital/Healthcare</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Institution">Government Institution</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
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

export default Register;
