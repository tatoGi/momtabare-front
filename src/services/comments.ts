import AxiosJSON from "../utils/helpers/axios.ts"
import { getLocalizedApiUrl, getApiUrl } from '@/utils/config/env'
// Updated interfaces to match Laravel backend API
interface IGetCommentsQuery {
  id: number
  per_page?: number
}

interface ICreateCommentQuery {
  comment: string
  rating?: number
}

interface IUpdateCommentQuery {
  comment: string
  rating?: number
}

interface IComment {
  id: number
  comment: string
  rating: number | null
  created_at: string
  user: {
    id: number
    name: string
    email: string
  }
}

interface IGetCommentsResponse {
  data: IComment[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
  product_stats: {
    average_rating: number
    total_comments: number
  }
}

interface ICreateCommentResponse {
  message: string
  data: {
    id: number
    comment: string
    rating: number | null
    is_approved: boolean
    created_at: string
  }
}

interface IUserCommentResponse {
  data: {
    id: number
    comment: string
    rating: number | null
    is_approved: boolean
    created_at: string
    updated_at: string
  } | null
  message?: string
}

export async function getCommentsByProduct(params: IGetCommentsQuery): Promise<IGetCommentsResponse | null> {
  try {
    const queryParams = new URLSearchParams()
    if (params.per_page) {
      queryParams.append('per_page', params.per_page.toString())
    }
    
    const url = `/products/${params.id}/comments${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const response = await AxiosJSON.get<IGetCommentsResponse>(getLocalizedApiUrl(url))
    return response.data
  } catch (error) {
    console.error("Error fetching product comments:", error)
    return {
      data: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null
      },
      product_stats: {
        average_rating: 0,
        total_comments: 0
      }
    }
  }
}

export async function createProductComment(productId: number, params: ICreateCommentQuery): Promise<ICreateCommentResponse | null> {
  try {
    const response = await AxiosJSON.post<ICreateCommentResponse>(getLocalizedApiUrl(`/products/${productId}/comments`), params)
    return response.data
  } catch (error) {
    console.error("Error creating product comment:", error)
    return null
  }
}

export async function updateProductComment(productId: number, commentId: number, params: IUpdateCommentQuery): Promise<ICreateCommentResponse | null> {
  try {
    const response = await AxiosJSON.put<ICreateCommentResponse>(getLocalizedApiUrl(`/products/${productId}/comments/${commentId}`), params)
    return response.data
  } catch (error) {
    console.error("Error updating product comment:", error)
    return null
  }
}

export async function deleteProductComment(productId: number, commentId: number): Promise<{ message: string } | null> {
  try {
    const response = await AxiosJSON.delete<{ message: string }>(getLocalizedApiUrl(`/products/${productId}/comments/${commentId}`))
    return response.data
  } catch (error) {
    console.error("Error deleting product comment:", error)
    return null
  }
}

export async function getUserProductComment(productId: number): Promise<IUserCommentResponse | null> {
  try {
    const response = await AxiosJSON.get<IUserCommentResponse>(getLocalizedApiUrl(`/products/${productId}/my-comment`))
    return response.data
  } catch (error) {
    console.error("Error fetching user comment:", error)
    return null
  }
}

export async function getCommentsByRetailer(params: IGetCommentsQuery): Promise<IGetCommentsResponse | null> {
  try {
    const response = await AxiosJSON.get<IGetCommentsResponse>(getLocalizedApiUrl(`/retailer/${params.id}/comments`))
    return response.data
  } catch (error) {
    console.error("Error fetching retailer comments:", error)
    return {
      data: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null
      },
      product_stats: {
        average_rating: 0,
        total_comments: 0
      }
    }
  }
}

// Legacy functions for backward compatibility
export async function commentOnProduct(params: ICreateCommentQuery) {
  try {
    const response = await AxiosJSON.post(getLocalizedApiUrl("/comment-on-product"), params)
    return response.data
  } catch (error) {
    console.error("Error commenting on product:", error)
    return { success: false }
  }
}

export async function commentOnRetailer(params: ICreateCommentQuery) {
  try {
    const response = await AxiosJSON.post(getLocalizedApiUrl("/comment-on-retailer"), params)
    return response.data
  } catch (error) {
    console.error("Error commenting on retailer:", error)
    return { success: false }
  }
}
