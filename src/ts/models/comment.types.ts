import type { IUser } from "./user-types"

export interface IComment{
    id: number
    rating_by_user:number
    comment: string
    user: IUser
}