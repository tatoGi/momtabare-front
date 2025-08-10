import axios from 'axios'
import type { IBackendCategory, ICategoryDisplay, ICategoryTranslation } from '@/ts/models/category.types'
import { getLocalizedApiUrl } from '@/utils/config/env'

// Fetch categories from backend API
export async function getBackendCategories(locale: string = 'en'): Promise<IBackendCategory[]> {
  try {
    const response = await axios.get(getLocalizedApiUrl('categories', locale))
   
    return response.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Get category translation for specific locale
export function getCategoryTranslation(category: IBackendCategory, locale: string): ICategoryTranslation {
  // Try to find translation for requested locale
  const translation = category.translations.find(t => t.locale === locale)
  
  // Fallback to English if requested locale not found
  if (!translation) {
    const englishTranslation = category.translations.find(t => t.locale === 'en')
    if (englishTranslation) return englishTranslation
  }
  
  // Fallback to first available translation
  return translation || category.translations[0]
}

// Convert backend categories to display format
export function processCategories(categories: IBackendCategory[], locale: string): ICategoryDisplay[] {
  return categories.map(category => {
    const translation = getCategoryTranslation(category, locale)
    
    return {
      id: category.id,
      title: translation.title,
      slug: translation.slug,
      description: translation.description,
      icon: category.icon,
      parent_id: category.parent_id,
      active: category.active === 1,
      // Pass through product count if backend provided products array
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
export async function getCategoriesForLocale(locale: string): Promise<ICategoryDisplay[]> {
  try {
    const backendCategories = await getBackendCategories(locale)
    const processedCategories = processCategories(backendCategories, locale)
    return buildCategoryTree(processedCategories)
  } catch (error) {
    console.error('Error processing categories:', error)
    return []
  }
}

// Get single category by slug
export async function getCategoryBySlug(slug: string, locale: string): Promise<ICategoryDisplay | null> {
  try {
    const categories = await getBackendCategories(locale)
    
    for (const category of categories) {
      const translation = getCategoryTranslation(category, locale)
      if (translation.slug === slug) {
        return {
          id: category.id,
          title: translation.title,
          slug: translation.slug,
          description: translation.description,
          icon: category.icon,
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
