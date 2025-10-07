// Environment detection
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
const isProductionDomain = typeof window !== 'undefined' && 
  (window.location.hostname === 'momtabare.com' || window.location.hostname === 'www.momtabare.com');

// Get the appropriate backend URL based on environment
const getBackendUrl = (): string => {
  // Always use full URL in production to avoid CORS issues
  if (isProduction || isVercel || isProductionDomain || window.location.hostname === 'www.momtabare.com') {
    // For production, use the Vercel proxy to avoid CORS issues
    return '';
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
  return devUrl;
};

// Helper function to get API URL with proper domain handling
export const getApiUrl = (endpoint: string): string => {
  let baseUrl = getBackendUrl();
  
  // For production, use the Vercel proxy
  if (isProduction || isVercel || isProductionDomain) {
    return `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  }
  
  // Development environment
  return `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

// Helper to get production backend base for assets
const getProductionBackendBase = (): string => {
  const configured = (import.meta as any).env?.VITE_BACKEND_URL_PRODUCTION as string | undefined
  if (configured && typeof configured === 'string' && configured.length > 0) {
    return configured.replace(/\/$/, '')
  }
  return 'https://admin.momtabare.com'
}

// Environment configuration
export const ENV = {
  // Backend API base URL
  BACKEND_URL: getBackendUrl(),
  
  // API endpoints with locale support
  API_BASE_URL: getBackendUrl(),
  
  // Asset URLs (for images, files, etc.)
  ASSET_URL: (isProduction || isVercel || isProductionDomain) ? getProductionBackendBase() : getBackendUrl(),
  
  // Environment flags
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: isDevelopment,
  IS_VERCEL: isVercel,
  
  // Default locale
  DEFAULT_LOCALE: 'ka' // Georgian
} as const;

// Export getAssetUrl as a standalone function for easier imports
export const getAssetUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = (isProduction || isVercel || isProductionDomain) ? getProductionBackendBase() : getBackendUrl();
  return `${base}${cleanPath ? '/' + cleanPath : ''}`;
};



// Clean up any double slashes in URLs
const cleanUrl = (url: string): string => {
  return url.replace(/([^:]\/)\/+/g, '$1');
};

// Update all API calls to use the cleaned URL
export const getLocalizedApiUrl = (endpoint: string): string => {
  // For production, use the Vercel proxy
  if (isProduction || isVercel || isProductionDomain) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `/api/${cleanEndpoint}`;
  }
  
  // Development environment
  const base = getApiUrl('');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return cleanUrl(`${base}api/${cleanEndpoint}`);
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
