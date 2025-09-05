import type { IUser } from "../models/user-types"

export interface IUserState {
  user: IUser | null
  authDialogState: boolean
  _isSettingAuthDialog?: boolean
}
