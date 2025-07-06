import { IUser } from "../models/user.types.ts"

export interface IGetUserResponse {
  user: IUser
  message: string
}

export interface IGetUsersResponse{
  users: IUser[]
  message: string
}
