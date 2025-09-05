export enum EAuthStep {
  SIGN_IN = "signIn",
  SIGN_UP_PHONE_NUMBER = "signUpPhoneNumber",
  SIGN_UP_EMAIL = "signUpEmail",
  VERIFY_CODE = "verifyCode",
  VERIFY_EMAIL = "verifyEmail",
  VERIFY_PHONE = "verifyPhone",
  SIGN_UP_USER_INFO = "signUpUserInfo",
}

export interface AuthStepPayload {
  user_id?: number
  phone_number?: string
  email?: string
  emailOrPhone?: string
  nextStep: EAuthStep
}
