import { ref, readonly } from 'vue'

// Global loading state
const isLoading = ref(false)
const loadingTasks = ref(new Set<string>())

export const useProgressBar = () => {
  const startLoading = (taskId: string = 'default') => {
    loadingTasks.value.add(taskId)
    isLoading.value = true
  }

  const stopLoading = (taskId: string = 'default') => {
    loadingTasks.value.delete(taskId)
    if (loadingTasks.value.size === 0) {
      isLoading.value = false
    }
  }

  const stopAllLoading = () => {
    loadingTasks.value.clear()
    isLoading.value = false
  }

  return {
    isLoading: readonly(isLoading),
    startLoading,
    stopLoading,
    stopAllLoading
  }
}
