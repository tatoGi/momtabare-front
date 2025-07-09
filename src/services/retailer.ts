import AxiosJSON from "../utils/helpers/axios.ts"

export async function requestRetailerPermission() {
  return { success: true };
}

export async function addProduct(payload: any): Promise<void | null> {
    try {
        await AxiosJSON.post(`/products`, payload)
    } catch (error) {
        console.error("Failed to addToCart:", error)
        return null
    }
}
