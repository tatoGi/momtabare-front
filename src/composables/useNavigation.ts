import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/pinia/app.pinia'
import { getNavigation } from '@/services/pages'
import { syncLocale } from '@/services/languages'
import type { INavigationItem } from '@/ts/models/page.types'
import { ELanguages } from '@/ts/pinia/app.types'

// Navigation state
const navigationItems = ref<INavigationItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentLocale = ref<string>('en')

// Cache for different locales
const navigationCache = new Map<string, INavigationItem[]>()

export function useNavigation() {
  const appStore = useAppStore()
  
  // Get current locale from app store
  const getCurrentLocale = (): string => {
    try {
      const value = appStore.getLanguage
      return value === ELanguages.KA ? 'ka' : 'en'
    } catch {
      return 'en'
    }
  }

  // Load navigation data
  const loadNavigation = async (forceReload = false) => {
    // Always use the current language from app store
    const locale = appStore.language
    
    // Don't reload if we already have the data for this locale and not forcing reload
    if (!forceReload && navigationCache.has(locale) && navigationItems.value.length > 0) {
      return
    }

    // If we already have cached data for this locale, use it
    if (!forceReload && navigationCache.has(locale)) {
      navigationItems.value = navigationCache.get(locale) || []
      return
    }

    isLoading.value = true
    error.value = null

    try {
      console.log(`🌐 Loading navigation for locale: ${locale}`)
      
      // First sync the locale with backend
      await syncLocale(locale)
      
      // Then fetch the navigation
      const nav = await getNavigation(locale)
      
      if (nav && nav.length > 0) {
        // Update cache and current items
        navigationCache.set(locale, nav)
        navigationItems.value = nav
        currentLocale.value = locale
        console.log(`✅ Navigation loaded for locale: ${locale}`, nav)
      } else {
        throw new Error('No navigation items returned')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load navigation'
      console.error('❌ Navigation loading error:', error.value)
      // If we have cached data, use it as fallback
      if (navigationCache.has(locale)) {
        navigationItems.value = navigationCache.get(locale) || []
      } else {
        navigationItems.value = []
      }
    } finally {
      isLoading.value = false
    }
  }

  // Watch for locale changes
  watch(() => appStore.language, async (newLang: ELanguages, oldLang: ELanguages) => {
    if (newLang !== oldLang) {
      console.log(`🔄 Language changed from ${oldLang} to ${newLang}`)
      await loadNavigation(true) // Force reload on language change
    }
  })

  // Initial load
  onMounted(async () => {
    await loadNavigation()
  })

  // Get navigation items by parent
  const getNavigationByParent = (parentId: number | null = null): INavigationItem[] => {
    return navigationItems.value.filter(item => item.parent_id === parentId)
  }

  // Get root navigation items
  const rootNavigationItems = computed((): INavigationItem[] => {
    return getNavigationByParent(null)
  })

  // Find navigation item by slug
  const findNavigationBySlug = (slug: string): INavigationItem | null => {
    const findInItems = (items: INavigationItem[]): INavigationItem | null => {
      for (const item of items) {
        if (item.slug === slug) return item
        if (item.children && item.children.length > 0) {
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

  // Check if navigation item is active
  const isNavigationActive = (item: INavigationItem, currentPath: string): boolean => {
    if (!currentPath) return false
    const itemPath = item.path || ''
    return currentPath === itemPath || 
           currentPath.startsWith(`${itemPath}/`) ||
           Boolean(item.children?.some(child => 
             isNavigationActive(child, currentPath)
           ))
  }

  // Refresh navigation data
  const refreshNavigation = async () => {
    await loadNavigation(true)
  }

  return {
    // State
    navigationItems: computed(() => navigationItems.value),
    rootNavigationItems,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    currentLocale: computed(() => currentLocale.value),
    
    // Methods
    loadNavigation,
    refreshNavigation,
    getNavigationByParent,
    findNavigationBySlug,
    findNavigationByPath,
    isNavigationActive
  }
}