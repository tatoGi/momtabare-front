import { defineStore } from 'pinia';
import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import type { IUser } from '../ts/models/user-types';
import { getUser, updateUserProfile, uploadUserAvatar } from '../services/user';
import AxiosJSON from '../utils/helpers/axios';
import { useAuthStore } from './auth.pinia';
import { getLocalizedApiUrl } from '../utils/config/env';
import { getCurrentLocale } from '../services/user';

// Define the store type
type UserStore = {
  // State
  user: Ref<IUser | null>;
  showAuthDialog: Ref<boolean>;
  isAuthenticating: Ref<boolean>;
  isAuthenticated: Ref<boolean>;
  isInitialized: Ref<boolean>;

  // Getters
  currentUser: ComputedRef<IUser | null>;
  authDialog: ComputedRef<boolean>;
  authenticating: ComputedRef<boolean>;
  authenticated: ComputedRef<boolean>;
  initialized: ComputedRef<boolean>;
  isRetailer: ComputedRef<boolean>;
  isApprovedRetailer: ComputedRef<boolean>;
  retailerStatus: ComputedRef<string | null>;

  // Actions
  clearAuth(): Promise<void>;
  initializeAuth(): Promise<void>;
  setAuthenticatedUser(userData: IUser, accessToken: string, refreshToken?: string): void;
  updateProfile(profileData: Partial<IUser>): Promise<void>;
  updateAvatar(avatarFile: File): Promise<string>;
  setAuthDialog(show: boolean): void;
};

export const useUserStore = defineStore('user', (): UserStore => {
  // State
  const user = ref<IUser | null>(null);
  const showAuthDialog = ref(false);
  const isAuthenticating = ref(false);
  const isAuthenticated = ref(false);
  const isInitialized = ref(false);
  
  // Concurrency lock to avoid duplicate init calls
  let initPromise: Promise<void> | null = null;

  // Getters
  const currentUser = computed(() => user.value);
  const authDialog = computed(() => showAuthDialog.value);
  const authenticating = computed(() => isAuthenticating.value);
  const authenticated = computed(() => isAuthenticated.value);
  const initialized = computed(() => isInitialized.value);
  const isRetailer = computed(() => Boolean(user.value?.is_retailer));
  const isApprovedRetailer = computed(() => 
    Boolean(user.value?.is_retailer && user.value?.retailer_status === 'approved')
  );
  const retailerStatus = computed(() => user.value?.retailer_status || null);

  // Actions
  async function clearAuth(): Promise<void> {
    try {
      const authStore = useAuthStore();
      authStore.clearToken();

      localStorage.removeItem('refresh_token');
      delete AxiosJSON.defaults.headers.common['Authorization'];
      user.value = null;
      isAuthenticated.value = false;
      isInitialized.value = false;
    } catch (e) {
      console.warn('Failed to clear auth data:', e);
    }
  }

  async function initializeAuth(): Promise<void> {
    if (initPromise) {
      return initPromise;
    }

    initPromise = (async () => {
      try {
        const authStore = useAuthStore();
        const storedToken = authStore.token || localStorage.getItem('auth_token') || localStorage.getItem('user_auth_token');

        if (storedToken) {
          // Sync token into auth store to ensure reactivity and persistence
          if (!authStore.token) {
            authStore.setToken(storedToken);
          }
          AxiosJSON.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          try {
            // Ensure Sanctum session/CSRsF cookie is set before calling protected endpoints
            try {
              const locale = getCurrentLocale();
              await AxiosJSON.get(getLocalizedApiUrl('/sanctum/csrf-cookie', locale));
            } catch (csrfErr) {
              console.warn('Failed to establish CSRF cookie:', csrfErr)
            }
            const userData = await getUser();
            if (userData) {
              setAuthenticatedUser(userData, storedToken);
            } else {
              console.warn('No user data received while restoring session');
            }
          } catch (err: any) {
            // Only clear auth if backend explicitly says the token is invalid (401)
            const status = err?.response?.status;
            if (status === 401) {
              await clearAuth();
            } else {
              console.warn('Non-fatal error while restoring user, keeping token:', err);
            }
          }
        }
      } catch (error) {
        // Do not eagerly clear auth on generic errors (e.g., network)
        console.error('Error initializing auth (not clearing token):', error);
      } finally {
        isInitialized.value = true;
        initPromise = null; // Reset the promise
      }
    })();

    return initPromise;
  }

  function setAuthenticatedUser(userData: IUser, accessToken: string, refreshToken?: string): void {
    const authStore = useAuthStore();
    authStore.setToken(accessToken);

    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }

    user.value = userData;
    isAuthenticated.value = true;
  }

  async function updateProfile(profileData: Partial<IUser>): Promise<void> {
    if (!user.value) {
      throw new Error('User not authenticated');
    }
    try {
      const updatedUser = await updateUserProfile(profileData);
      user.value = { ...user.value, ...updatedUser };
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  async function updateAvatar(avatarFile: File): Promise<string> {
    if (!user.value) {
      throw new Error('User not authenticated');
    }
    try {
      const updatedUser = await uploadUserAvatar(avatarFile);
      if (updatedUser) {
        user.value = updatedUser;
        return updatedUser.avatar || '';
      }
      throw new Error('Failed to upload avatar');
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw error;
    }
  }

  function setAuthDialog(show: boolean): void {
    showAuthDialog.value = show;
  }

  // Watch for auth store token changes
  watch(() => {
    const authStore = useAuthStore();
    return authStore.token;
  }, async (newToken: string | null) => {
    if (newToken) {
      // Token was set, make sure axios has it
      AxiosJSON.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      // Token was cleared, clear user state
      user.value = null;
      isAuthenticated.value = false;
      delete AxiosJSON.defaults.headers.common['Authorization'];
    }
  }, { immediate: true });

  return {
    // State
    user,
    showAuthDialog,
    isAuthenticating,
    isAuthenticated,
    isInitialized,
    
    // Getters
    currentUser,
    authDialog,
    authenticating,
    authenticated,
    initialized,
    isRetailer,
    isApprovedRetailer,
    retailerStatus,
    
    // Actions
    clearAuth,
    initializeAuth,
    setAuthenticatedUser,
    updateProfile,
    updateAvatar,
    setAuthDialog
  };
});

// Export the store type for type safety in components
export type { UserStore };