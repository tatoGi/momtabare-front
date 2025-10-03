// src/utils/helpers/axios.ts
import axios, { 
  AxiosError, 
  AxiosResponse, 
  InternalAxiosRequestConfig,
  AxiosRequestConfig
} from 'axios';
import { ENV } from '../config/env';
import { getCurrentLocale } from '@/services/user';
import { isProduction } from './environment';

// CORS preflight setup
const setupCorsPreflight = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    await axios.options(ENV.BACKEND_URL, {
      withCredentials: true,
      headers: {
        'Access-Control-Request-Method': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Request-Headers': 'X-Requested-With, Content-Type, Authorization, X-XSRF-TOKEN'
      }
    });
  } catch (error) {
    console.warn('CORS preflight check failed:', error);
  }
};

// Initialize CORS preflight on app start
if (typeof window !== 'undefined') {
  setupCorsPreflight().catch(console.error);
}

// Configure base URL with proper protocol handling for different environments
let normalizedBaseUrl = ENV.BACKEND_URL;

// Only adjust protocol for local development
if (!isProduction) {
  try {
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1');
    
    if (isLocalhost && normalizedBaseUrl.startsWith('https://')) {
      normalizedBaseUrl = normalizedBaseUrl.replace('https://', 'http://');
      console.warn('Adjusted backend URL for local development to HTTP:', normalizedBaseUrl);
    }
  } catch (e) {
    console.error('Error normalizing base URL:', e);
  }
}

const AxiosJSON = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(isProduction && {
      'Access-Control-Allow-Origin': 'https://www.momtabare.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, X-XSRF-TOKEN',
      'Access-Control-Allow-Credentials': 'true'
    })
  },
  timeout: 30000, // 30 seconds
})

// Configure CSRF token handling
AxiosJSON.defaults.withCredentials = true
AxiosJSON.defaults.xsrfCookieName = 'XSRF-TOKEN'
AxiosJSON.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'

// Request interceptor with enhanced CORS and CSRF handling
AxiosJSON.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip for CORS preflight
    if (config.method?.toLowerCase() === 'options') {
      return config;
    }

    const token = localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token');
    const locale = getCurrentLocale();

    if (config.headers) {
      // Add authorization header if token exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add localization headers
      if (locale) {
        config.headers['Accept-Language'] = locale;
        config.headers['X-Localization'] = locale;
      }

      // Add CSRF token for non-GET requests
      if (config.method?.toLowerCase() !== 'get' && typeof document !== 'undefined') {
        const csrfToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1];
          
        if (csrfToken) {
          config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
        }
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
)

// Response interceptor with enhanced error handling
AxiosJSON.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle successful responses
    if (response?.data?.debug) {
      console.log('Debug Information:', response.data.debug);
    }
    return response;
  },
  async (error: any) => {
    // Handle CORS errors
    if (error.code === 'ERR_NETWORK' && error.message.includes('CORS')) {
      console.error('CORS Error:', {
        message: 'CORS policy blocked the request',
        url: error.config?.url,
        method: error.config?.method,
        withCredentials: error.config?.withCredentials
      });
      
      return Promise.reject({
        ...error,
        isCorsError: true,
        message: 'Network error: Could not connect to the server. Please check your connection or try again later.'
      });
    }

    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token refresh)
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${ENV.BACKEND_URL}/api/auth/refresh`, 
            { refresh_token: refreshToken },
            { withCredentials: true }
          );
          
          const { token, refresh_token } = response.data;
          
          // Update tokens in storage
          localStorage.setItem('auth_token', token);
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
          }
          
          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          // Retry the original request
          return AxiosJSON(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear auth state
        try {
          const { useAuthStore } = await import('@/pinia/auth.pinia');
          const authStore = useAuthStore();
          authStore.clearToken();
        } catch (e) {
          console.error('Failed to clear auth store:', e);
        }
        
        // Clear all auth-related storage
        ['auth_token', 'refresh_token', 'user_auth_token'].forEach(key => {
          localStorage.removeItem(key);
        });
        
        return Promise.reject({
          ...refreshError,  // Error: Spread types may only be created from object types
          isAuthError: true,
          message: 'Your session has expired. Please log in again.'
        });
      }
    }

    // Handle other error responses
    if (error.response) {
      // Validation errors (422)
      if (error.response.status === 422) {
        console.group('Validation Errors');
        console.log('Status:', error.response.status);
        console.log('Errors:', error.response.data?.errors);
        if (error.response.data?.debug) {
          console.log('Debug:', error.response.data.debug);
        }
        console.groupEnd();
      } 
      // Forbidden (403)
      else if (error.response.status === 403) {
        console.error('Access Forbidden:', {
          url: originalRequest?.url,
          message: error.response.data?.message || 'You do not have permission to perform this action'
        });
      }
      // Not Found (404)
      else if (error.response.status === 404) {
        console.error('Resource Not Found:', {
          url: originalRequest?.url,
          message: error.response.data?.message || 'The requested resource was not found'
        });
      }
      // Server Error (500+)
      else if (error.response.status >= 500) {
        console.error('Server Error:', {
          status: error.response.status,
          url: originalRequest?.url,
          message: error.response.data?.message || 'An unexpected server error occurred'
        });
      }
      
      // Add error type for easier handling
      error.isApiError = true;
      error.statusCode = error.response.status;
    } 
    // Network errors (no response)
    else if (error.request) {
      console.error('Network Error:', {
        message: 'No response received from server',
        url: originalRequest?.url,
        method: originalRequest?.method
      });
      
      error.isNetworkError = true;
      error.message = 'Unable to connect to the server. Please check your internet connection.';
    } 
    // Request setup errors
    else {
      console.error('Request Setup Error:', error.message);
      error.isRequestError = true;
    }

    return Promise.reject(error);
  }
);

// Export the setup function for app initialization
export { setupCorsPreflight };

export default AxiosJSON