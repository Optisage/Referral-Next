// src/lib/axios.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("referral-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const originalRequest = error.config;
    const errorMessage = error?.response?.data?.message || "An error occurred";

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const errorMessage =
        error?.response?.data?.message || "An error occurred";
      if (typeof window !== "undefined") {
        // Clear auth state without triggering redirect here
        localStorage.removeItem("referral-token");
        localStorage.removeItem("user");

        // Let React components handle the redirect through state changes
        window.dispatchEvent(new Event("storage-update"));
      }
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;