'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  group_name: string;
  referralLink?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  pageLoading: boolean;
  loggingOut: boolean;
  login: (email: string, otp: string, whatsappNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (identifier: string, otp: string) => Promise<boolean>;
  sendOtp: (identifier: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'referralLink'>) => Promise<void>;
  setPageLoading: (isLoading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

// Base URL for API
const API_BASE_URL = 'https://api-staging.optisage.ai/api/referral-system';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Safe localStorage access only on the client
    if (typeof window !== 'undefined' && !initialized) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized]);

  const login = useCallback(async (email: string, otp: string, whatsappNumber: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        otp,
        whatsappNumber,
      });

      const userData = response.data;
      setUser(userData);

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setLoggingOut(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    } finally {
      setLoggingOut(false);
    }
  }, []);

  const verifyOtp = useCallback(async (identifier: string, otp: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
        identifier,
        otp,
      });

      return response.data.verified;
    } catch (error) {
      console.error('OTP verification failed:', error);
      return false;
    }
  }, []);


  const sendOtp = useCallback(async (identifier: string): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/send-otp`, {
        identifier,
      });
    } catch (error) {
      console.error('Sending OTP failed:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: Omit<User, 'id' | 'referralLink'>): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, userData);

      const newUser = response.data;
      setUser(newUser);

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(newUser));
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    pageLoading,
    loggingOut,
    login,
    logout,
    verifyOtp,
    sendOtp,
    register,
    setPageLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 