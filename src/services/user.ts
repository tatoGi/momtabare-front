import axios from "axios"
import AxiosJSON from "../utils/helpers/axios"
import type { IUser } from "../ts/models/user-types"
import { getLocalizedApiUrl } from '../utils/config/env'
import { useAppStore } from '../pinia/app.pinia'
import { ELanguages } from '../ts/pinia/app.types'

// Get all users (Laravel: GET /users)
export async function getAllUsers(): Promise<{ users: IUser[] } | null> {
  try {
    const locale = getCurrentLocale()
    const response = await AxiosJSON.get(getLocalizedApiUrl('/users', locale), {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    // Handle different response formats
    if (response.data?.success && Array.isArray(response.data.data)) {
      return { users: response.data.data as IUser[] }
    } else if (Array.isArray(response.data)) {
      return { users: response.data as IUser[] }
    }

    console.warn('getAllUsers: unexpected response format', response.data)
    return { users: [] }
  } catch (error) {
    console.error('getAllUsers failed:', error)
    return null
  }
}

// Get user by ID (Laravel: GET /users/{id})

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
    // Prefer non-localized /me for auth endpoints; attach Bearer as fallback
    const token = localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token')
    let resp: any
    try {
      resp = await AxiosJSON.get(getLocalizedApiUrl('/me', locale), {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'X-Localization': locale,
          'Accept-Language': locale,
        }
      })
    } catch (e: any) {
      resp = await AxiosJSON.get('/me', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'X-Localization': locale,
          'Accept-Language': locale,
        }
      })
    }


    // Handle different response formats
    const data = resp.data

    // Your backend returns: { success: true, data: { ...user } }
    const user: IUser | null = data?.success && data?.data ? data.data as IUser : null
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
    console.error('❌ getUser failed:', error)

    // If we get a 401, clear any invalid tokens
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log('🚫 401 Unauthorized - clearing authentication tokens')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_auth_token')

      // If this was an API call (not the initial auth check), try to refresh the session
      if (!error.config?.url?.includes('/me')) {
        try {
          console.log('🔄 Attempting to refresh CSRF token and retry...')
          // Try to refresh the CSRF token and session
          const retryLocale = getCurrentLocale()
          try {
            await AxiosJSON.get(getLocalizedApiUrl('/sanctum/csrf-cookie', retryLocale), {
              withCredentials: true
            })
          } catch (e) {
            await AxiosJSON.get('/sanctum/csrf-cookie', { withCredentials: true })
          }

          // Retry the original request
          console.log('🔄 Retrying user fetch...')
          return getUser()
        } catch (refreshError) {
          console.error('❌ Failed to refresh session:', refreshError)
        }
      }

      return null
    }

    console.error('getUser failed with non-401 error:', error)
    return null
  }
}

// Update current user profile (Laravel: PUT /profile)
export async function updateUserProfile(payload: Partial<IUser>): Promise<IUser | null> {
  try {
    const locale = getCurrentLocale()
    
    // For profile updates, we might need CSRF token + session auth
    // First get CSRF cookie (localized with fallback)
    try {
      await AxiosJSON.get(getLocalizedApiUrl('/sanctum/csrf-cookie', locale))
    } catch (e) {
      await AxiosJSON.get('/sanctum/csrf-cookie')
    }
    
    // Make the authenticated request with both Bearer token and session credentials
    const resp = await AxiosJSON.put(getLocalizedApiUrl(`/profile`, locale), payload, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    
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
    
    // Get CSRF cookie first (localized with fallback)
    try {
      await AxiosJSON.get(getLocalizedApiUrl('/sanctum/csrf-cookie', locale))
    } catch (e) {
      await AxiosJSON.get('/sanctum/csrf-cookie')
    }
    
    const form = new FormData()
    // Backend expects 'avatar' field name
    form.append('avatar', file)
    
    const resp = await AxiosJSON.post(getLocalizedApiUrl(`/profile/avatar`, locale), form, {
      withCredentials: true,
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    
    console.log('Avatar upload response:', resp.data)
    
    // Handle the response - backend returns {message, data: {avatar: "path"}}
    if (resp.data?.data?.avatar) {
      // Get current user and update with new avatar path
      const currentUser = await getUser()
      if (currentUser) {
        // Backend returns avatar field, update both avatar and profile_picture for compatibility
        currentUser.avatar = resp.data.data.avatar
        currentUser.profile_picture = resp.data.data.avatar
        return currentUser
      }
    }
    
    // Fallback: return updated user from response data
    const userData = resp.data?.data as IUser
    if (userData && userData.avatar) {
      // Ensure both fields are set for compatibility
      userData.profile_picture = userData.avatar
    }
    return userData ?? null
  } catch (error) {
    console.error('uploadUserAvatar failed', error)
    throw error
  }
}

// Fetch a user by ID
// Tries to be resilient to different backend response shapes
export async function getUserById(userId: number): Promise<{ user: IUser; message: string } | null> {
  try {
    const locale = getCurrentLocale()
    const url = getLocalizedApiUrl(`/users/${userId}`, locale)

    const resp = await AxiosJSON.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    const data = resp?.data

    // Possible formats:
    // 1) { user, message }
    if (data?.user) {
      return { user: data.user as IUser, message: data?.message || '' }
    }

    // 2) { data: { user }, message }
    if (data?.data?.user) {
      return { user: data.data.user as IUser, message: data?.message || '' }
    }

    // 3) { data: { ...user }, message }
    if (data?.data && typeof data.data === 'object' && 'id' in data.data) {
      return { user: data.data as IUser, message: data?.message || '' }
    }

    // 4) { ...user }
    if (data && typeof data === 'object' && 'id' in data) {
      return { user: data as IUser, message: '' }
    }

    console.warn('getUserById: unexpected response shape', data)
    return null
  } catch (error) {
    console.error('getUserById failed:', error)
    return null
  }
}
