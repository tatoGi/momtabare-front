import { ref, reactive } from 'vue'

interface LoadingState {
  isLoading: boolean
  message: string
  showOverlay: boolean
}

// Global loading state
const globalLoading = reactive<LoadingState>({
  isLoading: false,
  message: 'იტვირთება...', // Loading in Georgian
  showOverlay: false
})

// Loading bar reference (will be set by the LoadingBar component)
let loadingBarRef: any = null

export function useLoading() {
  // Set loading bar reference
  const setLoadingBarRef = (ref: any) => {
    loadingBarRef = ref
  }

  // Start loading with optional message and overlay
  const startLoading = (message?: string, showOverlay: boolean = false) => {
    globalLoading.isLoading = true
    globalLoading.message = message || 'იტვირთება...'
    globalLoading.showOverlay = showOverlay
    
    if (loadingBarRef) {
      loadingBarRef.start()
    }
  }

  // Finish loading
  const finishLoading = () => {
    globalLoading.isLoading = false
    globalLoading.showOverlay = false
    
    if (loadingBarRef) {
      loadingBarRef.finish()
    }
  }

  // Stop loading immediately
  const stopLoading = () => {
    globalLoading.isLoading = false
    globalLoading.showOverlay = false
    
    if (loadingBarRef) {
      loadingBarRef.stop()
    }
  }

  // Async wrapper for API calls
  const withLoading = async <T>(
    asyncFn: () => Promise<T>,
    message?: string,
    showOverlay: boolean = false
  ): Promise<T> => {
    try {
      startLoading(message, showOverlay)
      const result = await asyncFn()
      finishLoading()
      return result
    } catch (error) {
      stopLoading()
      throw error
    }
  }

  return {
    // State
    globalLoading,
    
    // Methods
    startLoading,
    finishLoading,
    stopLoading,
    withLoading,
    setLoadingBarRef
  }
}

// Export for direct access
export { globalLoading }
