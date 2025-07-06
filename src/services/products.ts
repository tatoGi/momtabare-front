import AxiosJSON from "../utils/helpers/axios.ts"
import {
  IGetProductByIdQuery,
  IGetProductByIdResponse,
  IGetProductsQuery,
  IGetProductsResponse,
} from "../ts/services/products.types"

export async function getProducts(
  query: IGetProductsQuery = { page: 1 },
): Promise<IGetProductsResponse | null> {
  try {
    const response = await AxiosJSON.get<IGetProductsResponse>("/products", {
      params: query,
    })
    return response.data
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return null
  }
}

export async function getProductBySku(
  query: IGetProductByIdQuery,
): Promise<IGetProductByIdResponse | null> {
  try {
    const response = await AxiosJSON.get<IGetProductByIdResponse>(
      `/products/${query.sku}`,
    )
    return response.data
  } catch (error) {
    console.error("Failed to fetch the product:", error)
    return null
  }
}

export async function getProductBySeller(
  sellerId: number,
): Promise<IGetProductsResponse | null> {
  try {
    const response = await AxiosJSON.get<IGetProductsResponse>(
      `/users/${sellerId}/products`,
    )

    return response.data
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return null
  }
}

export async function getFavoriteProducts(
  query: IGetProductsQuery = { page: 1 },
): Promise<IGetProductsResponse | null>{
  try{
    const response = await AxiosJSON.get<IGetProductsResponse>('/favorites',{params : query})
    return response.data
  }catch(error){
    console.error("Failed to fetch products:", error)
    throw error
  }
}

export async function toggleFavoriteProduct(id:number){
  try{
    const response = AxiosJSON.post(`/favorites/${id}`)
    return response
  }catch(error){
    console.error("Failed toggling favorite", error)
    return null
  }
}