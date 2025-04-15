// src/lib/axios.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add request interceptor for auth headers
apiClient.interceptors.request.use(
  (config) => {
    // Only run this on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('referral-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle unauthorized errors
    if (error?.response?.status === 401) {
      // Optional: Clear token and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('referral-token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error?.response?.data || error);
  }
);

export default apiClient;