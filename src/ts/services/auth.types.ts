// PARAMETERS
export interface IRegisterParams {
  phone_number?: string
  country_code?: string
  email?: string
}

export interface IVerifyCodeParams {
  user_id: number
  verification_code: string
}

export interface IResendVerificationCodeParams {
  user_id: number
}

export interface ICompleteRegistrationParams {
  user_id: number
  first_name: string
  last_name: string
  password: string
  password_confirmation: string
}

export interface ISignInParams {
  phone_number?: string
  email?: string
  password: string
}

// RESPONSEBI
export interface IRegisterResponse {
  message: string
  user_id: number
}

export interface IVerifyCodeResponse {
  message: string
  user_id: number
}

export interface IResendVerificationCodeResponse {
  message: string
  user_id: number
}

export interface ICompleteRegistrationResponse {
  message: string
  token: string
}

export interface ISignInResponse {
  message: string
  token: string
}

export interface ISignOutResponse {
  message: string
}

export interface IErrorResponse {
  message: string
}
