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

export async function getUser(): Promise<IUser | null> {
  try {
    const locale = getCurrentLocale();
    const token = localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token');
    
    if (!token) {
      console.warn('No authentication token found');
      return null;
    }

    try {
      // Ensure CSRF cookie is set
      await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'), { withCredentials: true });
      
      // Fetch user data - axios interceptor will handle Authorization header automatically
      const response = await AxiosJSON.get(getLocalizedApiUrl('me'), {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Localization': locale,
          'Accept-Language': locale
        }
      });

      const data = response.data;
      
      // Handle different response formats
      if (data?.success && data?.data) {
        // Format: { success: true, data: { ...user } }
        return data.data as IUser;
      } else if (data?.id) {
        // Direct user object
        return data as IUser;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error fetching user:', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
        headers: error.config?.headers,
        responseData: error.response?.data
      });
      
      // If we get a 401, be more careful about clearing tokens
      if (error.response?.status === 401) {
        console.warn('Authentication failed');
        console.warn('Backend response:', error.response?.data);
        
        // Check if this is a backend issue vs token issue
        const backendMessage = error.response?.data?.message;
        const token = localStorage.getItem('auth_token');
        
        // If we have a token and backend says "Unauthenticated", 
        // this is likely a backend /me endpoint issue, not a token issue
        if (token && backendMessage === 'Unauthenticated.') {
          console.warn('⚠️ Backend /me endpoint issue - keeping token for retry');
          console.warn('🔧 Please fix your backend /me endpoint to use $request->user("sanctum")');
          // Don't clear tokens - this is a backend issue
        } else if (backendMessage === 'Token has expired' || !token) {
          console.warn('Clearing expired/invalid tokens');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_auth_token');
          delete AxiosJSON.defaults.headers.common['Authorization'];
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error('Unexpected error in getUser:', error);
    return null;
  }
}

// Update current user profile (Laravel: PUT /profile)
export async function updateUserProfile(payload: Partial<IUser>): Promise<IUser | null> {
  try {
  
    
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
export async function getRetailerUserById(userId: number): Promise<{ user: IUser; message: string } | null> {
  try {
   
    const url = getLocalizedApiUrl(`/retailer/${userId}`)

    const resp = await AxiosJSON.get(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    const data = resp?.data

    // Helper function to map API fields to IUser interface
    const mapUserFields = (userData: any): IUser => {
      return {
        ...userData,
        // Map name/surname to first_name/last_name if needed
        first_name: userData.first_name || userData.name || '',
        last_name: userData.last_name || userData.surname || '',
      } as IUser
    }

    // Possible formats:
    // 1) { user, message }
    if (data?.user) {
      return { user: mapUserFields(data.user), message: data?.message || '' }
    }

    // 2) { data: { user }, message }
    if (data?.data?.user) {
      return { user: mapUserFields(data.data.user), message: data?.message || '' }
    }

    // 3) { data: { ...user }, message }
    if (data?.data && typeof data.data === 'object' && 'id' in data.data) {
      return { user: mapUserFields(data.data), message: data?.message || '' }
    }

    // 4) { ...user }
    if (data && typeof data === 'object' && 'id' in data) {
      return { user: mapUserFields(data), message: '' }
    }

    console.warn('getRetailerUserById: unexpected response shape', data)
    return null
  } catch (error) {
    console.error('getRetailerUserById failed:', error)
    return null
  }
}