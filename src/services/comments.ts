import { ICommentOnProductQuery, IGetCommentsResponse } from "../ts/services/comments.types.ts"
import AxiosJSON from "../utils/helpers/axios.ts"

export async function getCommentsByProduct(
  productId: number,
): Promise<IGetCommentsResponse | null> {
  try {
    const response = await AxiosJSON.get<IGetCommentsResponse>(
      `comments/product/${productId}`,
    )

    return response.data
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return null
  }
}

export async function getCommentsByRetailer(
  retailerId: number,
): Promise<IGetCommentsResponse | null> {
  try {
    const response = await AxiosJSON.get<IGetCommentsResponse>(
      `comments/user/${retailerId}`,
    )

    return response.data
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return null
  }
}

export async function commentOnProduct(query : ICommentOnProductQuery){
  try{
      const response = await AxiosJSON.post(`comments/product/${query.id}`,{comment : query.comment})
      return response
  }catch(error){
    console.log(error)
    return null
  }
  
}
export async function commentOnRetailer(query : ICommentOnProductQuery){
  try{
      const response = await AxiosJSON.post(`comments/user/${query.id}`,{comment : query.comment})
      return response
  }catch(error){
    console.log(error)
    return null
  }
  
}
