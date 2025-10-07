// Utility function to determine if we're in production environment
export const isProductionEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return window.location.hostname.includes('vercel.app') || 
         window.location.hostname === 'www.momtabare.com' ||
         window.location.hostname === 'momtabare.com'
}

// Helper function to get the correct API URL for the current environment
export const getApiUrl = (endpoint: string, baseUrl?: string): string => {
  const isProduction = isProductionEnvironment()
  
  // Remove leading slashes to prevent double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  if (isProduction) {
    // For production, check if endpoint already has /api/
    if (cleanEndpoint.startsWith('api/')) {
      return `/${cleanEndpoint}`
    }
    return `/api/${cleanEndpoint}`
  } else {
    // For development, use the full URL
    const base = baseUrl || 'http://localhost:8000'
    return `${base}${base.endsWith('/') ? '' : '/'}${cleanEndpoint}`
  }
}
