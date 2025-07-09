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

export async function register() {
  return { success: true, user: { id: 1, name: 'Demo User' } };
}

export async function verifyPhone() {
  return { success: true };
}

export async function resendPhoneVerificationCode() {
  return { success: true };
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

export async function signIn() {
  return { success: true, token: 'demo-token', user: { id: 1, name: 'Demo User' } };
}

export async function signOut() {
  return { success: true };
}
