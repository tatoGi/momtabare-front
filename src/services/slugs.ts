import { getAllPages, getPageTranslation } from './pages'
import type { IPage } from '@/ts/models/page.types'

// Slug mapping cache
let slugMappingCache: Map<string, string> | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get slug mapping from backend pages - fully dynamic
 */
async function getSlugMapping(): Promise<Map<string, string>> {
  // Check if we have valid cached data
  const now = Date.now()
  if (slugMappingCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return slugMappingCache
  }

  const mapping = new Map<string, string>()
  
  try {
    // Get dynamic mappings from backend
    const pages = await getAllPages()
    
    if (pages && pages.length > 0) {
      // Build mapping from backend pages
      pages.forEach((page: IPage) => {
        const georgianTranslation = getPageTranslation(page, 'ka')
        const englishTranslation = getPageTranslation(page, 'en')
        
        // Map Georgian to English
        mapping.set(georgianTranslation.slug, englishTranslation.slug)
        // Map English to Georgian
        mapping.set(englishTranslation.slug, georgianTranslation.slug)
      })
      
      console.log('✅ Dynamic slug mappings loaded:', mapping.size / 2, 'pages')
    } else {
      console.warn('⚠️ No pages data available for slug mapping')
    }
  } catch (error) {
    console.error('❌ Failed to load dynamic slug mappings:', error)
  }
  
  // Cache the results
  slugMappingCache = mapping
  cacheTimestamp = now
  
  return mapping
}

/**
 * Convert Georgian slug to English slug
 */
export async function georgianToEnglishSlug(georgianSlug: string): Promise<string> {
  const mapping = await getSlugMapping()
  return mapping.get(georgianSlug) || georgianSlug
}

/**
 * Convert English slug to Georgian slug  
 */
export async function englishToGeorgianSlug(englishSlug: string): Promise<string> {
  const mapping = await getSlugMapping()
  return mapping.get(englishSlug) || englishSlug
}

/**
 * Check if a slug is Georgian
 */
export function isGeorgianSlug(slug: string): boolean {
  // Georgian characters range: \u10A0-\u10FF
  return /[\u10A0-\u10FF]/.test(slug)
}

/**
 * Get the opposite language slug
 */
export async function getOppositeSlug(slug: string): Promise<string> {
  if (isGeorgianSlug(slug)) {
    return await georgianToEnglishSlug(slug)
  } else {
    return await englishToGeorgianSlug(slug)
  }
}

/**
 * Get English route path for Vue Router
 */
export async function getEnglishRoutePath(path: string): Promise<string> {
  // Remove leading slash
  const slug = path.startsWith('/') ? path.slice(1) : path
  
  // If already English, return as is
  if (!isGeorgianSlug(slug)) {
    return path
  }
  
  // Convert Georgian slug to English
  const englishSlug = await georgianToEnglishSlug(slug)
  return `/${englishSlug}`
}

/**
 * Clear slug mapping cache (useful for testing or manual refresh)
 */
export function clearSlugCache(): void {
  slugMappingCache = null
  cacheTimestamp = 0
}
