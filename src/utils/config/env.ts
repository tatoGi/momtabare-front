// Environment detection
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
const isProductionDomain = typeof window !== 'undefined' && window.location.hostname === 'momtabare.com';

// Get the appropriate backend URL based on environment
const getBackendUrl = (): string => {
  // Production environment with custom domain
  if (isProduction && isProductionDomain) {
    return '/api'; // Uses Vercel rewrite
  }
  
  // Vercel preview environment
  if (isVercel) {
    return 'https://admin.momtabare.com';
  }

  // Development environment
  let devUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  
  // Normalize development URL
  if (isDevelopment) {
    // Remove /api suffix if present in development URL
    if (devUrl.endsWith('/api')) {
      devUrl = devUrl.replace('/api', '');
      console.warn('Removed /api suffix from development backend URL:', devUrl);
    }
    
    // Normalize: avoid HTTPS on 127.0.0.1 in dev which causes ERR_CONNECTION_CLOSED
    const isLocal127 = typeof window !== 'undefined' && window.location.hostname === '127.0.0.1';
    if (isLocal127 && devUrl.startsWith('https://127.0.0.1')) {
      devUrl = devUrl.replace('https://', 'http://');
      console.warn('Adjusted dev backend URL to HTTP:', devUrl);
    }
  }
  
  console.log('🔧 Using backend URL:', devUrl);
  return devUrl;
};

// Environment configuration
export const ENV = {
  // Backend API base URL
  BACKEND_URL: getBackendUrl(),
  
  // API endpoints with locale support
  API_BASE_URL: getBackendUrl(),
  
  // Asset URLs (for images, files, etc.)
  ASSET_URL: getBackendUrl(),
  
  // Environment flags
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: isDevelopment,
  IS_VERCEL: isVercel,
  IS_PRODUCTION_DOMAIN: isProductionDomain,
  
  // Default locale
  DEFAULT_LOCALE: 'ka', // Georgian
  
  // Helper function to get full API URL
  getApiUrl: (endpoint: string): string => {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${ENV.BACKEND_URL}/api/${cleanEndpoint}`;
  },
  
  // Helper to get pages URL
  getPagesUrl: (): string => {
    return `${ENV.BACKEND_URL}/api/pages`;
  }
} as const;

// Export getAssetUrl as a standalone function for easier imports
export const getAssetUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${ENV.ASSET_URL}${cleanPath ? '/' + cleanPath : ''}`;
};

// Log environment info for debugging
console.log('🌐 Environment Configuration:', {
  BACKEND_URL: ENV.BACKEND_URL,
  NODE_ENV: import.meta.env.MODE,
  isProduction,
  isDevelopment,
  isVercel,
  isProductionDomain
});

// Helper function to get localized API URL
export const getLocalizedApiUrl = (endpoint: string, locale: string = 'ka'): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Get the base API URL
  const baseUrl = getBackendUrl();
  
  // Handle API URL construction based on the environment
  if (isProduction && isProductionDomain) {
    // In production with custom domain, use /api prefix
    return `/api/${locale}/${cleanEndpoint}`;
  } else if (isVercel) {
    // In Vercel preview/development, use full URL
    return `${baseUrl}/api/${locale}/${cleanEndpoint}`;
  } else {
    // In local development
    return `${baseUrl}/api/${locale}/${cleanEndpoint}`;
  }
};

// Environment info for debugging
export const getEnvironmentInfo = () => {
  return {
    isProduction,
    isDevelopment,
    isVercel,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    backendUrl: getBackendUrl()
  };
};

// Helper function to get backend URL with protocol fallback
export const getBackendUrlWithFallback = (preferHttps: boolean = true): string => {
  const backendUrl = getBackendUrl();
  if (backendUrl.startsWith('http')) {
    return backendUrl;
  }
  const domain = 'admin.momtabare.com';
  return preferHttps ? `https://${domain}` : `http://${domain}`;
};
