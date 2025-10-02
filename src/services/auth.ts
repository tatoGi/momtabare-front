import type {
  ICompleteRegistrationParams,
  ICompleteRegistrationResponse,
  IRegisterParams,
  IRegisterResponse,
  IResendVerificationCodeParams,
  IResendVerificationCodeResponse,
  ISignInParams,
  ISignInResponse,
  IVerifyCodeParams,
  IVerifyCodeResponse,
} from "../ts/services/auth.types"
import AxiosJSON from "../utils/helpers/axios.ts"
import { buildApiUrl } from "@/utils/api/apiUrlBuilder"

// Helper: set tokens via Pinia auth store (persisted) if response contains them
async function setTokenFromResponseData(data: any) {
  try {
    // Extract tokens from different possible response formats
    const token = data?.data?.token || data?.data?.access_token || data?.token || data?.access_token;
    const refreshToken = data?.data?.refresh_token || data?.refresh_token || data?.data?.refreshToken || data?.refreshToken;

    if (token) {
      const { useAuthStore } = await import('@/pinia/auth.pinia');
      const { default: AxiosJSON } = await import('@/utils/helpers/axios');
      const authStore = useAuthStore();
      
      // Store tokens in localStorage
      localStorage.setItem('auth_token', token);
      
      if (refreshToken) {
        console.log('🔄 Storing refresh token');
        localStorage.setItem('refresh_token', refreshToken);
      } else {
        console.warn('⚠️ No refresh token found in response');
      }
      
      // Update axios defaults
      AxiosJSON.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set the token in the auth store
      authStore.setToken(token);
      
      console.log('✅ Tokens processed and stored successfully');
      
      return { token, refreshToken };
    } else {
      throw new Error('No access token found in response');
    }
  } catch (e) {
    console.error('❌ Failed to set tokens from response:', e);
    // Clear any partial auth state
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    throw e; // Re-throw to handle in the calling function
  }
}

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
    const data = response.data
    await setTokenFromResponseData(data)
    // Fetch current user to reflect retailer flags immediately
    try {
      const [{ useUserStore }, { getUser }] = await Promise.all([
        import('@/pinia/user.pinia'),
        import('@/services/user'),
      ])
      const userStore = useUserStore()
      const currentUser = await getUser()
      if (currentUser) {
        const token = localStorage.getItem('auth_token') || ''
        userStore.setAuthenticatedUser(currentUser, token)
      }
    } catch (e) {
      console.warn('Failed to fetch user after register:', e)
    }
    return data
  } catch (error: any) {
    console.error('🔐 Registration error:', {
      url: buildApiUrl('auth.register', params.locale || 'en'),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    // Throw the full error response to preserve validation errors
    throw error.response?.data || { message: "Registration failed" }
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
    await setTokenFromResponseData(data)
    try {
      const [{ useUserStore }, { getUser }] = await Promise.all([
        import('@/pinia/user.pinia'),
        import('@/services/user'),
      ])
      const userStore = useUserStore()
      const currentUser = await getUser()
      if (currentUser) {
        const token = localStorage.getItem('auth_token') || ''
        userStore.setAuthenticatedUser(currentUser, token)
      }
    } catch (e) {
      console.warn('Failed to fetch user after verifyPhone:', e)
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
    await setTokenFromResponseData(data)
    try {
      const [{ useUserStore }, { getUser }] = await Promise.all([
        import('@/pinia/user.pinia'),
        import('@/services/user'),
      ])
      const userStore = useUserStore()
      const currentUser = await getUser()
      if (currentUser) {
        const token = localStorage.getItem('auth_token') || ''
        userStore.setAuthenticatedUser(currentUser, token)
      }
    } catch (e) {
      console.warn('Failed to fetch user after verifyEmail:', e)
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
    await setTokenFromResponseData(data)
    try {
      const [{ useUserStore }, { getUser }] = await Promise.all([
        import('@/pinia/user.pinia'),
        import('@/services/user'),
      ])
      const userStore = useUserStore()
      const currentUser = await getUser()
      if (currentUser) {
        const token = localStorage.getItem('auth_token') || ''
        userStore.setAuthenticatedUser(currentUser, token)
      }
    } catch (e) {
      console.warn('Failed to fetch user after verifyCode:', e)
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
    await setTokenFromResponseData(data)
    try {
      const [{ useUserStore }, { getUser }] = await Promise.all([
        import('@/pinia/user.pinia'),
        import('@/services/user'),
      ])
      const userStore = useUserStore()
      const currentUser = await getUser()
      if (currentUser) {
        const token = localStorage.getItem('auth_token') || ''
        userStore.setAuthenticatedUser(currentUser, token)
      }
    } catch (e) {
      console.warn('Failed to fetch user after completeRegistration:', e)
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
    try {
      const { getCurrentLocale } = await import('@/services/user');
      const { getLocalizedApiUrl } = await import('@/utils/config/env');
      const locale = getCurrentLocale();
      await AxiosJSON.get(getLocalizedApiUrl('/sanctum/csrf-cookie', locale));
    } catch (e) {
      await AxiosJSON.get(getLocalizedApiUrl('/sanctum/csrf-cookie', locale));
    }
    const response = await AxiosJSON.post<ISignInResponse>(
      buildApiUrl('auth.signIn', locale),
      params,
    );
    
    // Extract response data (handle different response formats)
    const responseData = response.data?.data || response.data;
    
    if (!responseData) {
      throw new Error('No data in sign-in response');
    }
    
    // Process and store tokens
    const { token } = await setTokenFromResponseData(responseData);
    
    if (!token) {
      throw new Error('No access token received');
    }
    
    // Fetch current user and persist into user store so role/retailer flags are up-to-date
    try {
      const [{ useUserStore }, { getUser }] = await Promise.all([
        import('@/pinia/user.pinia'),
        import('@/services/user'),
      ])
      const userStore = useUserStore()
      
      // Ensure CSRF cookie is set before calling /me
      try {
        const { getCurrentLocale } = await import('@/services/user');
        const { getLocalizedApiUrl } = await import('@/utils/config/env');
        const locale = getCurrentLocale();
        await AxiosJSON.get(getLocalizedApiUrl('/sanctum/csrf-cookie', locale));
      } catch (csrfErr) {
        try { await AxiosJSON.get('/sanctum/csrf-cookie'); } catch {}
      }
      
      const currentUser = await getUser()
      if (currentUser) {
        userStore.setAuthenticatedUser(currentUser, token)
      }
    } catch (e) {
      console.warn('Failed to fetch user after sign-in (will rely on init):', e)
    }

    // Clear console and refresh page after successful login
    console.clear();
    window.location.reload();
    
    // Return the complete response data
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Sign in failed";
    
    console.error('❌ Sign in error:', {
      url: buildApiUrl('auth.signIn', locale),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      error: errorMessage
    });
    
    // Clear any partial auth state on error
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      delete AxiosJSON.defaults.headers.common['Authorization'];
    } catch (cleanupError) {
      console.error('Failed to clean up auth state:', cleanupError);
    }
    
    throw errorMessage;
  }
}

// Sign out user
export async function signOut(): Promise<{ success: boolean; message: string }> {
  try {
    // Try to call the server-side sign out endpoint
    try {
      await AxiosJSON.post(
        buildApiUrl('auth.signOut'),
        {},
        { timeout: 5000 } // 5 second timeout to prevent hanging
      );
    } catch (serverError) {
      console.warn('⚠️ Server sign out failed, continuing with client cleanup...', serverError);
      // Continue with client-side cleanup even if server sign out fails
    }
    
    // Clear all auth data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_auth_token');
    
    // Clear session storage if used
    sessionStorage.removeItem('auth_state');
    
    // Clear axios auth header
    try {
      delete AxiosJSON.defaults.headers.common['Authorization'];
    } catch (e) {
      console.warn('Failed to clear axios auth header:', e);
    }
    
    // Clear auth store if available
    try {
      const { useAuthStore } = await import('@/pinia/auth.pinia');
      const authStore = useAuthStore();
      if (typeof authStore.clearToken === 'function') {
        authStore.clearToken();
      }
    } catch (e) {
      console.warn('Failed to clear auth store:', e);
    }
    
    console.log('✅ Sign out completed successfully');
    return { success: true, message: 'Successfully signed out' };
  } catch (error: any) {
    console.error('❌ Sign out error:', {
      message: error.message,
      response: error.response?.data
    });
    
    // Still try to clear local state even if there's an error
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_auth_token');
      delete AxiosJSON.defaults.headers.common['Authorization'];
    } catch (cleanupError) {
      console.error('Failed to clean up auth state during sign out error:', cleanupError);
    }
    
    throw error.response?.data?.message || "Sign out failed";
  }
}
function getLocalizedApiUrl(path: string, locale: string): string {
  // If the path already contains a locale prefix, return as is
  if (path.startsWith(`/${locale}/`)) {
    return path;
  }
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Prepend locale to the path
  return `/${locale}/${cleanPath}`;
}

