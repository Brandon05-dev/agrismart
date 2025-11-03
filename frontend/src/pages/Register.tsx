import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'Buyer' | 'Farmer';
  farmName: string;
  phone: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Buyer',
    farmName: '',
    phone: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.role === 'Farmer' && !formData.farmName) {
      setError('Farm name is required for farmers');
      return;
    }

    setLoading(true);

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      farmName: formData.farmName || undefined,
      phone: formData.phone || undefined
    };

    const result = await register(userData);

    if (result.success && result.user) {
      // Redirect based on user role
      if (result.user.role === 'Farmer') {
        navigate('/dashboard/farmer');
      } else {
        navigate('/marketplace');
      }
    } else {
      setError(result.message || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Register for AgriSmart</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <div className="form-group">
            <label>I am a:</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              required
            >
              <option value="Buyer">Buyer</option>
              <option value="Farmer">Farmer</option>
            </select>
          </div>

          {formData.role === 'Farmer' && (
            <div className="form-group">
              <label>Farm Name</label>
              <input
                type="text"
                name="farmName"
                value={formData.farmName}
                onChange={handleChange}
                required
                placeholder="Enter your farm name"
              />
            </div>
          )}

          <div className="form-group">
            <label>Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your contact number"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
