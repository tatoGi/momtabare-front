import axios from 'axios'
import type { IBackendCategory, ICategoryDisplay, ICategoryTranslation } from '@/ts/models/category.types'
import { getLocalizedApiUrl } from '@/utils/config/env'
import { useAppStore } from '@/pinia/app.pinia'
import { ELanguages } from '@/ts/pinia/app.types'

// Fetch categories from backend API
export async function getBackendCategories(locale?: string): Promise<IBackendCategory[]> {
  try {
    const currentLocale = locale || getCurrentLocale()
    const response = await axios.get(getLocalizedApiUrl('categories'), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': currentLocale,
        'X-Localization': currentLocale
      },
      withCredentials: true
    })
    
    return response.data?.data || response.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Get category translation for specific locale
export function getCategoryTranslation(category: IBackendCategory, locale?: string): ICategoryTranslation {
  const currentLocale = locale || getCurrentLocale()
  const normalizedLocale = currentLocale?.toLowerCase() === 'ka' ? 'ka' : 'en'
  
  const translation = category.translations.find(t => t.locale === normalizedLocale)
  if (translation) return translation
  
  const englishTranslation = category.translations.find(t => t.locale === 'en')
  if (englishTranslation) return englishTranslation
  
  return category.translations[0]
}

// Normalize category icon to a relative /storage path (frontend will prefix appropriately)
function normalizeCategoryIconPath(icon: string | null): string | null {
  if (!icon) return null

  let path = icon
  // If absolute URL, extract pathname
  if (/^https?:\/\//i.test(icon)) {
    try {
      const url = new URL(icon)
      path = url.pathname || icon
    } catch {
      // Keep original if URL parsing fails
      path = icon
    }
  }

  // Ensure it points to /storage
  if (path.startsWith('/storage/')) return path
  if (path.startsWith('storage/')) return `/${path}`

  // Some backends return just a filename or category path like categories/xxx.png
  const trimmed = path.startsWith('/') ? path.slice(1) : path
  return `/storage/${trimmed}`
}

// Get current locale from the store
function getCurrentLocale(): string {
  try {
    const appStore = useAppStore()
    return appStore.language === ELanguages.KA ? 'ka' : 'en'
  } catch {
    return 'en'
  }
}

// Convert backend categories to display format
export function processCategories(categories: IBackendCategory[], locale?: string): ICategoryDisplay[] {
  return categories.map(category => {
    const translation = getCategoryTranslation(category, locale)
    
    return {
      id: category.id,
      title: translation.title,
      slug: translation.slug,
      description: translation.description,
      icon: normalizeCategoryIconPath(category.icon),
      parent_id: category.parent_id,
      active: category.active === 1,
      product_count: Array.isArray((category as any).products) ? (category as any).products.length : 0,
      children: []
    }
  })
}

// Build hierarchical category tree
export function buildCategoryTree(categories: ICategoryDisplay[]): ICategoryDisplay[] {
  const categoryMap = new Map<number, ICategoryDisplay>()
  const rootCategories: ICategoryDisplay[] = []
  
  // Create map of all categories
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] })
  })
  
  // Build tree structure
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!
    
    if (category.parent_id === null) {
      // Root category
      rootCategories.push(categoryWithChildren)
    } else {
      // Child category
      const parent = categoryMap.get(category.parent_id)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(categoryWithChildren)
      }
    }
  })
  
  return rootCategories
}

// Get categories with hierarchy for specific locale
export async function getCategoriesForLocale(): Promise<ICategoryDisplay[]> {
  try {
    const locale = getCurrentLocale()
    const backendCategories = await getBackendCategories(locale)
    const processedCategories = processCategories(backendCategories, locale)
    return buildCategoryTree(processedCategories)
  } catch (error) {
    console.error('Error processing categories:', error)
    return []
  }
}

// Get single category by slug
export async function getCategoryBySlug(slug: string): Promise<ICategoryDisplay | null> {
  try {
    const locale = getCurrentLocale()
    const categories = await getBackendCategories(locale)
    
    for (const category of categories) {
      const translation = getCategoryTranslation(category, locale)
      if (translation.slug === slug) {
        return {
          id: category.id,
          title: translation.title,
          slug: translation.slug,
          description: translation.description,
          icon: normalizeCategoryIconPath(category.icon),
          parent_id: category.parent_id,
          active: category.active === 1
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching category by slug:', error)
    return null
  }
}
