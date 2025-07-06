import { IGetOrdersResponse } from "../ts/services/order.types.ts"
import AxiosJSON from "../utils/helpers/axios.ts"

export async function checkout() {
  try {
    const response = await AxiosJSON.post(`/checkout`)
    return response.data
  } catch (error) {
    console.error("Failed to checkout :", error)
    return null
  }
}

export async function getOrders(): Promise<IGetOrdersResponse | null> {
  try {
    const response = await AxiosJSON.get(`/orders`)
    return response.data
  } catch (error) {
    console.error("Failed to checkout :", error)
    return null
  }
}
