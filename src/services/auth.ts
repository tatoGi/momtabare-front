import type {
  ICompleteRegistrationParams,
  ICompleteRegistrationResponse,
  IRegisterParams,
  IRegisterResponse,
  ISignInParams,
  ISignInResponse
} from "../ts/services/auth.types"
import AxiosJSON from "../utils/helpers/axios.ts"
import { getLocalizedApiUrl } from "@/utils/config/env"

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
      getLocalizedApiUrl('auth/register'),
      requestData
    )
    const data = response.data
    // Registration endpoint may not return access token; ignore if absent
    if ('token' in data || 'access_token' in data) {
      await setTokenFromResponseData(data);
    }
    return data;
  } catch (error: any) {
    throw error.response?.data?.message || "Registration failed";
  }
}

export async function completeRegistration(
  params: ICompleteRegistrationParams,
): Promise<ICompleteRegistrationResponse | null> {
  try {
    const { locale = 'en', ...restParams } = params;
    const response = await AxiosJSON.post<ICompleteRegistrationResponse>(
      getLocalizedApiUrl('auth/complete-registration'),
      restParams
    );
    const data = response.data;
    await setTokenFromResponseData(data);
    
    try {
      const [{ useUserStore }, { getUser }] = await Promise.all([
        import('@/pinia/user.pinia'),
        import('@/services/user'),
      ]);
      const userStore = useUserStore();
      const currentUser = await getUser();
      if (currentUser) {
        const token = localStorage.getItem('auth_token') || '';
        userStore.setAuthenticatedUser(currentUser, token);
      }
    } catch (e) {
      console.warn('Failed to fetch user after completeRegistration:', e);
    }
    
    return data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to complete registration";
  }
}

// Sign in with email/phone and password
export async function signIn(
  params: ISignInParams,
): Promise<ISignInResponse | null> {
  try {
    // First get CSRF cookie for Sanctum
    try {
      const { getLocalizedApiUrl } = await import('@/utils/config/env');
      await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'));
    } catch (e) {
      await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'));
    }
    const response = await AxiosJSON.post<ISignInResponse>(
      getLocalizedApiUrl('auth/login'),
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
        const { getLocalizedApiUrl } = await import('@/utils/config/env');
        await AxiosJSON.get(getLocalizedApiUrl('sanctum/csrf-cookie'));
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
      url: getLocalizedApiUrl('auth/login'),
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
        getLocalizedApiUrl('auth/logout'),
        {},
        { timeout: 5000 } // 5 second timeout to prevent hanging
      );
    } catch (error) {
      console.warn('⚠️ Server sign out failed, continuing with client cleanup...', error);
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
    
    // Clear auth store
    try {
      const { useAuthStore } = await import('@/pinia/auth.pinia');
      const authStore = useAuthStore();
      authStore.clearToken();
    } catch (e) {
      console.warn('Failed to clear auth store:', e);
    }
    
    console.log('✅ Signed out successfully');
    return { success: true, message: 'Signed out successfully' };
  } catch (error: any) {
    console.error('❌ Sign out error:', error);
    // Still try to clear local state even if there's an error
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_auth_token');
      delete AxiosJSON.defaults.headers.common['Authorization'];
    } catch (cleanupError) {
      console.error('Failed to clean up auth state during sign out error:', cleanupError);
    }
    
    throw error.response?.data?.message || 'An error occurred during sign out';
  }
}

// Resend email verification code
export async function resendEmailVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await AxiosJSON.post(getLocalizedApiUrl('email/verification-notification'), {
      email,
      redirect_url: window.location.origin
    });
    
    return {
      success: true,
      message: response.data?.message || 'Verification email sent successfully'
    };
  } catch (error: any) {
    console.error('❌ Failed to resend verification email:', error);
    throw error.response?.data?.message || 'Failed to resend verification email';
  }
}

// Verify email with verification code
export async function verifyCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await AxiosJSON.post(getLocalizedApiUrl('email/verify'), {
      email,
      code,
      redirect_url: window.location.origin
    });
    
    // If verification is successful, update auth state
    if (response.data?.success) {
      // If the response includes tokens, process them
      if (response.data.token || response.data.access_token) {
        await setTokenFromResponseData(response.data);
      }
      return { 
        success: true,
        message: response.data?.message || 'Email verified successfully'
      };
    }
    
    throw new Error(response.data?.message || 'Verification failed');
  } catch (error: any) {
    console.error('❌ Email verification failed:', error);
    throw new Error(error.response?.data?.message || 'Failed to verify email');
  }
}

// Verify phone number with verification code
export async function verifyPhone(phone: string, code: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await AxiosJSON.post(getLocalizedApiUrl('phone/verify'), {
      phone,
      code
    });
    
    // If verification is successful, update auth state
    if (response.data?.success) {
      // If the response includes tokens, process them
      if (response.data.token || response.data.access_token) {
        await setTokenFromResponseData(response.data);
      }
      return {
        success: true,
        message: response.data?.message || 'Phone number verified successfully'
      };
    }
    
    throw new Error(response.data?.message || 'Phone verification failed');
  } catch (error: any) {
    console.error('❌ Phone verification failed:', error);
    throw new Error(error.response?.data?.message || 'Failed to verify phone number');
  }
}
