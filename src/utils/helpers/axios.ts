// src/utils/helpers/axios.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';
import { getCurrentLocale } from '@/services/user';

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, any>;
  debug?: any;
};

// Helper function to get the current domain
const getCurrentDomain = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};

// Axios instance
const AxiosJSON: AxiosInstance = axios.create({
  baseURL: ENV.BACKEND_URL,
  withCredentials: true, // Important for cookies, authorization headers with HTTPS
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 30000
});

// CSRF
AxiosJSON.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

// Request interceptor
AxiosJSON.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Handle preflight requests
    if (config.method?.toLowerCase() === 'options') {
      config.headers['Access-Control-Allow-Origin'] = getCurrentDomain();
      config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
      config.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Authorization';
      config.headers['Access-Control-Allow-Credentials'] = 'true';
      return config;
    }

    // Add auth token if available
    const token = localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add locale headers
    const locale = getCurrentLocale();
    if (locale && config.headers) {
      config.headers['Accept-Language'] = locale;
      config.headers['X-Locale'] = locale;
    }

    // Ensure CORS headers are set for all requests
    if (config.headers) {
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      config.headers['Access-Control-Allow-Origin'] = getCurrentDomain();
      config.headers['Access-Control-Allow-Credentials'] = 'true';
    }

    if (config.method?.toLowerCase() !== 'get' && typeof document !== 'undefined') {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      if (csrfToken && config.headers) config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
AxiosJSON.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    const axiosError = error as AxiosError;
    const originalRequest = axiosError.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // CORS / network errors
    if (axiosError.code === 'ERR_NETWORK' && axiosError.message.includes('CORS')) {
      return Promise.reject({
        ...axiosError,
        isCorsError: true,
        message: 'Network error: Could not connect to the server. Please check your connection or try again.'
      });
    }

    // 401 Unauthorized → refresh token
    if (axiosError.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${ENV.BACKEND_URL}/api/auth/refresh`, { refresh_token: refreshToken }, { withCredentials: true });
          const { token, refresh_token } = res.data;
          localStorage.setItem('auth_token', token);
          if (refresh_token) localStorage.setItem('refresh_token', refresh_token);

          if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
          return AxiosJSON(originalRequest);
        }
      } catch (refreshError: unknown) {
        const errorObj = typeof refreshError === 'object' && refreshError !== null ? refreshError : {};
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_auth_token');

        return Promise.reject({
          ...errorObj,
          isAuthError: true,
          message: 'Session expired. Please log in again.'
        });
      }
    }

    // Other HTTP errors
    if (axiosError.response) {
      const responseData = axiosError.response.data as ApiErrorResponse;
      console.error(`HTTP Error ${axiosError.response.status}:`, responseData.message || 'Unknown error');
    }

    return Promise.reject(axiosError);
  }
);

export default AxiosJSON;
