// Get the appropriate backend URL based on environment
const getBackendUrl = (): string => {
  // In production, use production URL if available, otherwise fallback to regular URL
  if (import.meta.env.PROD && import.meta.env.VITE_BACKEND_URL_PRODUCTION) {
    return import.meta.env.VITE_BACKEND_URL_PRODUCTION
  }
  
  // For development or if production URL is not set, use regular URL
  return import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
}

// Environment configuration
export const ENV = {
  // Backend API base URL
  BACKEND_URL: getBackendUrl(),
  
  // API endpoints with locale support
  API_BASE_URL: `${getBackendUrl()}/api`,
  
  // Asset URLs (for images, files, etc.)
  ASSET_URL: getBackendUrl(),
  
  // Environment type
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Default locale
  DEFAULT_LOCALE: 'ka', // Georgian
} as const

// Helper function to get full asset URL
export const getAssetUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${ENV.ASSET_URL}/${cleanPath}`
}

// Helper function to get API URL with optional locale
export const getApiUrl = (endpoint: string, locale?: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  if (locale) {
    return `${ENV.BACKEND_URL}/${locale}/${cleanEndpoint}`
  }
  
  return `${ENV.API_BASE_URL}/${cleanEndpoint}`
}

// Helper function to get localized API URL
export const getLocalizedApiUrl = (endpoint: string, locale: string = ENV.DEFAULT_LOCALE): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${ENV.BACKEND_URL}/${locale}/${cleanEndpoint}`
}

// Helper function to get pages URL (as you mentioned /en/pages)
export const getPagesUrl = (locale: string = 'en'): string => {
  return `${ENV.BACKEND_URL}/${locale}/pages`
}
