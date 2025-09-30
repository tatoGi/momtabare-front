import AxiosJSON from "../utils/helpers/axios.ts"
import { getCurrentLocale } from './user'
import { getLocalizedApiUrl } from '@/utils/config/env'

export async function requestRetailerPermission(): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const locale = getCurrentLocale()
    const response = await AxiosJSON.post(getLocalizedApiUrl('/profile/retailer-request', locale))
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    }
  } catch (error) {
    console.error("Failed to request retailer permission:", error)
    return { 
      success: false,
      message: 'Failed to submit retailer request'
    }
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
    await AxiosJSON.get('/sanctum/csrf-cookie')
    
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
      getLocalizedApiUrl('retailer/retailer-shop/store', locale),
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
        await AxiosJSON.get('/sanctum/csrf-cookie')
        
        const locale = getCurrentLocale()
        const url = getLocalizedApiUrl('/retailer/products', locale)
        console.log(url)
        
        // Ensure we have the auth token
        const token = localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token')
        console.log('Using auth token for retailer request:', token ? 'Present' : 'Missing')
        
        const response = await AxiosJSON.post(url, payload, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
    await AxiosJSON.get('/sanctum/csrf-cookie')
    const locale = getCurrentLocale()
    const url = getLocalizedApiUrl(`/retailer/products/${productId}`, locale)

    const token = localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token')

    const response = await AxiosJSON.post(url, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
    const locale = getCurrentLocale()
    const url = getLocalizedApiUrl(`/retailer/products/${productId}`, locale)
    const token = localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token')

    const response = await AxiosJSON.delete(url, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
    const locale = getCurrentLocale()
    const url = getLocalizedApiUrl(`/retailer/products/${productId}`, locale)
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
    const locale = getCurrentLocale()
    const response = await AxiosJSON.get(
      getLocalizedApiUrl('retailer/retailer-shop/count', locale)
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
    const locale = getCurrentLocale()
    // Use general endpoint to get user's shop
    const endpoint = getLocalizedApiUrl('retailer/retailer-shop', locale)
    
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
    const locale = getCurrentLocale()
    const endpoint = getLocalizedApiUrl(`/retailer/retailer-shop/${shopId}`, locale)
    
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
