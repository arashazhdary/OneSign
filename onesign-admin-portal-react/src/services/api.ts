import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// Base API client configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh token
            const newToken = await this.refreshToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', newRefreshToken);

        return token;
      } catch (error) {
        localStorage.removeItem('refreshToken');
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 400:
          toast.error(data.message || 'Invalid request');
          break;
        case 403:
          toast.error('You do not have permission to perform this action');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 429:
          toast.error('Too many requests. Please try again later');
          break;
        case 500:
          toast.error('Server error. Please try again later');
          break;
        default:
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Request made but no response
      toast.error('No response from server. Please check your connection');
    } else {
      // Error in request setup
      toast.error('An error occurred while making the request');
    }
  }

  // HTTP Methods with retry logic
  async get<T = any>(url: string, config?: AxiosRequestConfig, retries = 3): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error as AxiosError)) {
        await this.delay(1000 * (4 - retries));
        return this.get(url, config, retries - 1);
      }
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // Upload file with progress
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<T> = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Download file
  async download(url: string, filename: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  // Utility methods
  private shouldRetry(error: AxiosError): boolean {
    return (
      !error.response ||
      error.response.status === 408 ||
      error.response.status === 429 ||
      error.response.status >= 500
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const apiClient = new ApiClient();
export default apiClient;
