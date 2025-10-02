import { API_ROUTES } from "@/config/api.routes"

/**
 * Builds a full API URL with localization support
 * @param path - The API path or route key (e.g., 'auth.register' or '/custom/path')
 * @param locale - The locale (e.g., 'en' or 'ka')
 * @param params - Optional parameters for dynamic routes
 * @returns Full API URL
 */
function buildApiUrl(
  path: string,
  locale: string = 'en',
  params: Record<string, string | number> = {}
): string {
  // Build a relative locale-prefixed path; Axios baseURL will prepend the host
  const localizedPath = (endpoint: string, loc: string) => {
    const clean = endpoint.replace(/^\//, '')
    return `/${loc}/${clean}`
  }

  // Handle direct paths (starting with /)
  if (path.startsWith('/')) {
    return localizedPath(path, locale)
  }

  // Handle route keys (e.g., 'auth.register')
  const pathParts = path.split('.')
  let route: any = { ...API_ROUTES }
  
  try {
    for (const part of pathParts) {
      if (route[part] === undefined) {
        throw new Error(`Route ${path} not found in API_ROUTES`)
      }
      route = route[part]
    }

    // Handle function routes
    if (typeof route === 'function') {
      const dynamicPath = route(params)
      return localizedPath(dynamicPath, locale)
    }

    // Handle string routes
    return localizedPath(route, locale)
  } catch (error) {
    console.error('Error building API URL:', error)
    return ''
  }
}

export { buildApiUrl }
