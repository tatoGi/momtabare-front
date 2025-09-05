import axios from 'axios'
import { ENV } from '../config/env'
import { getCurrentLocale } from '@/services/user'

// Function to get CSRF token from cookies
export function getCsrfToken(): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split('; XSRF-TOKEN=')
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

// Function to ensure CSRF token is available
export async function ensureCsrfToken(): Promise<void> {
  const token = getCsrfToken()
  if (!token) {
    try {
      await axios.get(`${ENV.BACKEND_URL}/sanctum/csrf-cookie`, {
        withCredentials: true
        })
    } catch (error) {
      console.error('Failed to get CSRF token:', error)
      throw error
    }
  }
}

// Create Axios instance with base configuration
const AxiosJSON = axios.create({
  baseURL: ENV.BACKEND_URL,
  withCredentials: false, // Disable for token-based auth
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Request interceptor to add auth token
AxiosJSON.interceptors.request.use(
  (config) => {
    // Add locale to all requests
    const locale = getCurrentLocale()
    config.headers['X-Localization'] = locale
    
    // Add auth token if exists
    const token = localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      console.log('Added auth token to request:', config.url)
    } else {
      console.warn('No auth token found for request:', config.url)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle 401 Unauthorized
AxiosJSON.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear any invalid tokens
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_auth_token')
      
      // Redirect to login or handle as needed
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default AxiosJSON
