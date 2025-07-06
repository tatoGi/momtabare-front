import {
  IAddToCartParams,
  IGetCartResponse,
  IUpdateCartParams,
} from "../ts/services/cart.types.ts"
import AxiosJSON from "../utils/helpers/axios.ts"

export async function getCart(): Promise<IGetCartResponse | null> {
  try {
    const response = await AxiosJSON.get("/cart")
    return response.data.cart_items
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return null
  }
}

export async function addToCart(
  payload: IAddToCartParams,
): Promise<void | null> {
  try {
    await AxiosJSON.post(`/cart/add`, payload)
  } catch (error) {
    console.error("Failed to addToCart:", error)
    return null
  }
}

export async function updateCart(
  payload: IUpdateCartParams,
  id: number,
): Promise<void | null> {
  try {
    await AxiosJSON.patch(`/cart/items/${id}`, payload)
  } catch (error) {
    console.error("Failed to updateCart:", error)
    return null
  }
}

export async function removeFromCart(id: number): Promise<void | null> {
  try {
    await AxiosJSON.delete(`/cart/items/${id}`)
  } catch (error) {
    console.error("Failed to removeFromCart:", error)
    return null
  }
}
