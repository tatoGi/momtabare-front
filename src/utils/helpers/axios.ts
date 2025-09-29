import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ENV } from '../config/env'
import { getCurrentLocale } from '@/services/user'

// Create Axios instance configured for JSON APIs
const AxiosJSON = axios.create({
  baseURL: ENV.BACKEND_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// CSRF defaults (helpful for Laravel/Sanctum setups)
AxiosJSON.defaults.withCredentials = true
AxiosJSON.defaults.xsrfCookieName = 'XSRF-TOKEN'
AxiosJSON.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token')
}

// Request interceptor: attach Authorization and locale
AxiosJSON.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.url?.includes('/auth/')) {
      return config
    }

    const token = getAuthToken()
    const locale = getCurrentLocale()

    if (config.headers) {
      config.headers = {
        ...(config.headers as Record<string, unknown>),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(locale ? { 'Accept-Language': locale, 'X-Localization': locale } : {})
      } as typeof config.headers
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Response interceptor: debug log and 401 refresh handling
AxiosJSON.interceptors.response.use(
  (response: AxiosResponse) => {
    if ((response as any)?.data?.debug) {
      console.log('Debug Information:', (response as any).data.debug)
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (!originalRequest) {
      return Promise.reject(error)
    }

    if (originalRequest._retry || error.response?.status !== 401 || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await axios.post(
        `${ENV.BACKEND_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        {
          withCredentials: true,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      const { token, refresh_token } = (response as any).data || {}

      if (token) {
        localStorage.setItem('auth_token', token)
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token)
        }

        if (originalRequest.headers) {
          originalRequest.headers = {
            ...(originalRequest.headers as Record<string, unknown>),
            Authorization: `Bearer ${token}`
          } as typeof originalRequest.headers
        }

        return AxiosJSON(originalRequest)
      }

      throw new Error('Invalid token in response')
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError)

      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_auth_token')

      try {
        // Remove any default Authorization header
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (AxiosJSON.defaults.headers as any).common['Authorization']
      } catch {}

      if (window.location.pathname !== '/login') {
        setTimeout(() => {
          window.location.href = '/login?session_expired=true'
        }, 100)
      }

      return Promise.reject(refreshError)
    }
  }
)

// Error logging interceptor
AxiosJSON.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    interface ApiErrorResponse {
      errors?: Record<string, string[]>
      debug?: any
      [key: string]: any
    }

    if (error.response) {
      const responseData = error.response.data as ApiErrorResponse

      console.group('API Error Response:')
      console.log('Status:', error.response.status)
      console.log('Data:', responseData)
      console.log('Headers:', error.response.headers)

      if (error.response.status === 422 && responseData?.errors) {
        console.log('Validation Errors:', responseData.errors)
      }

      if (responseData?.debug) {
        console.log('Debug Information:', responseData.debug)
      }

      console.groupEnd()
    } else if ((error as any).request) {
      console.error('Request Error:', (error as any).request)
    } else {
      console.error('Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default AxiosJSON
