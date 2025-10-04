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
  
  if (isProduction) {
    // Use relative URL for production (Vercel proxy)
    return `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`
  } else {
    // Use full URL for development
    const base = baseUrl || 'http://localhost:8000'
    return `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  }
}
