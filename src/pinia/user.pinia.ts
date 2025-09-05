import { getUser } from "../services/user.ts"
import { updateUserProfile, uploadUserAvatar } from "../services/user.ts"
import type { IUser } from "../ts/models/user-types"
import type { IUserState } from "../ts/pinia/user.types"
import AxiosJSON from "../utils/helpers/axios"

import { defineStore } from "pinia"
import axios from 'axios'

export const useUserStore = defineStore("user", {
  state: (): IUserState => {
    // Initialize with default values
    return {
      user: null,
      authDialogState: false,
      _isSettingAuthDialog: false // Flag to prevent recursive calls
    }
  },
  actions: {
    async fetchUser(): Promise<void> {
      try {
        const user = await getUser()
        if (user) {
          this.user = user
        } else {
          // If getUser returns null, clear auth state
          localStorage.removeItem("user_auth_token")
          localStorage.removeItem("auth_token")
          delete AxiosJSON.defaults.headers.common['Authorization']
          this.user = null
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Clear auth state on 401
          localStorage.removeItem("user_auth_token")
          localStorage.removeItem("auth_token")
          delete AxiosJSON.defaults.headers.common['Authorization']
          this.user = null
        }
      }
    },
    async updateProfile(payload: Partial<IUser>): Promise<IUser | null> {
      try {
        const updated = await updateUserProfile(payload)
        if (updated) this.user = updated
        return updated
      } catch (error) {
        console.log(error)
        throw error
      }
    },
    async uploadAvatar(file: File): Promise<IUser | null> {
      try {
        const updated = await uploadUserAvatar(file)
        if (updated) this.user = updated
        else await this.fetchUser()
        return updated
      } catch (error) {
        console.log(error)
        throw error
      }
    },
    setUser(payload: IUser | null): void {
      this.user = payload
    },
    setAuthDialogState(payload: boolean): void {
      // Only update if the value is actually changing
      if (this.authDialogState === payload) return
      
      // Prevent recursive calls
      if (this._isSettingAuthDialog) return
      
      try {
        this._isSettingAuthDialog = true
        this.authDialogState = payload
      } finally {
        this._isSettingAuthDialog = false
      }
    },
    clearUser(): void {
      this.user = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_auth_token')
    },
    
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
