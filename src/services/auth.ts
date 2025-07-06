import {
  ICompleteRegistrationParams,
  ICompleteRegistrationResponse,
  IRegisterParams,
  IRegisterResponse,
  IResendVerificationCodeParams,
  IResendVerificationCodeResponse,
  ISignInParams,
  ISignInResponse,
  ISignOutResponse,
  IVerifyCodeParams,
  IVerifyCodeResponse,
} from "../ts/services/auth.types.ts"
import AxiosJSON from "../utils/helpers/axios.ts"

export async function register(
  params: IRegisterParams,
): Promise<IRegisterResponse | null> {
  try {
    const response = await AxiosJSON.post<IRegisterResponse>(
      "/register",
      params,
    )
    return response.data
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function verifyPhone(
  params: IVerifyCodeParams,
): Promise<IVerifyCodeResponse | null> {
  try {
    const response = await AxiosJSON.post<IVerifyCodeResponse>(
      "/verify-phone",
      params,
    )
    return response.data
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function resendPhoneVerificationCode(
  params: IResendVerificationCodeParams,
): Promise<IResendVerificationCodeResponse | null> {
  try {
    const response = await AxiosJSON.post<IResendVerificationCodeResponse>(
      "/resend-phone-verification-code",
      params,
    )
    return response.data
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function verifyEmail(
  params: IVerifyCodeParams,
): Promise<IVerifyCodeResponse | null> {
  try {
    const response = await AxiosJSON.post<IVerifyCodeResponse>(
      "/verify-email",
      params,
    )
    return response.data
  } catch (error: any) {
    throw error.response.data.message
  }
}

export async function resendEmailVerificationCode(
  params: IResendVerificationCodeParams,
): Promise<IResendVerificationCodeResponse | null> {
  try {
    const response = await AxiosJSON.post<IResendVerificationCodeResponse>(
      "/resend-email-verification-code",
      params,
    )
    return response.data
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function completeRegistration(
  params: ICompleteRegistrationParams,
): Promise<ICompleteRegistrationResponse | null> {
  try {
    const response = await AxiosJSON.post<ICompleteRegistrationResponse>(
      "/complete-registration",
      params,
    )
    const data = response.data
    if (data.token) localStorage.setItem("user_auth_token", data.token)

    return data
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function signIn(
  params: ISignInParams,
): Promise<ISignInResponse | null> {
  try {
    const response = await AxiosJSON.post<ISignInResponse>("/login", params)
    const data = response.data
    if (data.token) localStorage.setItem("user_auth_token", data.token)

    return data
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function signOut(): Promise<ISignOutResponse | null> {
  try {
    const response = await AxiosJSON.post<ISignOutResponse>("/logout")
    localStorage.removeItem("user_auth_token")
    return response.data
  } catch (error) {
    console.log(error)
    return null
  }
}
