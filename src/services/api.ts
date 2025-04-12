import axios from 'axios';

const API_BASE_URL = 'https://api-staging.optisage.ai/api/referral-system';
const MOCK_OTP = '111111'; // Mock OTP for development

// Define types for API responses
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  meta: any[];
}

export interface RegisterResponse extends ApiResponse<any> {}

export interface VerifyOtpResponse extends ApiResponse<{
  token: string;
  token_type: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    account_type: string;
    group_name: string;
    updated_at: string;
    created_at: string;
    id: number;
    username: string;
    profile_image: string | null;
  };
}> {}

// Add interfaces for dashboard analytics
export interface AnalyticsMetric {
  metric: 'total referrals' | 'total points' | 'conversion rate' | 'total amount';
  value: number;
  month_growth: number;
}

export interface DashboardAnalyticsResponse extends ApiResponse<AnalyticsMetric[]> {}

// Mock response generator for development
const generateMockResponse = (phone: string, name: string = 'Test User', email: string = 'test@example.com'): VerifyOtpResponse => {
  return {
    status: 200,
    message: 'Success',
    meta: [],
    data: {
      token: 'mock-jwt-token-' + Date.now(),
      token_type: 'Bearer',
      user: {
        email: email,
        first_name: name.split(' ')[0] || 'Test',
        last_name: name.split(' ')[1] || 'User',
        phone: phone,
        account_type: 'user',
        group_name: 'admin',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        id: Math.floor(Math.random() * 1000),
        username: email.split('@')[0],
        profile_image: null
      }
    }
  };
};

/**
 * Register a new user and send OTP
 */
export async function register(
  email: string,
  name: string,
  phone: string,
  group_name: string = 'admin'
): Promise<RegisterResponse> {
  try {
    // Ensure phone number format is correct (starts with '+')
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    
    console.log('Making register API call with phone:', formattedPhone);
    
    // If in development mode, bypass actual API call
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Bypassing actual register API call');
      return {
        status: 200,
        message: 'OTP sent successfully',
        data: { phone: formattedPhone },
        meta: []
      };
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/register`,
      {
        email,
        name,
        phone: formattedPhone,
        group_name
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Register API error:', error.response?.data || error.message);
    
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else if (error.response.data.errors) {
        // Return the first validation error message
        const firstErrorField = Object.keys(error.response.data.errors)[0];
        if (firstErrorField && error.response.data.errors[firstErrorField][0]) {
          throw new Error(error.response.data.errors[firstErrorField][0]);
        }
      }
    }
    throw error;
  }
}

/**
 * Verify OTP and login user
 */
export async function verifyOtp(
  phone: string,
  otp: string
): Promise<VerifyOtpResponse> {
  try {
    // Format the phone number according to API's expected format
    // Remove all non-digit characters except the leading '+'
    let formattedPhone = phone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with a +
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }
    
    console.log('Making verify OTP API call with phone:', formattedPhone);
    
    // If using the mock OTP, bypass API call
    if (otp === MOCK_OTP) {
      console.log('Using mock OTP - bypassing actual API verification');
      return generateMockResponse(formattedPhone);
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/verify-otp`,
      {
        phone: formattedPhone,
        otp
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Verify OTP API error:', error.response?.data || error.message);
    
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else if (error.response.data.errors && error.response.data.errors.phone) {
        throw new Error(error.response.data.errors.phone[0]);
      }
    }
    throw error;
  }
}

/**
 * Request OTP for login
 */
export async function loginWithOtp(
  phone: string
): Promise<ApiResponse<any>> {
  try {
    // Format the phone number according to API's expected format
    // Remove all non-digit characters except the leading '+'
    let formattedPhone = phone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with a +
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }
    
    console.log('Making login API call with phone:', formattedPhone);
    
    // Bypass API call in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Bypassing actual login API call');
      console.log('Use OTP code:', MOCK_OTP, 'to login');
      return {
        status: 200,
        message: 'OTP sent successfully',
        data: { phone: formattedPhone },
        meta: []
      };
    }
    
    // Hardcoded example that works (for debugging)
    const examplePhone = '+2348127872081';
    console.log('Example phone from docs:', examplePhone);
    
    const response = await axios.post(
      `${API_BASE_URL}/login`,
      {
        phone: formattedPhone
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Login API error:', error.response?.data || error.message);
    
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else if (error.response.data.errors && error.response.data.errors.phone) {
        throw new Error(error.response.data.errors.phone[0]);
      }
    }
    throw error;
  }
}

/**
 * Get dashboard analytics data
 */
export async function getDashboardAnalytics(): Promise<DashboardAnalyticsResponse> {
  try {
    // Get auth token from localStorage
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.get(
      `${API_BASE_URL}/dashboard/analytics`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Dashboard analytics API error:', error.response?.data || error.message);
    
    // If we're using development mode and the API is not fully ready, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Returning mock dashboard analytics data');
      return {
        status: 200,
        message: "Analytics retrieved successfully",
        data: [
          {
            metric: "total referrals",
            value: 1234,
            month_growth: 12
          },
          {
            metric: "total points",
            value: 3567,
            month_growth: 23
          },
          {
            metric: "conversion rate",
            value: 32,
            month_growth: 5
          },
          {
            metric: "total amount",
            value: 85000,
            month_growth: 23
          }
        ],
        meta: []
      };
    }
    
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw error;
  }
} 