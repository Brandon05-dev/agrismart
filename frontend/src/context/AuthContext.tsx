import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, RegisterData, AuthResponse } from '../types';
import api from '../utils/api';

interface OTPResponse {
  success: boolean;
  message?: string;
  userId?: string;
  method?: 'email' | 'phone';
  destination?: string;
  requiresVerification?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithPhone: (phone: string, password: string) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  googleLogin: (token: string, role?: string, farmName?: string) => Promise<AuthResponse>;
  sendOTP: (email?: string, phone?: string, userId?: string) => Promise<OTPResponse>;
  verifyOTP: (otp: string, userId?: string, email?: string, phone?: string) => Promise<AuthResponse>;
  logout: () => void;
  isFarmer: () => boolean;
  isBuyer: () => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await api.get<{ data: User }>('/auth/me');
          setUser(response.data.data);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ data: { user: User; token: string } }>('/auth/login', { email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        requiresVerification: error.response?.data?.requiresVerification,
        userId: error.response?.data?.userId
      };
    }
  };

  const loginWithPhone = async (phone: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ data: { user: User; token: string } }>('/auth/login', { phone, password });
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error: any) {
      console.error('Phone login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        requiresVerification: error.response?.data?.requiresVerification,
        userId: error.response?.data?.userId
      };
    }
  };

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Check if OTP verification is required
      if (response.data.data?.requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          userId: response.data.data.userId,
          message: response.data.message || 'Please verify your OTP'
        };
      }

      // Legacy flow - direct login after registration
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const googleLogin = async (token: string, role?: string, farmName?: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ data: { user: User; token: string } }>('/auth/google', { 
        token, 
        role, 
        farmName 
      });
      const { user, token: jwtToken } = response.data.data;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error: any) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Google login failed'
      };
    }
  };

  const sendOTP = async (email?: string, phone?: string, userId?: string): Promise<OTPResponse> => {
    try {
      const response = await api.post('/auth/send-otp', { email, phone, userId });
      return {
        success: true,
        userId: response.data.data.userId,
        method: response.data.data.method,
        destination: response.data.data.destination,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP'
      };
    }
  };

  const verifyOTP = async (otp: string, userId?: string, email?: string, phone?: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ data: { user: User; token: string } }>('/auth/verify-otp', { 
        otp, 
        userId, 
        email, 
        phone 
      });
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true, user };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed'
      };
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isFarmer = (): boolean => {
    return user?.role === 'Farmer';
  };

  const isBuyer = (): boolean => {
    return user?.role === 'Buyer';
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithPhone,
    register,
    googleLogin,
    sendOTP,
    verifyOTP,
    logout,
    isFarmer,
    isBuyer,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
