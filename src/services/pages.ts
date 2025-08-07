import axios from 'axios'
import { getLocalizedApiUrl } from '@/utils/config/env'
import type { IPage, INavigationItem, IPageTranslation, IBanner, IBannerTranslation } from '@/ts/models/page.types'

// Create axios instance for pages (without /api prefix)
const PagesAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Cache for pages data to avoid multiple API calls
let cachedPages: IPage[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Get all pages data (contains all translations)
export async function getAllPages(): Promise<IPage[] | null> {
  // Check if we have valid cached data
  const now = Date.now()
  if (cachedPages && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📋 Using cached pages data')
    return cachedPages
  }

  try {
    // Fetch from either /en/pages or /ka/pages - both should return same data with all translations
    const endpoint = '/en/pages' // Use English endpoint as default
    
    const response = await PagesAxios.get(endpoint)
    
    // Handle different response structures
    const data = response.data
    const pages = data.data || data.pages || (Array.isArray(data) ? data : [])
    console.log('✅ Pages loaded successfully:', pages.length, 'items')
    
    // Cache the results
    cachedPages = pages
    cacheTimestamp = now
    
    return pages
  } catch (error) {
    console.error('❌ Error fetching pages:', error instanceof Error ? error.message : error)
    return null
  }
}

// Get pages data with locale support (now processes translations client-side)
export async function getPages(_locale: string = 'en'): Promise<IPage[] | null> {
  const allPages = await getAllPages()
  return allPages // Return all pages, translation selection happens in convertPagesToNavigation
}

// Get localized API data
export async function getLocalizedData(endpoint: string, locale: string = 'ka') {
  try {
    // This will call: http://system.momtabare.com/ka/{endpoint}
    const url = getLocalizedApiUrl(endpoint, locale)
    const response = await fetch(url)
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
      path: isGeorgian ? '/მთავარი' : '/home',
      active: true
    },
    {
      id: 2,
      title: isGeorgian ? 'ბლოგი' : 'Blog',
      slug: isGeorgian ? 'ბლოგი' : 'blog',
      path: isGeorgian ? '/ბლოგი' : '/blog',
      active: true
    },
    {
      id: 3,
      title: isGeorgian ? 'მარშუტები' : 'Routes',
      slug: isGeorgian ? 'მარშუტები' : 'routes',
      path: isGeorgian ? '/მარშუტები' : '/routes',
      active: true
    }
    // Removed FAQ from fallback navigation
  ]
}

// Convert pages to navigation items
export function convertPagesToNavigation(pages: IPage[], locale: string = 'ka'): INavigationItem[] {
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
      navItem.children = children.map(child => createNavigationItem(child, locale))
    }
    
    navigationItems.push(navItem)
  })
  
  return navigationItems
}

// Create navigation item from page
function createNavigationItem(page: IPage, locale: string): INavigationItem {
  const translation = getPageTranslation(page, locale)
  
  return {
    id: page.id,
    title: translation.title, // Use localized title for display
    slug: translation.slug,   // Keep localized slug for reference
    path: `/${translation.slug}`, // Use current locale slug for routing
    active: page.active === 1,
    icon: translation.icon || undefined,
    parent_id: page.parent_id
  }
}

// Get page translation for specific locale
export function getPageTranslation(page: IPage, locale: string): IPageTranslation {
  // Try to find translation for requested locale
  const translation = page.translations.find(t => t.locale === locale)
  
  // Fallback to English if requested locale not found
  if (!translation) {
    const englishTranslation = page.translations.find(t => t.locale === 'en')
    if (englishTranslation) return englishTranslation
  }
  
  // Fallback to first available translation
  return translation || page.translations[0]
}

// Get page by slug
export async function getPageBySlug(slug: string, locale: string = 'ka'): Promise<IPage | null> {
  try {
    const pages = await getPages(locale)
    if (!pages) return null
    
    return pages.find(page => {
      const translation = getPageTranslation(page, locale)
      return translation.slug === slug
    }) || null
  } catch (error) {
    console.error('Error fetching page by slug:', error)
    return null
  }
}

// Get localized content by slug
export async function getContent(slug: string, locale: string = 'ka') {
  return getPageBySlug(slug, locale)
}

// Get home page data with banners
export async function getHomePageData(locale: string = 'ka'): Promise<IPage | null> {
  try {
    const homeSlug = locale === 'ka' ? 'მთავარი' : 'home'
    return await getPageBySlug(homeSlug, locale)
  } catch (error) {
    console.error('Error fetching home page data:', error)
    return null
  }
}

// Get banner translation for specific locale
export function getBannerTranslation(banner: IBanner, locale: string): IBannerTranslation {
  // Try to find translation for requested locale
  const translation = banner.translations.find(t => t.locale === locale)
  
  // Fallback to English if requested locale not found
  if (!translation) {
    const englishTranslation = banner.translations.find(t => t.locale === 'en')
    if (englishTranslation) return englishTranslation
  }
  
  // Fallback to first available translation
  return translation || banner.translations[0]
}
