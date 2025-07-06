import { IUser } from "../models/user.types.ts"

export interface IUserState {
  user: IUser | null
  authDialogState : boolean
}
