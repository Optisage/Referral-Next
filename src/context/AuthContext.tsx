'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Function to get country from phone number
const getCountryFromPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return 'nigeria'; // Default
  
  // Simple country detection based on phone codes
  if (phoneNumber.startsWith('+234') || phoneNumber.startsWith('234')) {
    return 'nigeria';
  } else if (phoneNumber.startsWith('+233') || phoneNumber.startsWith('233')) {
    return 'ghana';
  } else if (phoneNumber.startsWith('+1CA')) {
    return 'canada';
  } else if (phoneNumber.startsWith('+1') || phoneNumber.startsWith('1')) {
    return 'usa';
  } else if (phoneNumber.startsWith('+52') || phoneNumber.startsWith('52')) {
    return 'mexico';
  }
  
  return 'nigeria'; // Default fallback
};

interface User {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  whatsappChannelName: string;
  country?: string;
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
      // Determine country from phone number
      let country = 'nigeria'; // Default
      if (whatsappNumber.startsWith('+1') || whatsappNumber.startsWith('1')) {
        country = 'usa';
      } else if (whatsappNumber.startsWith('+1CA') || whatsappNumber === '+1CA') {
        country = 'canada';
      } else if (whatsappNumber.startsWith('+52') || whatsappNumber.startsWith('52')) {
        country = 'mexico';
      } else if (whatsappNumber.startsWith('+234') || whatsappNumber.startsWith('234')) {
        country = 'nigeria';
      } else if (whatsappNumber.startsWith('+233') || whatsappNumber.startsWith('233')) {
        country = 'ghana';
      }
      
      // In a real app, this would make an API call to verify the OTP and get user data
      // For demo, we'll simulate a successful login
      const mockUser: User = {
        id: '123456',
        fullName: 'Test User',
        email,
        whatsappNumber,
        whatsappChannelName: 'Test Channel',
        country,
        referralLink: `https://optisage.com/ref/123456`,
      };
      
      // If we already have a user in localStorage from API verification (mock),
      // use that instead of creating a new one
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          // Get country from phone number if not explicitly provided
          const userCountry = parsedUser.country || getCountryFromPhoneNumber(parsedUser.phone);
          
          // Convert API user to our user format
          const apiUser: User = {
            id: parsedUser.id.toString(),
            fullName: `${parsedUser.first_name} ${parsedUser.last_name}`,
            email: parsedUser.email,
            whatsappNumber: parsedUser.phone,
            whatsappChannelName: parsedUser.group_name,
            country: userCountry,
            referralLink: `https://optisage.com/ref/${parsedUser.id}`,
          };
          setUser(apiUser);
          // Store our user format too for context persistence
          localStorage.setItem('user', JSON.stringify(apiUser));
          return;
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }
      
      // If no API user was found, use the mock user
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
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
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
    // Mock verification - consider the verification successful
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
      
      // If we already have a user in localStorage from API registration (mock),
      // use that instead of creating a new one
      const apiUserData = localStorage.getItem('userData');
      if (apiUserData) {
        try {
          const parsedUser = JSON.parse(apiUserData);
          // Get country from phone number if not explicitly provided
          const userCountry = parsedUser.country || getCountryFromPhoneNumber(parsedUser.phone);
          
          // Convert API user to our user format
          const apiUser: User = {
            id: parsedUser.id.toString(),
            fullName: `${parsedUser.first_name} ${parsedUser.last_name}`,
            email: parsedUser.email,
            whatsappNumber: parsedUser.phone,
            whatsappChannelName: parsedUser.group_name,
            country: userCountry,
            referralLink: `https://optsage.com/ref/${parsedUser.id}`,
          };
          setUser(apiUser);
          // Store our user format too for context persistence
          localStorage.setItem('user', JSON.stringify(apiUser));
          return;
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }
      
      // If no API user was found, use mock data
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