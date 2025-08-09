export interface IGetCommentsQuery {
  id: number
}
export interface IGetCommentsResponse {
    message: string
    comments: any[]
}

export interface ICommentOnProductQuery{
  comment : string,
  id : number,
}
