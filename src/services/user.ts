import AxiosJSON from "../utils/helpers/axios"
import type { IUser } from "../ts/models/user-types"
import { getLocalizedApiUrl } from '../utils/config/env'
import { useAppStore } from '../pinia/app.pinia'
import { ELanguages } from '../ts/pinia/app.types'

// Get all users (Laravel: GET /users)
export async function getAllUsers(): Promise<{ users: IUser[] } | null> {
  try {
    const response = await AxiosJSON.get(getLocalizedApiUrl('users'), {
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
    const locale = getCurrentLocale();
    const token = localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token');
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Localization': locale,
      'Accept-Language': locale
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Try with the localized API URL first
    try {
      const response = await AxiosJSON.get(getLocalizedApiUrl('me'), {
        withCredentials: true,
        headers
      });

      // Handle successful response
      const data = response.data;
      
      // Handle different response formats
      if (data?.success && data?.data) {
        // Format: { success: true, data: { ...user } }
        return data.data as IUser;
      } else if (data?.id) {
        // Direct user object
        return data as IUser;
      }
      
      console.warn('Unexpected response format from /me endpoint:', data);
      return null;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      
      // If we get a 401, clear any invalid tokens
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        delete AxiosJSON.defaults.headers.common['Authorization'];
      }
      
      return null;
    }
  } catch (error) {
    console.error('❌ Unexpected error in getUser:', error);
    return null;
  }
}

// Update current user profile (Laravel: PUT /profile)
export async function updateUserProfile(payload: Partial<IUser>): Promise<IUser | null> {
  try {
    const locale = getCurrentLocale()
    
    // For profile updates, we need CSRF token + session auth
    await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'));
    
    // Make the authenticated request with both Bearer token and session credentials
    const resp = await AxiosJSON.put(getLocalizedApiUrl('profile'), payload, {
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
    
    
    // Get CSRF cookie first (localized with fallback)
    try {
      await AxiosJSON.get(getLocalizedApiUrl('/sanctum/csrf-cookie'))
    } catch (e) {
      await AxiosJSON.get('/sanctum/csrf-cookie')
    }
    
    const form = new FormData()
    // Backend expects 'avatar' field name
    form.append('avatar', file)
    
    const resp = await AxiosJSON.post(getLocalizedApiUrl('profile/avatar'), form, {
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
    const url = getLocalizedApiUrl(`/users/${userId}`)

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
