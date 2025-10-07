import { defineStore } from 'pinia'
import { ref } from 'vue'
import AxiosJSON from '@/utils/helpers/axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const isInitialized = ref(false)

  // Initialize the auth store - should be called when the app starts
  function initialize() {
    if (isInitialized.value) return
    
    // Try to get token from localStorage
    const storedToken = localStorage.getItem('auth_token') || 
                       localStorage.getItem('user_auth_token')
    
    if (storedToken) {
      setToken(storedToken)
    } else {
      // Clear any existing token in axios if no token found
      delete AxiosJSON.defaults.headers.common['Authorization']
    }
    
    isInitialized.value = true
  }

  function setToken(newToken: string | null) {
    token.value = newToken
    
    if (newToken) {
      // Persist token for reloads
      try {
        localStorage.setItem('auth_token', newToken)
        localStorage.setItem('user_auth_token', newToken)
      } catch (error) {
        console.error('Failed to store auth token:', error)
      }
      
      // Update axios Authorization header
      AxiosJSON.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      clearToken()
    }
  }

  function clearToken() {
    token.value = null
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_auth_token')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('user_auth_token')
    } catch (error) {
      console.error('Failed to clear auth tokens:', error)
    }
    
    // Remove Authorization header
    delete AxiosJSON.defaults.headers.common['Authorization']
  }

  return { 
    token, 
    isInitialized,
    setToken, 
    clearToken,
    initialize
  }
}, {
  // @ts-ignore - provided by pinia-plugin-persistedstate
  persist: {
    key: 'auth-storage',  // Unique key for storage
    storage: localStorage,
    paths: ['token']
  },
})
