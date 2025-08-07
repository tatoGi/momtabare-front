import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/pinia/app.pinia'
import { getNavigation } from '@/services/pages'
import type { INavigationItem } from '@/ts/models/page.types'

// Global navigation state
const navigationItems = ref<INavigationItem[]>([])
const isLoading = ref(true) // Start as loading
const error = ref<string | null>(null)
const lastProcessedLocale = ref<string | null>(null)

export function useNavigation() {
  const appStore = useAppStore()
  
  // Get current locale from app store
  const currentLocale = computed(() => appStore.getLanguage)
  
  // Load navigation data
  const loadNavigation = async (locale?: string) => {
    const targetLocale = locale || currentLocale.value
    
    // If we already have navigation for this locale, don't reload
    if (lastProcessedLocale.value === targetLocale && navigationItems.value.length > 0) {
      return
    }
    
    // If currently loading and we have some data, skip
    if (isLoading.value && navigationItems.value.length > 0) {
      return
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const nav = await getNavigation(targetLocale)
      
      if (nav && nav.length > 0) {
        navigationItems.value = nav
        lastProcessedLocale.value = targetLocale
      } else {
        error.value = 'Failed to load navigation'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('❌ Navigation loading error:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Watch for locale changes and reload navigation
  watch(currentLocale, (newLocale, oldLocale) => {
    if (newLocale && newLocale !== oldLocale) {
      loadNavigation(newLocale)
    }
  }, { immediate: true })
  
  // Get navigation items by parent
  const getNavigationByParent = (parentId: number | null = null) => {
    return navigationItems.value.filter(item => 
      item.parent_id === parentId
    )
  }
  
  // Get root navigation items (no parent)
  const rootNavigationItems = computed(() => {
    if (!navigationItems.value || navigationItems.value.length === 0) {
      return []
    }
    return getNavigationByParent(null)
  })
  
  // Find navigation item by slug
  const findNavigationBySlug = (slug: string): INavigationItem | null => {
    const findInItems = (items: INavigationItem[]): INavigationItem | null => {
      for (const item of items) {
        if (item.slug === slug) {
          return item
        }
        if (item.children) {
          const found = findInItems(item.children)
          if (found) return found
        }
      }
      return null
    }
    
    return findInItems(navigationItems.value)
  }
  
  // Find navigation item by path
  const findNavigationByPath = (path: string): INavigationItem | null => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return findNavigationBySlug(cleanPath)
  }
  
  // Check if navigation item is active (matches current route)
  const isNavigationActive = (item: INavigationItem, currentPath: string): boolean => {
    return item.path === currentPath || 
           currentPath.startsWith(item.path + '/') ||
           Boolean(item.children && item.children.some(child => 
             isNavigationActive(child, currentPath)
           ))
  }
  
  // Refresh navigation data
  const refreshNavigation = () => {
    loadNavigation()
  }
  
  return {
    // State
    navigationItems: computed(() => navigationItems.value),
    rootNavigationItems,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    
    // Methods
    loadNavigation,
    refreshNavigation,
    getNavigationByParent,
    findNavigationBySlug,
    findNavigationByPath,
    isNavigationActive
  }
}
