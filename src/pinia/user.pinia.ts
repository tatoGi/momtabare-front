import { getUser } from "../services/user.ts"
import { IUser } from "../ts/models/user.types.ts"
import { IUserState } from "../ts/pinia/user.types.ts"

import { defineStore } from "pinia"

export const useUserStore = defineStore("user", {
  state: (): IUserState => ({
    user: null,
    authDialogState : false
  }),
  actions: {
    async fetchUser(): Promise<void> {
      try {
        this.user = await getUser()
        if (!this.user){
          localStorage.removeItem("user_auth_token")
        }
      } catch (error) {
        console.log(error)
      }
    },
    setUser(payload: IUser | null): void {
      this.user = payload
    },
    setAuthDialogState(payload : boolean): void{
      this.authDialogState = payload
    }
  },
  getters: {
    getUser(state: IUserState): IUserState["user"] {
      return state.user
    },
    getAuthDialogState(state: IUserState): IUserState["authDialogState"] {
      return state.authDialogState
    },
  },
})
