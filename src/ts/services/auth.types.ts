import type { IUser } from "../models/user-types"
// PARAMETERS
export interface IRegisterParams {
  phone_number?: string
  country_code?: string
  email?: string
  locale?: string
}

export interface IVerifyCodeParams {
  user_id?: number
  identifier?: string
  verification_code: string
  locale?: string
}

export interface IResendVerificationCodeParams {
  user_id: number
  locale?: string
}

export interface ICompleteRegistrationParams {
  user_id: number
  first_name: string
  surname?: string
  password: string
  password_confirmation: string
  verification_code: string
  locale?: string
}

export interface ISignInParams {
  phone_number?: string
  email?: string
  password: string
  locale?: string
}

// RESPONSEBI
export interface IRegisterResponse {
  message: string
  user_id: number
}

export interface IVerifyCodeResponse {
  message: string
  user_id: number
  token?: string
  token_type?: string
  success?: boolean
  user?: IUser
}

export interface IResendVerificationCodeResponse {
  message: string
  user_id: number
}

export interface ICompleteRegistrationResponse {
  message: string
  token: string
  token_type?: string
  success?: boolean
  user?: IUser
}

export interface ISignInResponseData {
  token: string
  access_token?: string
  token_type: string
  user: IUser
}

export interface ISignInResponse {
  success: boolean
  message: string
  data: ISignInResponseData
  token?: string
  access_token?: string
}

export interface ISignOutResponse {
  message: string
}

export interface IErrorResponse {
  message: string
}
