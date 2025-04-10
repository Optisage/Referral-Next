'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface User {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  whatsappChannelName: string;
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
      // In a real app, this would make an API call to verify the OTP and get user data
      // For demo, we'll simulate a successful login
      const mockUser: User = {
        id: '123456',
        fullName: 'Test User',
        email,
        whatsappNumber,
        whatsappChannelName: 'Test Channel',
        referralLink: `https://optsage.com/ref/123456`,
      };
      
      setUser(mockUser);
      // Safe localStorage access
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(mockUser));
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(null);
      // Safe localStorage access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    } finally {
      setLoggingOut(false);
    }
  }, []);

  const verifyOtp = useCallback(async (identifier: string, otp: string): Promise<boolean> => {
    // In a real app, this would call an API to verify the OTP
    // The identifier can be either an email or whatsapp number
    // For demo, we'll accept any OTP
    console.log(`Verifying OTP for ${identifier}`);
    return true;
  }, []);

  const sendOtp = useCallback(async (identifier: string): Promise<void> => {
    // In a real app, this would call an API to send the OTP
    // The identifier can be either an email or whatsapp number
    // For demo, we'll just simulate the process
    console.log(`OTP sent to ${identifier}`);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  const register = useCallback(async (userData: Omit<User, 'id' | 'referralLink'>): Promise<void> => {
    setLoading(true);
    try {
      // In a real app, this would make an API call to register the user
      // For demo, we'll simulate a successful registration
      const mockUser: User = {
        id: '123456',
        ...userData,
        referralLink: `https://optsage.com/ref/123456`,
      };
      
      setUser(mockUser);
      // Safe localStorage access
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(mockUser));
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