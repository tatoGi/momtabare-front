<template>
  <div v-if="isVisible" class="loading-bar-container">
    <!-- Top Progress Bar -->
    <div class="loading-bar">
      <div 
        class="loading-bar-fill" 
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
    
    <!-- Optional Loading Overlay for Full Page -->
    <div v-if="showOverlay" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  showOverlay?: boolean
  loadingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  showOverlay: false,
  loadingText: 'იტვირთება...' // Loading in Georgian
})

const progress = ref(0)
const isVisible = ref(false)
let progressInterval: NodeJS.Timeout | null = null

const start = () => {
  isVisible.value = true
  progress.value = 0
  
  // Simulate progress
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 15
    }
  }, 200)
}

const finish = () => {
  progress.value = 100
  
  setTimeout(() => {
    isVisible.value = false
    progress.value = 0
  }, 300)
  
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

const stop = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  isVisible.value = false
  progress.value = 0
}

// Expose methods to parent
defineExpose({
  start,
  finish,
  stop
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>

<style scoped>
.loading-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

.loading-bar {
  height: 3px;
  background-color: rgba(244, 64, 0, 0.1);
  overflow: hidden;
}

.loading-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #F44000, #FF6B35);
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(244, 64, 0, 0.5);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.dark .loading-overlay {
  background-color: rgba(0, 0, 0, 0.9);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(244, 64, 0, 0.1);
  border-top: 3px solid #F44000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}

.dark .loading-text {
  color: #D1D5DB;
}

/* Animation for smooth appearance */
.loading-bar-container {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
