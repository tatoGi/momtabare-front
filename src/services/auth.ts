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
        localStorage.setItem('refresh_token', refreshToken);
        console.log('🔄 Storing refresh token');
      } else {
        console.warn('⚠️ No refresh token found in response');
      }
      
      // Update axios defaults with the new token IMMEDIATELY
      AxiosJSON.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Ensure the token is set in the auth store
      authStore.setToken(token);
      
      // Force a synchronous update of the axios instance
      console.log('🔧 Setting axios default Authorization header:', `Bearer ${token.substring(0, 20)}...`);
      
      console.log('✅ Tokens processed and stored successfully');
      
      // Return the token data
      return { 
        token, 
        refreshToken,
        user: data?.data?.user || data?.user 
      };
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
      getLocalizedApiUrl('/send-registration-email'),
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
      getLocalizedApiUrl('/complete-registration'),
      restParams
    );
    
    const data = response.data;
    
    // Process the token and user data from the response
    const { token, user } = await setTokenFromResponseData(data);
    
    if (user) {
      try {
        const { useUserStore } = await import('@/pinia/user.pinia');
        const userStore = useUserStore();
        userStore.setAuthenticatedUser(user, token || '');
      } catch (e) {
        console.error('❌ Failed to set user in store after registration:', e);
      }
    } else {
      console.warn('⚠️ No user data found in registration response');
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
      getLocalizedApiUrl('/login'),
      params,
      { withCredentials: true }
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
    
    // Debug: Log the received token
    console.log('🔑 Received token from login:', token.substring(0, 20) + '...');
    console.log('📋 Full response data:', responseData);
    
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
        console.warn('CSRF cookie fetch failed, continuing...', csrfErr);
      }
      
      // Add a small delay to ensure axios headers are properly set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentUser = await getUser()
      if (currentUser) {
        userStore.setAuthenticatedUser(currentUser, token)
      }
    } catch (e) {
      console.warn('Failed to fetch user after sign-in (will rely on init):', e)
    }

    // Clear console and refresh page after successful login
    console.clear();
    
    // Add a small delay to ensure token is properly set before reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
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
export async function resendEmailVerificationCode(
  emailOrParams: string | { user_id: number }
): Promise<{ success: boolean; message: string }> {
  try {
    let requestData: any = {};
    
    // Handle both string and object parameters
    if (typeof emailOrParams === 'string') {
      requestData.email = emailOrParams;
    } else if (emailOrParams.user_id) {
      requestData.user_id = emailOrParams.user_id;
    } else {
      throw new Error('Email or user_id is required');
    }

    const response = await AxiosJSON.post(
      getLocalizedApiUrl('/resend-email-verification'),
      requestData
    );
    
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
export async function verifyCode(
  email: string,
  code: string,
  userId?: number
): Promise<{ success: boolean; message: string; user_id?: number }> {
  if (!code) {
    throw new Error('The verification code field is required.');
  }
  
  if (!userId) {
    throw new Error('User ID is required for verification');
  }

  try {
    const requestData: any = {
      user_id: userId,
      verification_code: code
    };
    console.log('📤 Sending verification data:', requestData);

    // Add email if available (though user_id should be sufficient)
    if (email) {
      requestData.email = email;
    }

    // Update the endpoint to match your backend route
    const response = await AxiosJSON.post(
      getLocalizedApiUrl('/verify-email-code'),
      requestData
    );
    
    // Handle successful verification
    // Check for both success flag and direct message indicating success
    if (response.data?.success || response.data?.message?.includes('successfully')) {
      if (response.data.token) {
        await setTokenFromResponseData(response.data);
      }
      return { 
        success: true,
        message: response.data?.message || 'Email verified successfully',
        user_id: response.data?.user_id || userId
      };
    }
    
    // Only throw error if we don't have a success case
    throw new Error(response.data?.message || 'Verification failed');
  } catch (error: any) {
    console.error('❌ Email verification failed:', error);
    // Return a more detailed error message including the original error
    const errorMessage = error.response?.data?.message || error.message || 'Failed to verify email';
    throw new Error(errorMessage);
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
