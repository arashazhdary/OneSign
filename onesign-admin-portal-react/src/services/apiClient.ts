import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { extractTenantId } from '@/lib/utils/tenant-extractor';
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth-token') || localStorage.getItem('accessToken');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check if this is a tenant API call
    const isTenantApi = config.url?.startsWith('/api/tenant/');

    if (isTenantApi) {
      // For tenant APIs, add tenantId as query parameter
      const tenantId = DEFAULT_TENANT_ID;

      // Ensure params object exists
      if (!config.params) {
        config.params = {};
      }

      // Add tenantId to params if not already present
      if (!config.params.tenantId) {
        config.params.tenantId = tenantId;
      }
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        isTenantApi,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle errors
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as any)?.message || 'An error occurred';

      switch (status) {
        case 401:
          toast.error('Unauthorized. Please login again.');
          localStorage.removeItem('auth-token');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(message);
      }

      if (import.meta.env.DEV) {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response.data);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
      if (import.meta.env.DEV) {
        console.error('❌ Network Error:', error.request);
      }
    } else {
      toast.error('An unexpected error occurred.');
      if (import.meta.env.DEV) {
        console.error('❌ Error:', error.message);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth-token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth-token');
};

export const getAuthToken = () => {
  return localStorage.getItem('auth-token');
};
