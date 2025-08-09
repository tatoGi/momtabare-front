import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/pinia/app.pinia'
import { getPageBySlug } from '@/services/pages'
import type { IPage } from '@/ts/models/page.types'

// Global page data state
const currentPageData = ref<IPage | null>(null)
const isLoadingPageData = ref(false)
const pageDataError = ref<string | null>(null)

export function usePageData() {
  const route = useRoute()
  const appStore = useAppStore()
  
  // Get current locale from app store
  const currentLocale = computed(() => appStore.getLanguage)
  
  // Get page data from current route meta
  const routePageData = computed(() => {
    return (route.meta?.pageData as IPage) || null
  })
  
  // Load page data by slug
  const loadPageData = async (slug: string, locale?: string) => {
    const targetLocale = locale || currentLocale.value
    
    isLoadingPageData.value = true
    pageDataError.value = null
    
    try {
      const pageData = await getPageBySlug(slug, targetLocale)
      
      if (pageData) {
        currentPageData.value = pageData
        console.log('✅ Page data loaded for slug:', slug, pageData)
      } else {
        pageDataError.value = `Page not found for slug: ${slug}`
        console.warn('⚠️ Page not found for slug:', slug)
      }
    } catch (error) {
      pageDataError.value = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('❌ Page data loading error:', error)
    } finally {
      isLoadingPageData.value = false
    }
  }
  
  // Clear page data
  const clearPageData = () => {
    currentPageData.value = null
    pageDataError.value = null
    isLoadingPageData.value = false
  }
  
  // Get page translation for current locale (prioritize route data)
  const getCurrentPageTranslation = computed(() => {
    const pageData = routePageData.value || currentPageData.value
    if (!pageData) return null
    
    const translation = pageData.translations.find(t => t.locale === currentLocale.value)
    
    // Fallback to English if current locale not found
    if (!translation) {
      return pageData.translations.find(t => t.locale === 'en') || null
    }
    
    return translation
  })
  
  // Get current page data (prioritize route data)
  const currentPage = computed(() => {
    return routePageData.value || currentPageData.value
  })
  
  // Get page content/description
  const pageContent = computed(() => {
    return getCurrentPageTranslation.value?.desc || ''
  })
  
  // Get page title
  const pageTitle = computed(() => {
    return getCurrentPageTranslation.value?.title || ''
  })
  
  // Get page slug
  const pageSlug = computed(() => {
    return getCurrentPageTranslation.value?.slug || ''
  })
  
  // Get page keywords
  const pageKeywords = computed(() => {
    return getCurrentPageTranslation.value?.keywords || ''
  })
  
  return {
    // State
    currentPageData: currentPage,
    routePageData,
    isLoadingPageData: computed(() => isLoadingPageData.value),
    pageDataError: computed(() => pageDataError.value),
    
    // Computed page properties
    getCurrentPageTranslation,
    pageContent,
    pageTitle,
    pageSlug,
    pageKeywords,
    
    // Methods
    loadPageData,
    clearPageData
  }
}
