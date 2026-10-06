import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Base URL of the backend (running on 8081 locally)
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

// Create a custom Axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to append tokens and dynamic prefixes
apiClient.interceptors.request.use(
  (config) => {
    // 1. JWT Token Injection
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Advanced Routing Fix for Backend Misalignment
    // The backend uses /auth for authentication but /api/v1/ for entities
    if (config.url && !config.url.startsWith('/auth') && !config.url.startsWith('/api/v1')) {
      config.url = `/api/v1${config.url}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Basic Response Interceptor for 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API_ERROR:', error.response?.status, error.response?.data, error.config?.url, error.config?.data);
    if (error.response?.status === 401) {
      // Clear token via Zustand store to keep state synced
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
