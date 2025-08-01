import type { IUser } from "../models/user-types"

export interface IGetUserResponse {
  user: IUser
  message: string
}

export interface IGetUsersResponse{
  users: IUser[]
  message: string
}
