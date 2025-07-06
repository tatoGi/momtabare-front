import AxiosJSON from "../utils/helpers/axios.ts"

export async function requestRetailerPermission(): Promise<void | null> {
    try {
        await AxiosJSON.post(`/request-retailer`)
    } catch (error) {
        console.error("Failed to addToCart:", error)
        return null
    }
}

export async function addProduct(payload: any): Promise<void | null> {
    try {
        await AxiosJSON.post(`/products`, payload)
    } catch (error) {
        console.error("Failed to addToCart:", error)
        return null
    }
}
