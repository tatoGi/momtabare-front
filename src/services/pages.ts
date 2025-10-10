import axios from 'axios'
import { getLocalizedApiUrl } from '@/utils/config/env'
import { ENV } from '@/utils/config/env'
import AxiosJSON from '@/utils/helpers/axios'
import { useAppStore } from '@/pinia/app.pinia'
import { ELanguages } from '@/ts/pinia/app.types'
import { syncLocale } from '@/services/languages'

import type { IPage, INavigationItem, IPageTranslation, IBanner, IBannerTranslation } from '@/ts/models/page.types'


// Create axios instance for pages API
const PagesAxios = axios.create({
  baseURL: ENV.BACKEND_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
    
  },
  timeout: 30000, // 30 second timeout (increased from 10s)
})

// Cache for pages data per-locale to avoid multiple API calls
type PagesCacheEntry = { pages: IPage[]; timestamp: number }
const pagesCache: Record<string, PagesCacheEntry> = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Resolve current locale from store with safe fallback
function getCurrentLocale(): string {
  try {
    const appStore = useAppStore()
    return appStore.language === ELanguages.KA ? 'ka' : 'en'
  } catch {
    return 'en'
  }
}

// Get all pages data for a locale (backend returns all translations; we select based on locale)
export async function getAllPages(locale?: string): Promise<IPage[] | null> {
  const targetLocale = (locale || getCurrentLocale() || 'en').toLowerCase()
  const cacheKey = targetLocale
  const now = Date.now()
  const cacheEntry = pagesCache[cacheKey]
  
  
  // Log cache hit and return if valid
  if (cacheEntry && (now - cacheEntry.timestamp) < CACHE_DURATION) {
    return cacheEntry.pages
  }
  
  // Use cache if available and not expired
  if (cacheEntry && (now - cacheEntry.timestamp) < CACHE_DURATION) {
    return cacheEntry.pages
  }

  // Retry logic for network issues
  const maxRetries = 3
  let lastError: any = null
  
  // Ensure backend session/app locale matches before fetching pages
  try { await syncLocale(targetLocale) } catch {}

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Fetch from /api/pages - locale is sent in headers
      const endpoint = '/api/pages'
      
      const response = await PagesAxios.get(endpoint, {
        headers: {
          'Accept-Language': targetLocale,
          'X-Localization': targetLocale,
          'X-Language': targetLocale
        }
      })
      
      const data = response.data
      const pages = data.data || data.pages || (Array.isArray(data) ? data : [])
      
      if (pages.length > 0) {
        
      }
    
      // Cache the pages for this locale
      pagesCache[cacheKey] = { pages, timestamp: now }
      
      return pages
    } catch (error) {
      lastError = error
      console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed for locale ${targetLocale}:`, error instanceof Error ? error.message : String(error))
      
      // If this isn't the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const waitTime = attempt * 2000 // 2s, 4s, 6s
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  // All attempts failed
  console.error('❌ Failed to load pages after retries:', lastError)
  // Return cached data for this locale if available, even if expired
  if (pagesCache[cacheKey]) {
    return pagesCache[cacheKey].pages
  }
  
  return null
}

// Clear cached pages for a specific locale or all locales
export function clearPagesCache(locale?: string): void {
  if (!locale) {
    Object.keys(pagesCache).forEach(k => delete pagesCache[k])
    return
  }
  const key = locale.toLowerCase()
  if (pagesCache[key]) delete pagesCache[key]
}

// Get pages data with locale support (now processes translations client-side)
export async function getPages(locale: string = 'en'): Promise<IPage[] | null> {
  const allPages = await getAllPages(locale)
  return allPages // Return all pages, translation selection happens in convertPagesToNavigation
}

// Get localized API data
export async function getLocalizedData(endpoint: string, locale: string = 'ka') {
  try {
    // This will call: /api/{endpoint} with locale in headers
    const url = getLocalizedApiUrl(endpoint)
    const response = await fetch(url, {
      headers: {
        'Accept-Language': locale,
        'X-Localization': locale,
        'X-Language': locale,
      }
    })
    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    return null
  }
}

// Get navigation data from pages
export async function getNavigation(locale: string = 'ka'): Promise<INavigationItem[] | null> {
  try {
    const pages = await getPages(locale)
    
    if (!pages || pages.length === 0) {
      return getFallbackNavigation(locale)
    }
    
    const navigation = convertPagesToNavigation(pages, locale)
    return navigation.length > 0 ? navigation : getFallbackNavigation(locale)
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return getFallbackNavigation(locale)
  }
}

// Fallback navigation when API fails
function getFallbackNavigation(locale: string): INavigationItem[] {
  const isGeorgian = locale === 'ka'
  
  return [
    {
      id: 1,
      title: isGeorgian ? 'მთავარი' : 'Home',
      slug: isGeorgian ? 'მთავარი' : 'home',
      path: '/home', // Always use English path for routing
      active: true
    },
    {
      id: 2,
      title: isGeorgian ? 'ბლოგი' : 'Blog',
      slug: isGeorgian ? 'ბლოგი' : 'blog',
      path: '/blog', // Always use English path for routing
      active: true
    },
    {
      id: 3,
      title: isGeorgian ? 'მარშუტები' : 'Routes',
      slug: isGeorgian ? 'მარშუტები' : 'routes',
      path: '/routes', // Always use English path for routing
      active: true
    }
    // Removed FAQ from fallback navigation
  ]
}

// Convert pages to navigation items
export function convertPagesToNavigation(pages: IPage[], locale: string): INavigationItem[] {
 
  
  const navigationItems: INavigationItem[] = []
  
  // Filter active pages and sort by sort field or id
  const activePages = pages
    .filter(page => page.active === 1)
    .sort((a, b) => (a.sort || a.id) - (b.sort || b.id))
  
  
  // Group pages by parent_id
  const pagesByParent = activePages.reduce((acc, page) => {
    const parentId = page.parent_id || 'root'
    if (!acc[parentId]) acc[parentId] = []
    acc[parentId].push(page)
    return acc
  }, {} as Record<string | number, IPage[]>)
  
  // Build navigation tree starting with root pages
  const rootPages = pagesByParent['root'] || []
  
  rootPages.forEach(page => {
    const navItem = createNavigationItem(page, locale)
    
    // Add children if they exist
    const children = pagesByParent[page.id]
    if (children && children.length > 0) {
      navItem.children = children.map(child => {
        const childNavItem = createNavigationItem(child, locale)
        return childNavItem
      })
    }
    
    navigationItems.push(navItem)
  })
  
  return navigationItems
}

// Create navigation item from page
function createNavigationItem(page: IPage, locale: string): INavigationItem {
  const translation = getPageTranslation(page, locale)
  const englishTranslation = getPageTranslation(page, 'en') // Always get English for routing
  
 
  return {
    id: page.id,
    title: translation.title, // Use localized title from backend translation
    slug: translation.slug,   // Keep localized slug for reference
    path: `/${englishTranslation.slug}`, // Always use English slug for routing
    active: page.active === 1,
    icon: translation.icon || undefined,
    parent_id: page.parent_id
  }
}

// Get page translation for specific locale
export function getPageTranslation(page: IPage, locale: string): IPageTranslation {
  // Normalize requested locale
  const requested = (locale || 'en').toLowerCase()
  const primary = requested.slice(0, 2)


  // 1) Exact match
  let found = page.translations.find(t => (t.locale || '').toLowerCase() === requested)
  if (found) {
    return found
  }

  // 2) Primary subtag match (e.g., ka_GE -> ka)
  found = page.translations.find(t => (t.locale || '').toLowerCase().startsWith(primary))
  if (found) {
    return found
  }

  // 2b) Common alias: some backends use 'ge' instead of 'ka'
  if (primary === 'ka') {
    found = page.translations.find(t => (t.locale || '').toLowerCase().startsWith('ge'))
    if (found) {
      return found
    }
  }

  // 3) English fallback
  found = page.translations.find(t => (t.locale || '').toLowerCase().startsWith('en'))
  if (found) {
    return found
  }

  // 4) First available translation
  return page.translations[0]
}

// Get page by slug
export async function getPageBySlug(slug: string, locale: string = 'ka'): Promise<IPage | null> {
  try {
    const pages = await getPages(locale)
    if (!pages) {
      console.warn('No pages returned from getPages')
      return null
    }
  
    // Normalize the search slug to lowercase for case-insensitive comparison
    const normalizedSearchSlug = slug.toLowerCase()
    
    const foundPage = pages.find(page => {
      const translation = getPageTranslation(page, locale)
      if (!translation?.slug) return false
      
      // Compare normalized slugs (case-insensitive)
      const matches = translation.slug.toLowerCase() === normalizedSearchSlug
      
      if (matches) {
      
      }
      return matches
    })
    
    if (!foundPage) {
      console.warn(`❌ No page found with slug: ${slug} for locale: ${locale}`)
     
    }
    
    return foundPage || null
  } catch (error) {
    console.error('Error fetching page by slug:', error)
    return null
  }
}

// Get localized content by slug
export async function getContent(slug: string, locale: string = 'ka') {
  return getPageBySlug(slug, locale)
}
// Get blog posts for homepage with fallback and shorter per-attempt timeout
export async function getBlogPosts(locale: string = 'ka'): Promise<any> {
  try {
    const response = await AxiosJSON.get('/api/blog-posts', { 
      timeout: 12000,
      headers: {
        'Accept-Language': locale,
        'X-Localization': locale,
        'X-Language': locale,
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return null
  }
}

// Get home page data with banners
export async function getHomePageData(locale?: string): Promise<IPage | null> {
  if (!locale) {
    const appStore = useAppStore()
    locale = appStore.language === ELanguages.KA ? 'ka' : 'en'
  }
  
  try {
    await syncLocale(locale)
    
    // Try both 'home' and 'Home' to handle case sensitivity
    const homeSlugs = locale === 'ka' ? ['მთავარი'] : ['home', 'Home']
    
    for (const slug of homeSlugs) {
      const homePage = await getPageBySlug(slug, locale)
      
      if (homePage) {
      
        
        return homePage
      }
      
    }
    
    console.warn(`⚠️ No home page found for locale ${locale} with any of these slugs: ${homeSlugs.join(', ')}`)
    return null
  } catch (error) {
    console.error('Error in getHomePageData:', error)
    return null
  }
}

// Get banner translation for specific locale
export function getBannerTranslation(banner: IBanner, locale: string): IBannerTranslation {
  const now = new Date().toISOString()
  const defaultTranslation: Omit<IBannerTranslation, 'id' | 'banner_id'> = {
    locale: locale,
    title: 'No translation available',
    slug: '',
    desc: '',
    created_at: now,
    updated_at: now
  }

  // Ensure translations array exists
  if (!banner.translations?.length) {
    console.warn('Banner has no translations:', banner.id)
    return {
      id: 0,
      banner_id: banner.id,
      ...defaultTranslation
    }
  }
  
  // Try to find translation for requested locale
  const translation = banner.translations.find(t => t.locale === locale)
  if (translation) return translation
  
  // Fallback to English if requested locale not found
  if (locale !== 'en') {
    const englishTranslation = banner.translations.find(t => t.locale === 'en')
    if (englishTranslation) return englishTranslation
  }
  
  // Fallback to first available translation
  if (banner.translations.length > 0) {
    return banner.translations[0]
  }
  
  // Last resort fallback - create a translation from banner data
  return {
    id: 0,
    banner_id: banner.id,
    locale: locale,
    title: banner.title || 'Untitled Banner',
    slug: banner.slug || '',
    desc: banner.desc || '',
    created_at: banner.created_at || now,
    updated_at: banner.updated_at || now
  }
}
