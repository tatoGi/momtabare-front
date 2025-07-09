import { ICommentOnProductQuery, IGetCommentsResponse } from "../ts/services/comments.types.ts"
import AxiosJSON from "../utils/helpers/axios.ts"

export async function getCommentsByProduct() {
  return {
    comments: [
      { id: 1, text: 'Great product!', user: 'Demo User' }
    ]
  };
}

export async function getCommentsByRetailer() {
  return {
    comments: [
      { id: 2, text: 'Excellent service!', user: 'Sample User' }
    ]
  };
}

export async function commentOnProduct() {
  return { success: true };
}

export async function commentOnRetailer() {
  return { success: true };
}
