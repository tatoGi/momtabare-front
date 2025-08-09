import AxiosJSON from "../utils/helpers/axios.ts"
import type { IRateProductQuery } from "../ts/services/ratings.types.ts"

export async function rateProduct(params: IRateProductQuery) {
  try {
    const response = await AxiosJSON.post("/rate-product", params)
    return response.data
  } catch (error) {
    console.error("Error rating product:", error)
    return { success: false }
  }
}

export async function rateRetailer(params: { rating: number; id: number }) {
  try {
    const response = await AxiosJSON.post("/rate-retailer", params)
    return response.data
  } catch (error) {
    console.error("Error rating retailer:", error)
    return { success: false }
  }
}
