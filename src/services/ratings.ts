import AxiosJSON from "../utils/helpers/axios.ts"
import type { IRateProductQuery } from "../ts/services/ratings.types.ts"
import { getLocalizedApiUrl } from '@/utils/config/env'

export async function getProductRatings(productId: number) {
  try {
    const response = await AxiosJSON.get(
      getLocalizedApiUrl(`product-ratings/${productId}`),
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )
    return {
      success: true,
      average: response.data.average || 0,
      count: response.data.count || 0,
      ratings: response.data.ratings || []
    }
  } catch (error) {
    console.error("Error fetching product ratings:", error)
    return { success: false, average: 0, count: 0, ratings: [] }
  }
}

export async function rateProduct(params: IRateProductQuery) {
  try {
    await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'))
    
    const response = await AxiosJSON.post(
      getLocalizedApiUrl('rate-product'), 
      params,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    )
    return response.data
  } catch (error) {
    console.error("Error rating product:", error)
    return { success: false }
  }
}

export async function rateRetailer(params: { rating: number; id: number }) {
  try {
    await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'))
    
    const response = await AxiosJSON.post(
      getLocalizedApiUrl('rate-retailer'), 
      params,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    )
    return response.data
  } catch (error) {
    console.error("Error rating retailer:", error)
    return { success: false }
  }
}
