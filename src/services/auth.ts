import type {
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
} from "../ts/services/auth.types"
import AxiosJSON from "../utils/helpers/axios.ts"
import { buildApiUrl } from "@/utils/api/apiUrlBuilder"

// Register with email or phone number
export async function register(
  params: IRegisterParams,
): Promise<IRegisterResponse | null> {
  try {
    const { locale = 'en', ...restParams } = params;
    
    // Filter out undefined values
    const requestData = Object.fromEntries(
      Object.entries(restParams).filter(([_, value]) => value !== undefined)
    );

    const response = await AxiosJSON.post<IRegisterResponse>(
      buildApiUrl('auth.register', locale),
      requestData
    )
    return response.data
  } catch (error: any) {
    console.error('🔐 Registration error:', {
      url: buildApiUrl('auth.register', params.locale || 'en'),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    throw error.response?.data?.message || "Registration failed"
  }
}

// Verify phone number with code
export async function verifyPhone(
  params: IVerifyCodeParams,
): Promise<IVerifyCodeResponse | null> {
  try {
    const { locale = 'en', ...restParams } = params;
    const response = await AxiosJSON.post<IVerifyCodeResponse>(
      buildApiUrl('auth.verifyPhone', locale),
      restParams,
    )
    const data = response.data
    const token = (data as any)?.token || (data as any)?.data?.token
    if (token) {
      localStorage.setItem("user_auth_token", token)
      localStorage.setItem("auth_token", token)
    }
    return data
  } catch (error: any) {
    console.error('📱 Phone verification error:', {
      url: buildApiUrl('auth.verifyPhone', params.locale || 'en'),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    throw error.response?.data?.message || "Phone verification failed"
  }
}

// Verify email with code
export async function verifyEmail(
  params: IVerifyCodeParams,
): Promise<IVerifyCodeResponse | null> {
  try {
    const { locale = 'en', ...restParams } = params;
    const response = await AxiosJSON.post<IVerifyCodeResponse>(
      buildApiUrl('auth.verifyEmail', locale),
      restParams,
    )
    const data = response.data
    const token = (data as any)?.token || (data as any)?.data?.token
    if (token) {
      localStorage.setItem("user_auth_token", token)
      localStorage.setItem("auth_token", token)
    }
    return data
  } catch (error: any) {
    console.error('📧 Email verification error:', {
      url: buildApiUrl('auth.verifyEmail', params.locale || 'en'),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    throw error.response?.data?.message || "Email verification failed"
  }
}

// Generic verify code endpoint (email code)
export async function verifyCode(
  params: IVerifyCodeParams,
): Promise<IVerifyCodeResponse | null> {
  try {
    const { locale = 'en', ...restParams } = params;
    const response = await AxiosJSON.post<IVerifyCodeResponse>(
      buildApiUrl('auth.verifyCode', locale),
      restParams,
    )
    const data = response.data
    const token = (data as any)?.token || (data as any)?.data?.token
    if (token) {
      localStorage.setItem("user_auth_token", token)
      localStorage.setItem("auth_token", token)
    }
    return data
  } catch (error: any) {
    throw error.response?.data?.message || "Verification failed"
  }
}

// Resend phone verification code
export async function resendPhoneVerificationCode(
  params: IResendVerificationCodeParams,
): Promise<IResendVerificationCodeResponse | null> {
  try {
    const { locale = 'en', ...restParams } = params;
    const response = await AxiosJSON.post<IResendVerificationCodeResponse>(
      buildApiUrl('auth.resendPhoneCode', locale),
      restParams,
    )
    console.log(response.data)
    return response.data
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to resend verification code"
  }
}

export async function resendEmailVerificationCode(
  params: IResendVerificationCodeParams,
): Promise<IResendVerificationCodeResponse | null> {
  try {
    const { locale = 'en', ...restParams } = params;
    const response = await AxiosJSON.post<IResendVerificationCodeResponse>(
      buildApiUrl('auth.resendEmailCode', locale),
      restParams,
    )
    return response.data
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to resend verification code"
  }
}

export async function completeRegistration(
  params: ICompleteRegistrationParams,
): Promise<ICompleteRegistrationResponse | null> {
  try {
    const { locale = 'en', ...restParams } = params;
    const response = await AxiosJSON.post<ICompleteRegistrationResponse>(
      buildApiUrl('auth.completeRegistration', locale),
      restParams,
    )
    const data = response.data
    const token = (data as any)?.access_token || (data as any)?.data?.access_token
   
    if (token) {
      localStorage.setItem("user_auth_token", token)
      localStorage.setItem("auth_token", token)
    }

    return data
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to complete registration"
  }
}

// Sign in with email/phone and password
export async function signIn(
  params: ISignInParams,
  locale: string = 'en',
): Promise<ISignInResponse | null> {
  try {
    // First get CSRF cookie for Sanctum
    await AxiosJSON.get('/sanctum/csrf-cookie')
    
    const response = await AxiosJSON.post<ISignInResponse>(
      buildApiUrl('auth.signIn', locale),
      params,
    )
    console.log('Login response:', response.data)
    
    // Extract token from various possible response structures
    const token = response.data.data?.token || 
                  response.data.data?.access_token ||
                  response.data.token ||
                  response.data.access_token

    console.log('Auth token:', token)
   
    if (token) {
      localStorage.setItem("user_auth_token", token)
      localStorage.setItem("auth_token", token)
      // Set default auth header for all future requests
      AxiosJSON.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return response.data
    } else {
      console.warn('No token found in login response', response.data)
      throw new Error('Authentication failed: No token received')
    }
  } catch (error: any) {
    console.error('🔑 Sign in error:', {
      url: buildApiUrl('auth.signIn', locale),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    throw error.response?.data?.message || "Sign in failed"
  }
}

// Sign out user
export async function signOut(): Promise<ISignOutResponse | null> {
  try {
    const response = await AxiosJSON.post<ISignOutResponse>(
      buildApiUrl('auth.signOut'),
      {},
    )
    localStorage.removeItem("user_auth_token")
    localStorage.removeItem("auth_token")
    return response.data
  } catch (error: any) {
    localStorage.removeItem("user_auth_token")
    localStorage.removeItem("auth_token")
    throw error.response?.data?.message || "Sign out failed"
  }
}
