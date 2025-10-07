import AxiosJSON from "../utils/helpers/axios.ts"
import { getCurrentLocale } from './user'
import { getLocalizedApiUrl } from '@/utils/config/env'

/**
 * Requests retailer permission for the currently authenticated user
 * @returns Promise with success status and response data/message
 */
export async function requestRetailerPermission(): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    // First ensure we have a CSRF cookie
    await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'));
    
    // Token is now handled by axios interceptor automatically
    const url = getLocalizedApiUrl(`/profile/retailer-request`);
    
    console.log('Requesting retailer permission with automatic token handling');
    
    const response = await AxiosJSON.post(
      url,
      {}, // Empty data object since it's a POST request
      {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json'
        },
        withCredentials: true // Important for sending cookies with cross-origin requests
      }
    );
    
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Retailer permission requested successfully'
    };
  } catch (error: any) {
    console.error("❌ Failed to request retailer permission:", error);
    
    // More detailed error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      if (error.response.status === 401) {
        // Check if this is a backend issue vs token issue
        const backendMessage = error.response.data?.message;
        const token = localStorage.getItem('auth_token');
        
        // If we have a token and backend says "Unauthenticated", 
        // this is likely a backend issue, not a token issue
        if (token && backendMessage === 'Unauthenticated.') {
          console.warn('⚠️ Backend retailer endpoint issue - keeping token for retry');
          // Don't clear tokens - this is a backend issue
        } else if (backendMessage === 'Token has expired' || !token) {
          console.warn('Clearing expired/invalid tokens');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_auth_token');
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('user_auth_token');
        }
        
        return { 
          success: false,
          message: 'Your session has expired. Please log in again.',
          data: { requiresLogin: true }
        };
      }
    }
    
    return { 
      success: false,
      message: error.response?.data?.message || 'Failed to submit retailer request',
      data: error.response?.data
    };
  }
}

export interface IRetailerShopData {
  name: string
  location: string
  contact_person: string
  contact_phone: string
  avatar?: File | null
  cover_image?: File | null
}

export interface IApiResponse {
  success: boolean
  data?: any
  message?: string
  errors?: Record<string, string[]>
}

export async function saveRetailerShop(shopData: IRetailerShopData): Promise<IApiResponse> {
  try {
    // Get fresh CSRF token for authenticated requests
    await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'))
    
    const locale = getCurrentLocale()
    const formData = new FormData()
    
    // Append all fields to form data
    formData.append('name', shopData.name)
    formData.append('location', shopData.location)
    formData.append('contact_person', shopData.contact_person)
    formData.append('contact_phone', shopData.contact_phone)
    
    // Append files if they exist
    if (shopData.avatar) {
      formData.append('avatar', shopData.avatar)
    }
    if (shopData.cover_image) {
      formData.append('cover_image', shopData.cover_image)
    }
    
    const response = await AxiosJSON.post(
      getLocalizedApiUrl(`retailer/retailer-shop/store?locale=${locale}`),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        }
      }
    )
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Retailer shop saved successfully'
    }
    
  } catch (error: any) {
    console.error('Failed to save retailer shop:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to save retailer shop',
      errors: error.response?.data?.errors
    }
  }
}

export async function addProduct(payload: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        // Get fresh CSRF token for authenticated requests
        await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'))
        
        const url = getLocalizedApiUrl(`/retailer/products`)
        console.log(url)
        
        // Token is now handled by axios interceptor automatically
        console.log('Submitting product with automatic token handling')
        
        const response = await AxiosJSON.post(url, payload, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        
        console.log('✅ Product submission successful:', response.data)
        return {
            success: true,
            data: response.data.data,
            message: response.data.message
        }
    } catch (error: any) {
        console.error("❌ Failed to addProduct:", error)
        
        if (error.response) {
            console.error('📄 Response status:', error.response.status)
            console.error('📄 Response data:', error.response.data)
            console.error('📄 Response headers:', error.response.headers)
            
            if (error.response.status === 401) {
                return {
                    success: false,
                    message: 'არაავტორიზებული მოთხოვნა. გთხოვთ, ჯერ გაიაროთ ავტორიზაცია.'
                }
            }
            
            return {
                success: false,
                message: error.response.data?.message || 'პროდუქტის დამატება ვერ მოხერხდა'
            }
        }
        
        return { 
            success: false,
            message: 'ქსელის შეცდომა. სცადეთ თავიდან.'
        }
    }
}

