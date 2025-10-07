import { getLocalizedApiUrl } from '@/utils/config/env';
import AxiosJSON from '@/utils/helpers/axios';

export interface UserProductsResponse {
  count: number;
  // Add other product-related fields if needed
}
export async function getUserProductsCount(userId: number): Promise<number> {
  try {
    await AxiosJSON.get(getLocalizedApiUrl('/sanctum/csrf-cookie'))

    // Token is now handled by axios interceptor
    const url = getLocalizedApiUrl('retailer/users/products/count')

    const response = await AxiosJSON.get(url, {
      params: { user_id: userId },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })

    const data = response.data
    if (typeof data === 'object' && 'count' in data) {
      return data.count || 0
    }
    return data || 0
  } catch (error: any) {
    console.error('Error fetching user products count:', error)
    
    // If it's a 401 error, check if it's a backend issue vs token issue
    if (error.response?.status === 401) {
      const backendMessage = error.response.data?.message;
      const token = localStorage.getItem('auth_token');
      
      if (token && backendMessage === 'Unauthenticated.') {
        console.warn('⚠️ Backend user products endpoint issue - keeping token for retry');
      } else if (backendMessage === 'Token has expired' || !token) {
        console.warn('Clearing expired/invalid tokens');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_auth_token');
      }
    }
    
    return 0
  }
}
