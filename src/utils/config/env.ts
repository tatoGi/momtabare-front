// Environment detection
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;
const isProductionDomain = typeof window !== 'undefined' && 
  (window.location.hostname === 'momtabare.com' || window.location.hostname === 'www.momtabare.com');
const isStaticHosting = typeof window !== 'undefined' && 
  (window.location.hostname === 'momtabare.com' || window.location.hostname === 'www.momtabare.com') &&
  !window.location.hostname.includes('vercel.app');
const isLiteSpeedHosting = isStaticHosting; // Assume static hosting is LiteSpeed
 

// Get the appropriate backend URL based on environment
const getBackendUrl = (): string => {
  // For LiteSpeed hosting, use direct backend URL since proxy is not supported
  if (isStaticHosting) {
    return 'https://admin.momtabare.com';
  }
  
  // For other production environments
  if (isProduction || isProductionDomain) {
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
  
  // For static hosting (Apache), use relative path for .htaccess proxy
  if (isStaticHosting) {
    return `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  }

  // For other production environments
  if (isProduction || isProductionDomain) {
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
  ASSET_URL: (isProduction ||  isProductionDomain || isStaticHosting) ? getProductionBackendBase() : getBackendUrl(),
  
  // Environment flags
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: isDevelopment,
  
  // Default locale
  DEFAULT_LOCALE: 'ka' // Georgian
} as const;

// Clean up any double slashes in URLs (except in protocol like https://)
const cleanUrl = (url: string): string => {
  // First, fix malformed protocols like https:/ to https://
  let fixedUrl = url.replace(/^(https?):\/(?!\/)/, '$1://');
  
  // Then preserve the protocol, clean double slashes, and restore protocol
  const protocolMatch = fixedUrl.match(/^(https?:\/\/)/);
  if (protocolMatch) {
    const protocol = protocolMatch[1];
    const restOfUrl = fixedUrl.substring(protocol.length);
    // Remove any double slashes in the rest of the URL
    const cleanedRest = restOfUrl.replace(/\/+/g, '/');
    return protocol + cleanedRest;
  }
  // If no protocol, just clean double slashes
  return fixedUrl.replace(/\/+/g, '/');
};

// Export getAssetUrl as a standalone function for easier imports
export const getAssetUrl = (path: string): string => {
  if (!path) return '';
  
  // If the path starts with http, clean it and return
  if (path.startsWith('http')) {
    return cleanUrl(path);
  }
  
  // Clean the path to remove leading slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Get the base URL
  const base = (isProduction || isProductionDomain || isStaticHosting) ? getProductionBackendBase() : getBackendUrl();
  
  // Construct the full URL
  const fullUrl = `${base}${cleanPath ? '/' + cleanPath : ''}`;
  
  // Clean up any double slashes in the result
  return cleanUrl(fullUrl);
};

// Update all API calls to use the cleaned URL
export const getLocalizedApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // For LiteSpeed hosting, use direct backend URL since proxy is not supported
  if (isLiteSpeedHosting) {
    return `https://admin.momtabare.com/api/${cleanEndpoint}`;
  }
  
  // For static hosting (Apache), use relative path for .htaccess proxy
  if (isStaticHosting) {
    return `/api/${cleanEndpoint}`;
  }
  
  // For other production environments
  if (isProduction || isProductionDomain) {
    return `/api/${cleanEndpoint}`;
  }
  
  // Development environment - use the backend URL directly with /api/
  const backendUrl = getBackendUrl();
  return cleanUrl(`${backendUrl}/api/${cleanEndpoint}`);
};

// Environment info for debugging
export const getEnvironmentInfo = () => {
  const info = {
    isProduction,
    isDevelopment,
    isProductionDomain,
    isStaticHosting,
    isLiteSpeedHosting,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    backendUrl: getBackendUrl()
  };
  
  // Log environment info in production for debugging
  if (typeof window !== 'undefined' && window.location.hostname === 'momtabare.com') {
    console.log('🔍 Environment Debug Info:', info);
    console.log('🔍 API URL Test - pages:', getLocalizedApiUrl('pages'));
    console.log('🔍 API URL Test - languages:', getLocalizedApiUrl('languages'));
    console.log('🔍 Hosting Type:', isLiteSpeedHosting ? 'LiteSpeed' : 'Apache');
  }
  
  return info;
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

/**
 * Get the correct storage URL for images and other assets
 * Handles both local development and production environments
 */
export const getStorageUrl = (path: string): string => {
  // Remove any leading slashes from the path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In production, use the production storage URL
  if (isProduction || isProductionDomain || isStaticHosting) {
    // If the path already has a full URL, return it as is
    if (path.startsWith('http')) {
      return path;
    }
    return `https://admin.momtabare.com/storage/${cleanPath}`;
  }
  
  // In development, use the local backend URL
  const backendUrl = getBackendUrl();
  return `${backendUrl}/storage/${cleanPath}`;
};
