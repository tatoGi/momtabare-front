import AxiosJSON from "../utils/helpers/axios.ts"

// Simplified interfaces to avoid import chain issues
interface IGetCommentsQuery {
  id: number
}

interface ICommentOnProductQuery {
  comment: string
  id: number
}

interface IGetCommentsResponse {
  message: string
  comments: any[]
}

export async function getCommentsByProduct(params: IGetCommentsQuery): Promise<IGetCommentsResponse | null> {
  try {
    const response = await AxiosJSON.get<IGetCommentsResponse>(`/product/${params.id}/comments`)
    return response.data
  } catch (error) {
    console.error("Error fetching product comments:", error)
    return {
      message: "Comments loaded",
      comments: []
    }
  }
}

export async function getCommentsByRetailer(params: IGetCommentsQuery): Promise<IGetCommentsResponse | null> {
  try {
    const response = await AxiosJSON.get<IGetCommentsResponse>(`/retailer/${params.id}/comments`)
    return response.data
  } catch (error) {
    console.error("Error fetching retailer comments:", error)
    return {
      message: "Comments loaded", 
      comments: []
    }
  }
}

export async function commentOnProduct(params: ICommentOnProductQuery) {
  try {
    const response = await AxiosJSON.post("/comment-on-product", params)
    return response.data
  } catch (error) {
    console.error("Error commenting on product:", error)
    return { success: false }
  }
}

export async function commentOnRetailer(params: ICommentOnProductQuery) {
  try {
    const response = await AxiosJSON.post("/comment-on-retailer", params)
    return response.data
  } catch (error) {
    console.error("Error commenting on retailer:", error)
    return { success: false }
  }
}
