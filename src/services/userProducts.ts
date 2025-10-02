import { getLocalizedApiUrl } from '@/utils/config/env';
import { useAppStore } from '@/pinia/app.pinia'
import { ELanguages } from '@/ts/pinia/app.types'
import AxiosJSON from '@/utils/helpers/axios';

export interface UserProductsResponse {
  count: number;
  // Add other product-related fields if needed
}
// Get current locale for API calls
function getCurrentLocale(): string {
  try {
    const appStore = useAppStore()
    return appStore.language === ELanguages.KA ? 'ka' : 'en'
  } catch {
    return 'en' // fallback
  }
}
export async function getUserProductsCount(userId: number): Promise<number> {
  try {
    const locale = getCurrentLocale()
    await AxiosJSON.get(getLocalizedApiUrl('/sanctum/csrf-cookie', locale))

    const token = localStorage.getItem('auth_token') || ''
    const url = getLocalizedApiUrl('retailer/users/products/count', locale)

    const response = await AxiosJSON.get(url, {
      params: { user_id: userId },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })

    const data = response.data
    if (typeof data === 'object' && 'count' in data) {
      return data.count || 0
    }
    return data || 0
  } catch (error) {
    console.error('Error fetching user products count:', error)
    return 0
  }
}
