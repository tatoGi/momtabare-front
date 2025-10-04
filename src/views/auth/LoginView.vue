<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <div class="flex items-center space-x-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <div class="text-gray-700 dark:text-gray-300">იტვირთება...</div>
        </div>
      </div>
    </div>
    
    <!-- Skeleton Loader -->
    <div v-if="isLoading" class="max-w-md mx-auto w-full">
      <div class="animate-pulse space-y-6">
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
        
        <div class="space-y-4">
          <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
    <div class="sm:mx-auto sm:w-full sm:max-w-md relative">
      <!-- Close button (X) -->
      <button 
        @click="handleClose" 
        class="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
        aria-label="Close"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          შესვლა თქვენს ანგარიშზე
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          ან
          <router-link to="/register" class="font-medium text-red-600 hover:text-red-500">
            შექმენით ახალი ანგარიში
          </router-link>
        </p>
        
      </div>
    </div>

    <div v-if="!isLoading" class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 relative">
        <SignInComponent
          @close="handleLoginSuccess"
          @next-step="handleStepChange"
          @loading="(val) => isLoading = val"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { ref, onMounted } from 'vue'
import SignInComponent from '@/components/auth/SignInComponent.vue'

const isLoading = ref(true)

// Simulate loading (replace with your actual loading logic)
onMounted(() => {
  // Replace this with your actual loading logic
  setTimeout(() => {
    isLoading.value = false
  }, 1000) // 1 second delay for demo
})

// Prevent navigation while loading
onBeforeRouteLeave((to, from, next) => {
  if (isLoading.value) {
    return false
  }
  next()
})

const router = useRouter()

const handleLoginSuccess = () => {
  // Go to home page after successful login
  router.push('/')
}

const handleClose = () => {
  // Go back to previous page or home if no history
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const handleStepChange = (payload) => {
  console.log('Auth step changed:', payload)
}
</script>
