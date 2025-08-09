<template>
  <div
    v-if="isLoading"
    class="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-700"
  >
    <div
      class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
      :style="{ width: `${progress}%` }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

interface Props {
  isLoading?: boolean
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  duration: 2000
})

const progress = ref(0)
let progressInterval: NodeJS.Timeout | null = null

const startProgress = () => {
  progress.value = 0
  
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  
  // Simulate progress with intervals
  const increment = 100 / (props.duration / 50) // Update every 50ms
  
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += increment * (Math.random() * 0.5 + 0.5) // Add some randomness
    } else if (progress.value < 95) {
      progress.value += 0.5 // Slow down near the end
    }
    
    if (progress.value >= 100) {
      progress.value = 100
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
    }
  }, 50)
}

const completeProgress = () => {
  progress.value = 100
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  
  // Hide after a short delay
  setTimeout(() => {
    progress.value = 0
  }, 200)
}

// Watch for loading state changes
watch(
  () => props.isLoading,
  (newValue) => {
    if (newValue) {
      startProgress()
    } else {
      completeProgress()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>
