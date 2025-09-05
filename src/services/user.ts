import axios from "axios"
import AxiosJSON from "../utils/helpers/axios.ts"
import type { IUser } from "../ts/models/user-types"
import { getLocalizedApiUrl, getApiUrl } from '@/utils/config/env'
import { useAppStore } from '@/pinia/app.pinia'
import { ELanguages } from '@/ts/pinia/app.types'

// Get all users (Laravel: GET /users)
export async function getAllUsers(): Promise<{ users: IUser[] } | null> {
  try {
    const locale = getCurrentLocale()
    const resp = await AxiosJSON.get(getLocalizedApiUrl('/users', locale))
    // Backend returns { users: [...] }
    return resp.data?.users ? { users: resp.data.users } : null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw error
    }
    console.error('getAllUsers failed', error)
    return null
  }
}

// Get user by ID (Laravel: GET /users/{id})
export async function getUserById(userId: number): Promise<{ user: IUser } | null> {
  try {
    const locale = getCurrentLocale()
    const resp = await AxiosJSON.get(getLocalizedApiUrl(`/users/${userId}`, locale))
    // Backend returns { user: { ...user } }
    return resp.data?.user ? { user: resp.data.user } : null
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw error
    }
    console.error('getUserById failed', error)
    return null
  }
}

export function getCurrentLocale(): string {
  try {
    const appStore = useAppStore()
    return appStore.language === ELanguages.KA ? 'ka' : 'en'
  } catch {
    return 'ka'
  }
}
/**
 * Get current authenticated user
 * Handles both session and token-based authentication
 */
export async function getUser(): Promise<IUser | null> {
  try {
    const locale = getCurrentLocale()
    
    // First try with credentials (session-based auth)
    const resp = await AxiosJSON.get(getLocalizedApiUrl('/me', locale), {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    // Handle different response formats
    const data = resp.data
    const user: IUser | null = (data?.data || data?.user || data || null) as IUser
    
    if (!user) {
      console.warn('getUser: unexpected response shape', data)
      return null
    }

    // If we got a token in the response, store it
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
    }

    return user
  } catch (error) {
    // If we get a 401, clear any invalid tokens
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_auth_token')
      
      // If this was an API call (not the initial auth check), try to refresh the session
      if (!error.config?.url?.includes('/me')) {
        try {
          // Try to refresh the CSRF token and session
          await AxiosJSON.get(getApiUrl('/sanctum/csrf-cookie'), {
            withCredentials: true
          })
          
          // Retry the original request
          return getUser()
        } catch (refreshError) {
          console.error('Failed to refresh session:', refreshError)
        }
      }
      
      return null
    }
    
    console.error('getUser failed:', error)
    return null
  }
}

// Update current user profile (Laravel: PUT /profile)
export async function updateUserProfile(payload: Partial<IUser>): Promise<IUser | null> {
  try {
    const locale = getCurrentLocale()
    const resp = await AxiosJSON.put(getLocalizedApiUrl(`/profile`, locale), payload)
    // Backend returns { message, data: { ...user } }
    return (resp.data?.data as IUser) ?? null
  } catch (error) {
    console.error('updateUserProfile failed', error)
    throw error
  }
}

// OPTIONAL: upload avatar (expects backend route like POST /profile/avatar)
export async function uploadUserAvatar(file: File): Promise<IUser | null> {
  try {
    const locale = getCurrentLocale()
    const form = new FormData()
    // Adjust field name to your backend expectation (e.g., 'avatar' or 'profile_picture')
    form.append('profile_picture', file)
    const resp = await AxiosJSON.post(getLocalizedApiUrl(`/profile/avatar`, locale), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    // Prefer updated user in { data }
    return (resp.data?.data as IUser) ?? null
  } catch (error) {
    console.error('uploadUserAvatar failed', error)
    throw error
  }
}
