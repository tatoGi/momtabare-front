import { defineStore } from 'pinia'
import { ref } from 'vue'
import AxiosJSON from '@/utils/helpers/axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)

  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      // Persist token for reloads and for axios interceptor compatibility
      try {
        localStorage.setItem('auth_token', newToken)
        localStorage.setItem('user_auth_token', newToken)
      } catch {}
      // Update axios Authorization header immediately
      AxiosJSON.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    }
  }

  function clearToken() {
    token.value = null
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_auth_token')
    } catch {}
    // Remove Authorization header
    delete AxiosJSON.defaults.headers.common['Authorization']
  }

  return { token, setToken, clearToken }
}, {
  // @ts-ignore - provided by pinia-plugin-persistedstate
  persist: true,
})