export async function updateProduct(productId: number, payload: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'))
    const url = getLocalizedApiUrl(`/retailer/products/${productId}`)

    // Token is now handled by axios interceptor automatically

    const response = await AxiosJSON.post(url, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-HTTP-Method-Override': 'PUT'
      }
    })

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Product updated successfully'
    }
  } catch (error: any) {
    console.error('❌ Failed to update product:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'პროდუქტის განახლება ვერ მოხდა'
    }
  }
}

export async function deleteProduct(productId: number): Promise<{ success: boolean; message?: string }> {
  try {
      const url = getLocalizedApiUrl(`/retailer/products/${productId}`)
    // Token is now handled by axios interceptor automatically

    const response = await AxiosJSON.delete(url, {
      headers: {
        'Accept': 'application/json'
      }
    })

    return { success: true, message: response.data?.message || 'Product deleted' }
  } catch (error: any) {
    console.error('❌ Failed to delete product:', error)
    return { success: false, message: error.response?.data?.message || 'პროდუქტის წაშლა ვერ მოხდა' }
  }
}

export async function getRetailerProduct(productId: number): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const url = getLocalizedApiUrl(`/retailer/products/${productId}`)
    const response = await AxiosJSON.get(url)
    return {
      success: true,
      data: response.data?.data || response.data?.product || response.data,
      message: response.data?.message
    }
  } catch (error: any) {
    console.error('❌ Failed to fetch retailer product:', error)
    return { success: false, message: error.response?.data?.message || 'პროდუქტის მონაცემების მიღება ვერ მოხერხდა' }
  }
}

export async function getRetailerShopCount(): Promise<number> {
  try {
    const response = await AxiosJSON.get(
      getLocalizedApiUrl(`retailer/retailer-shop/count`)
    )
    
    // Handle different response structures
    if (typeof response.data === 'number') {
      return response.data
    }
    
    return response.data.count || response.data || 0
  } catch (error: any) {
    console.error('Failed to fetch retailer shop count:', error)
    return 0
  }
}

export interface IRetailerShop {
  id: number
  user_id: number
  name: string
  description?: string
  location: string
  contact_person: string
  contact_phone: string
  avatar?: string
  cover_image?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  translations?: Array<{
    id: number
    retailer_shop_id: number
    locale: string
    name: string
    description: string
  }>
}

// Get current user's retailer shop (without specific ID)
export async function getRetailerShop(): Promise<{ success: boolean; data?: IRetailerShop; message?: string }> {
  try {
    // Use general endpoint to get user's shop
    const endpoint = getLocalizedApiUrl(`retailer/retailer-shop`)
    
    const response = await AxiosJSON.get(endpoint)
    
    return {
      success: true,
      data: response.data.retailerShop || response.data.data || response.data,
      message: response.data.message
    }
  } catch (error: any) {
    console.error('Failed to fetch retailer shop:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch shop data'
    }
  }
}

// Get specific retailer shop by ID
export async function getRetailerShopById(shopId: number): Promise<{ success: boolean; data?: IRetailerShop; message?: string }> {
  try {
    const endpoint = getLocalizedApiUrl(`retailer/retailer-shop/${shopId}`)
    const response = await AxiosJSON.get(endpoint)
    
    return {
      success: true,
      data: response.data.retailerShop || response.data.data || response.data,
      message: response.data.message
    }
  } catch (error: any) {
    console.error('Failed to fetch retailer shop by ID:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch shop data'
    }
  }
}
