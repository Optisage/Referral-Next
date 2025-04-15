'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/axios'; // Use the configured axios instance

// Function to get country from phone number
export const getCountryFromPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return 'nigeria';
  
  if (phoneNumber.startsWith('+234') || phoneNumber.startsWith('234')) {
    return 'nigeria';
  } else if (phoneNumber.startsWith('+233') || phoneNumber.startsWith('233')) {
    return 'ghana';
  } else if (phoneNumber.startsWith('+1')) {
    // Improved North America handling
    return phoneNumber.startsWith('+152') ? 'canada' : 'usa';
  } else if (phoneNumber.startsWith('+52')) {
    return 'mexico';
  }
  
  return 'nigeria';
};

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  group_name: string;
  country?: string;
  referralLink?: string;
  username?: string;
  first_name?:string;
  last_name?:string
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  pageLoading: boolean;
  loggingOut: boolean;
  login: (whatsappNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (identifier: string, otp: string) => Promise<boolean>;
  sendOtp: (identifier: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'referralLink'>) => Promise<void>;
  setPageLoading: (isLoading: boolean) => void;
  saveSettings: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
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

  // Initialize auth state
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized) {
      const loadUser = () => {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('user');
        }
      };
      
      loadUser();
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized]);

  const handleUserStorage = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const login = useCallback(async (phone: string) => {
    setLoading(true);
    try {
      // Real API call
      const { data } = await apiClient.post('/referral-system/login', {
        phone,
      });
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    try {
      handleUserStorage(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    try {
      const { data } = await apiClient.post('/referral-system/verify-otp', { phone, otp });
      handleUserStorage(data?.user);
      localStorage.setItem('referral-token', data.token);
      console.log(data);
      return data;
    } catch (error) {
      console.error('OTP verification failed:', error);
      return false;
    }
  }, []);

  const sendOtp = useCallback(async (identifier: string) => {
    try {
      await apiClient.post('/auth/send-otp', { identifier });
    } catch (error) {
      console.error('OTP send failed:', error);
      throw error;
    }
  }, []);


  const saveSettings = useCallback(async (data: any) => {
    try {
      const { data: response } = await apiClient.put('/customer/settings', data);
      
      // Safely update user data with proper response structure
      const updatedUser = user ? {
        ...user,
        first_name: response?.first_name || user.first_name,
        last_name: response?.last_name || user.last_name,
        email: response?.email || user.email,
        phone: response?.phone || user.phone,
        group_name: response?.group_name || user.group_name
      } : null;
  
      if (updatedUser) {
        // Update both context and localStorage

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (error) {
      console.error('Settings update failed:', error);
      throw error;
    }
  }, [user]);

  const register = useCallback(async (userData: Omit<User, 'id' | 'referralLink'>) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/referral-system/register', userData);
      
      const newUser: User = {
        id: data.id,
        ...userData,
        referralLink: `https://optisage.com/ref/${data.id}`,
      };

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
    getCountryFromPhoneNumber,
    saveSettings
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};