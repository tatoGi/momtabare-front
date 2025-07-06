import { IComment } from "../models/comment.types.ts"

export interface IGetCommentsQuery {
  id: number
}
export interface IGetCommentsResponse {
    message: string
    comments: IComment[]
}

export interface ICommentOnProductQuery{
  comment : string,
  id : number,
}
