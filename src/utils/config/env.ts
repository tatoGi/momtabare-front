// Environment detection
const isProduction = import.meta.env.PROD
const isDevelopment = import.meta.env.DEV
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')

// Get the appropriate backend URL based on environment
const getBackendUrl = (): string => {
  // Production environment (Vercel)
  if (isProduction) {
    const prodUrl = import.meta.env.VITE_BACKEND_URL_PRODUCTION || 'https://admin.momtabare.com'
    console.log('🌐 Production Mode - Using backend URL:', prodUrl)
    console.log('🔍 Environment variables:', {
      VITE_BACKEND_URL_PRODUCTION: import.meta.env.VITE_BACKEND_URL_PRODUCTION,
      PROD: import.meta.env.PROD,
      MODE: import.meta.env.MODE
    })
    return prodUrl
  }
  
  // Development environment (localhost)
  let devUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
  // Normalize: avoid HTTPS on 127.0.0.1 in dev which causes ERR_CONNECTION_CLOSED
  try {
    const isLocal127 = typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
    if (isDevelopment && isLocal127 && devUrl.startsWith('https://127.0.0.1')) {
      devUrl = devUrl.replace('https://', 'http://')
      console.warn('Adjusted dev backend URL to HTTP:', devUrl)
    }
  } catch {}
  return devUrl
}

// Environment info for debugging
export const getEnvironmentInfo = () => {
  return {
    isProduction,
    isDevelopment,
    isVercel,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    backendUrl: getBackendUrl()
  }
}

// Helper function to get backend URL with protocol fallback
export const getBackendUrlWithFallback = (preferHttps: boolean = true): string => {
  if (import.meta.env.PROD) {
    const domain = 'admin.momtabare.com'
    return preferHttps ? `https://${domain}` : `http://${domain}`
  }
  return import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
}

// Environment configuration
export const ENV = {
  // Backend API base URL
  BACKEND_URL: getBackendUrl(),
  
  // API endpoints with locale support
  API_BASE_URL: `${getBackendUrl()}`,
  
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
  return `${ENV.BACKEND_URL}/${locale}/api/${cleanEndpoint}`
}

// Helper function to get pages URL (as you mentioned /en/pages)
export const getPagesUrl = (locale: string = 'en'): string => {
  return `${ENV.BACKEND_URL}/${locale}/pages`
}
