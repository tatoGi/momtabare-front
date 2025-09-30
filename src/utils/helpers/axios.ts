// src/utils/helpers/axios.ts
import axios, { 
  AxiosError, 
  AxiosResponse, 
  InternalAxiosRequestConfig
} from 'axios';
import { ENV } from '../config/env';
import { getCurrentLocale } from '@/services/user';

// Normalize baseURL for local development to avoid accidental HTTPS on 127.0.0.1
let normalizedBaseUrl = ENV.BACKEND_URL;
try {
  const isDev = import.meta.env?.DEV;
  const isLocal127 = typeof window !== 'undefined' && window.location.hostname === '127.0.0.1';
  if (isDev && isLocal127 && normalizedBaseUrl.startsWith('https://127.0.0.1')) {
    normalizedBaseUrl = normalizedBaseUrl.replace('https://', 'http://');
    console.warn('Adjusted backend URL for dev to HTTP:', normalizedBaseUrl);
  }
} catch {}

const AxiosJSON = axios.create({
  baseURL: normalizedBaseUrl,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
})

// Configure CSRF token handling
AxiosJSON.defaults.withCredentials = true
AxiosJSON.defaults.xsrfCookieName = 'XSRF-TOKEN'
AxiosJSON.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'

// Single request interceptor
AxiosJSON.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token')
    const locale = getCurrentLocale()

    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      if (locale) {
        config.headers['Accept-Language'] = locale
        config.headers['X-Localization'] = locale
      }
      // CSRF token from cookie
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1]
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
      }
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Single response interceptor with refresh logic and no hard redirects
AxiosJSON.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response?.data?.debug) {
      console.log('Debug Information:', response.data.debug)
    }
    return response
  },
  async (error: any) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${ENV.BACKEND_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          const { token, refresh_token } = response.data
          localStorage.setItem('auth_token', token)
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token)
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return AxiosJSON(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Clear tokens without redirecting; UI/router can handle login modal if needed
        try {
          const { useAuthStore } = await import('@/pinia/auth.pinia')
          const authStore = useAuthStore()
          authStore.clearToken()
        } catch {}
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_auth_token')
        return Promise.reject(refreshError)
      }
    }

    // Non-401 error logging
    if (error.response) {
      if (error.response.status === 422) {
        console.group('Laravel Validation Errors:')
        console.log('Validation Errors:', error.response.data.errors)
        if (error.response.data.debug) {
          console.log('Debug Information:', error.response.data.debug)
        }
        console.groupEnd()
      } else {
        console.group('API Error Response:')
        console.log('Status:', error.response.status)
        console.log('Data:', error.response.data)
        console.log('Headers:', error.response.headers)
        if (error.response.data?.debug) {
          console.log('Debug Information:', error.response.data.debug)
        }
        console.groupEnd()
      }
    } else if (error.request) {
      console.error('Request Error:', error.request)
    } else {
      console.error('Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default AxiosJSON