<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from "vue-router";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseIcon from "@/components/base/BaseIcon.vue";
import AuthDialog from "@/components/dialogs/AuthDialog.vue";
import SignInComponent from "@/components/auth/SignInComponent.vue";
import SignUpEmailComponent from "@/components/auth/SignUpEmailComponent.vue";
import SignUpPhoneNumberComponent from "@/components/auth/SignUpPhoneNumberComponent.vue";
import SignUpUserInfoComponent from "@/components/auth/SignUpUserInfoComponent.vue";
import EmailVerification from "@/components/auth/EmailVerification.vue";
import PhoneVerification from "@/components/auth/PhoneVerification.vue";
import HeaderProductMenu from "@/components/header/HeaderProductMenu.vue";
import HeaderSearchComponent from "@/components/header/HeaderSearchComponent.vue";
import { useUserStore } from "@/pinia/user.pinia";
import { useCartStore } from "@/pinia/cart.pinia";
import { useNavigation } from "@/composables/useNavigation";
import { cities } from "@/constants/cities";
import { EAuthStep } from "@/ts/auth.types";
import type { AuthStepPayload } from "@/ts/auth.types";
import cartsvg from "@/assets/svg/cart.svg";
import heartsvg from "@/assets/svg/heart.svg";
import usersvg from "@/assets/img/usersvg.svg";
import { signOut } from '@/services/auth.ts';
import { getAssetUrl } from '@/utils/config/env';
import { requestRetailerPermission } from '@/services/retailer.ts';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();

// Initialize navigation
useNavigation();

const showMobileSearch = ref(false);
const showCityModal = ref(false);
const showMobileAuth = ref(false);

// Mobile auth step management
const mobileAuthStep = ref<string>(EAuthStep.SIGN_IN);
const mobileAuthUserId = ref<number | null>(null);
const mobileAuthEmailOrPhone = ref<string>('');

// Get user from store
const user = computed(() => userStore.user);

// Cart count - reactive to store changes
const cartItems = computed(() => cartStore.getCartLength);

// Get retailer status from store
const isApprovedRetailer = computed(() => userStore.isApprovedRetailer)
const isPendingRetailer = computed(() => userStore.user?.retailer_status === 'pending' || false)
const canRequestRetailer = computed(() => !isApprovedRetailer.value && !isPendingRetailer.value)

// Initialize cart when component mounts
onMounted(async () => {
  // Fetch cart data if user is authenticated
  if (userStore.authenticated && userStore.user) {
    await cartStore.fetchCart()
  }
})

// Watch for user authentication changes
watch(() => userStore.authenticated, async (isAuthenticated: boolean) => {
  if (isAuthenticated && userStore.user) {
    await cartStore.fetchCart()
  } else {
    cartStore.clearCart()
  }
})





// Mobile search form data
const mobileSearchName = ref<string>('');
const mobileSearchCity = ref<string>('');
const mobileSearchDate = ref<string>('');

// User dropdown state (desktop)
const showUserDropdown = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)

function userInitial(): string {
  const firstName = user.value?.first_name?.trim() || ''
  const lastName = user.value?.last_name?.trim() || user.value?.surname?.trim() || ''
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U'
}

// Get user avatar URL
function getUserAvatarUrl(): string | null {
  // Check both avatar and profile_picture fields for compatibility
  const avatarPath = user.value?.avatar || user.value?.profile_picture
  if (avatarPath) {
    return getAssetUrl(`/storage/${avatarPath}`)
  }
  return null
}

function userFullName(): string {
  const first = user.value?.first_name?.trim() || ''
  const last = (user.value as any)?.last_name?.trim?.() || ''
  return [first, last].filter(Boolean).join(' ')
}

async function handleSignOutClick() {
  try {
    await signOut()
  } catch (e) {
    console.warn('signOut failed', e)
  } finally {
    localStorage.removeItem('user_auth_token')
    userStore.clearAuth()
    showUserDropdown.value = false
  }
}

// Note: You can add global click listeners if you want outside-click to close
// the dropdown. Keeping it simple for now (toggle to open/close).
function routeToCart(): void {
  console.log('🛒 Navigating to cart')
  router.push({ name: "cart" });
}

function routeToFavorites(): void {
  console.log('❤️ Navigating to favorites')
  router.push({ name: "favorite" });
}

async function handleRetailerRequest(): Promise<void> {
  try {
    const result = await requestRetailerPermission()
    if (result.success) {
      // Re-initialize auth to get updated user data
      await userStore.initializeAuth()
      console.log('Retailer request submitted successfully:', result.message)
      showUserDropdown.value = false // Close dropdown after request
    } else {
      console.error('Failed to submit retailer request:', result.message)
    }
  } catch (error) {
    console.error('Error submitting retailer request:', error)
  }
}

// Cart items are now reactive via computed property - no manual subscription needed

// Toggle mobile search dropdown
function toggleMobileSearch() {
  showMobileSearch.value = !showMobileSearch.value;
  // Prevent body scroll when mobile search is open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = showMobileSearch.value ? 'hidden' : '';
  }
}

// Handle mobile search
function handleMobileSearch() {
  const query: Record<string, string> = {};
  
  if (mobileSearchName.value) query.search = mobileSearchName.value;
  if (mobileSearchCity.value) query.location = mobileSearchCity.value;
  if (mobileSearchDate.value) {
    // Assuming the date input gives us a date string, we might need to format it
    query.start_date = mobileSearchDate.value;
  }
  
  router.push({ name: "products", query });
  showMobileSearch.value = false;
  document.body.style.overflow = '';
}

// Close mobile search
function closeMobileSearch() {
  showMobileSearch.value = false;
  document.body.style.overflow = '';
}

// Toggle mobile auth overlay
function toggleMobileAuth() {
  showMobileAuth.value = !showMobileAuth.value;
  // Prevent body scroll when mobile auth is open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = showMobileAuth.value ? 'hidden' : '';
  }
}

// Close mobile auth
function closeMobileAuth() {
  showMobileAuth.value = false;
  document.body.style.overflow = '';
  // Reset auth step when closing
  setTimeout(() => {
    mobileAuthStep.value = EAuthStep.SIGN_IN;
  }, 500);
}

// Handle mobile auth step transitions
const handleMobileAuthStep = (payload: AuthStepPayload): void => {
  const { nextStep, user_id, email, phone_number } = payload;
  
  if (nextStep === EAuthStep.VERIFY_EMAIL || nextStep === EAuthStep.VERIFY_PHONE) {
    mobileAuthUserId.value = user_id || null;
    
    if (email) {
      mobileAuthEmailOrPhone.value = email;
    } else if (phone_number) {
      mobileAuthEmailOrPhone.value = phone_number;
    }
  }
  
  mobileAuthStep.value = nextStep;
  
  // Scroll to top when changing steps
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle successful registration
const handleRegistrationComplete = () => {
  closeMobileAuth();
  // Refresh user data if needed
  userStore.initializeAuth();
}

// Toggle city modal
function toggleCityModal() {
  showCityModal.value = !showCityModal.value;
}

// Select city and close modal
function selectCity(city: string) {
  mobileSearchCity.value = city;
  showCityModal.value = false;
}
</script>

<template>
  <header class="bg-white container md:border-b-0 border-b-2 border-gray-200 dark:border-gray-700">
    <!-- Desktop Header -->
    <div class="hidden md:flex flex-row items-center justify-between max-w-7xl  py-2">
      <!-- Categories Dropdown -->
      <div class="dropdown-category">
        <HeaderProductMenu />
      </div>
      
      <!-- Search Bar -->
      <div class="flex-1" :style="{marginLeft: '53px' }">
        <div class="search-header" style="width: 804px; height: 68px; border-radius: 100px; padding-right: 8px;">
          <HeaderSearchComponent />
        </div>
      </div>
      
      <!-- Desktop Icons -->
      <div class="flex items-center gap-6">
        <button class="relative p-2" @click="routeToFavorites">
          <img :src="heartsvg" alt="favorites" class="w-6 h-6" />
        </button>
        
        <button class="relative p-2" @click="routeToCart">
          <img :src="cartsvg" alt="cart" class="w-6 h-6" />
          <span 
            v-if="cartItems"
            class="absolute -top-1 -right-1 bg-customRed text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {{ cartItems }}
          </span>
        </button>
        
        <div class="relative" v-if="user">
          <button
            class="flex items-center gap-2 rounded-full border border-gray-200 bg-[#F8F8F8] px-3 py-1.5 shadow-sm relative"
            @click.stop="showUserDropdown = !showUserDropdown"
          >
            <div class="relative">
              <div class="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-customRed text-white font-semibold">
                <img 
                  v-if="getUserAvatarUrl()" 
                  :src="getUserAvatarUrl()" 
                  :alt="user?.first_name || 'User'"
                  class="w-full h-full object-cover"
                />
                <span v-else>
                  {{ userInitial() }}
                </span>
              </div>
              <!-- Online/Offline Status Indicator -->
              <span 
                class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                :class="userStore.authenticated ? 'bg-green-500' : 'bg-red-500'"
                :title="userStore.authenticated ? 'Online' : 'Offline'"
              ></span>
            </div>
            <span class="hidden lg:inline text-sm font-semibold">{{ user.value?.first_name }}</span>
          </button>
          <div
            v-if="showUserDropdown"
            ref="userDropdownRef"
            class="absolute right-0 top-12 z-10 w-64 rounded-2xl border border-gray-200 bg-white shadow-lg"
            :class="canRequestRetailer || isPendingRetailer ? 'p-3' : 'p-3'"
            @click.stop
          >
            <div class="mb-2 flex items-center justify-between">
              <p class="text-sm text-gray-500">მომხმარებელი</p>
              <div class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full" :class="userStore.authenticated ? 'bg-green-500' : 'bg-red-500'"></span>
                <span class="text-xs text-gray-500">{{ userStore.authenticated ? 'აქტიური' : 'არააქტიური' }}</span>
              </div>
            </div>
            <div class="mb-3">
              <p class="text-base font-semibold">{{ userFullName() }}</p>
            </div>
            
            <!-- Retailer Request Button -->
            <button 
              v-if="canRequestRetailer"
              class="mb-3 w-full rounded-xl bg-customBlue py-2 text-white font-semibold text-sm"
              @click="handleRetailerRequest"
            >
              გახდი გამქირავებელი
            </button>
            
            <!-- Pending Retailer Status -->
            <button 
              v-else-if="isPendingRetailer"
              class="mb-3 w-full rounded-xl bg-yellow-500 py-2 text-white font-semibold text-sm"
              disabled
            >
              მოთხოვნა განიხილება
            </button>
            
            <!-- Rent Product Button (for non-retailers or approved retailers) -->
          
            <ul class="space-y-1 text-sm">
              <li>
                <button class="w-full rounded-lg px-2 py-2 text-left hover:bg-gray-100" @click="router.push('/user')">ჩემი პროფილი</button>
              </li>
              <li>
                <button class="w-full rounded-lg px-2 py-2 text-left hover:bg-gray-100 flex items-center gap-2" @click="router.push('/chat')">
                  <BaseIcon name="chat" :size="16" class="text-gray-600" />
                  <span>შეტყობინებები</span>
                </button>
              </li>
              <li>
                <button class="w-full rounded-lg px-2 py-2 text-left hover:bg-gray-100" @click="router.push('/user/orders')">ჩემი შეკვეთები</button>
              </li>
              <li>
                <button class="w-full rounded-lg px-2 py-2 text-left hover:bg-gray-100" @click="router.push('/user')">ჩემი ბარათები</button>
              </li>
              <li class="pt-1 border-t mt-2">
                <button class="w-full rounded-lg px-2 py-2 text-left hover:bg-gray-100 text-red-600" @click="handleSignOutClick">გასვლა</button>
              </li>
            </ul>
          </div>
        </div>
        <div v-else>
          <AuthDialog>
            <BaseButton :height="40" :width="40" class="rounded-full bg-customRed">
              <BaseIcon :size="20" class="text-white" name="account_circle"/>
            </BaseButton>
          </AuthDialog>
        </div>
      </div>
    </div>
    
    <!-- Mobile Header -->
    <div class="md:hidden flex items-center justify-between w-full">
      <!-- Burger Menu -->
      <button @click="$emit('toggleMobileNav')" class="burger-menu flex items-center justify-center">
        <BaseIcon name="menu" :size="24" /> 
      </button>
      
      <!-- Search Button -->
      <button @click="toggleMobileSearch" class="search-button flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 17L13.889 13.8889M16.1111 8.55556C16.1111 12.7284 12.7284 16.1111 8.55556 16.1111C4.38274 16.1111 1 12.7284 1 8.55556C1 4.38274 4.38274 1 8.55556 1C12.7284 1 16.1111 4.38274 16.1111 8.55556Z" stroke="#141414" stroke-opacity="0.7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <!-- Favorite Button -->
      <button class="favorite-button flex items-center justify-center" @click="routeToFavorites">
        <img :src="heartsvg" alt="favorites" class="w-5 h-5" />
      </button>
      
      <!-- Cart Button -->
      <button class="relative cart-button flex items-center justify-center" @click="routeToCart">
        <img :src="cartsvg" alt="cart" class="w-5 h-5" />
        <span 
          v-if="cartItems"
          class="absolute -top-1 -right-1 bg-customRed text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center"
        >
          {{ cartItems }}
        </span>
      </button>
      
      <!-- User Button -->
      <div class="user-button flex items-center justify-center">
        <BaseButton
          v-if="user"
          :height="40"
          :width="40"
          class="rounded-full bg-customRed overflow-hidden"
          @click.left="router.push('/user')"
        >
          <img 
            v-if="getUserAvatarUrl()" 
            :src="getUserAvatarUrl()" 
            :alt="user?.first_name || 'User'"
            class="w-full h-full object-cover"
          />
          <span 
            v-else 
            class="text-white font-semibold text-sm"
          >
            {{ userInitial() }}
          </span>
        </BaseButton>
        
        <template v-else>
          <!-- Mobile: Use overlay -->
          <BaseButton 
            :height="40" 
            :width="40" 
            class="rounded-full bg-customRed md:hidden"
            @click="toggleMobileAuth"
          >
            <img :src="usersvg" alt="user" class="w-5 h-5" />
          </BaseButton>
      
        </template>
      </div>
      
    </div>
    
    <!-- Mobile Search Dropdown Overlay -->
    <div 
      v-if="showMobileSearch" 
      class="fixed inset-0 bg-black bg-opacity-0 z-40 md:hidden"
      @click="closeMobileSearch"
    >
      <div 
        class="fixed top-[150px] left-0 right-0 bottom-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-y-auto"
        @click.stop
      >
        <!-- Mobile Search Form -->
        <div class="container py-6">
          <h2 class="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Search</h2>
          
          <div class="space-y-4">
            <!-- Name Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Specify a name
              </label>
              <input
                v-model="mobileSearchName"
                type="text"
                placeholder="Enter name..."
                style="
                  width: 342px;
                  height: 64px;
                  border-radius: 12px;
                  padding: 18px 24px;
                  gap: 12px;
                  background: rgba(248, 248, 248, 1);
                  border: 1px solid #e5e7eb;
                  font-size: 16px;
                  color: #111827;
                  opacity: 1;
                "
                class="focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
              />
            </div>
            
            <!-- City/Region Select -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose a city/region
              </label>
              <button
                @click="toggleCityModal"
                style="
                  width: 342px;
                  height: 64px;
                  border-radius: 12px;
                  padding: 18px 24px;
                  gap: 12px;
                  background: rgba(248, 248, 248, 1);
                  border: 1px solid #e5e7eb;
                  font-size: 16px;
                  color: #111827;
                  opacity: 1;
                  text-align: left;
                  cursor: pointer;
                "
                class="focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
              >
                {{ mobileSearchCity || 'Select city/region...' }}
              </button>
            </div>
            
            <!-- Date Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose a date
              </label>
              <input
                v-model="mobileSearchDate"
                type="date"
                style="
                  width: 342px;
                  height: 64px;
                  border-radius: 12px;
                  padding: 18px 24px;
                  gap: 12px;
                  background: rgba(248, 248, 248, 1);
                  border: 1px solid #e5e7eb;
                  font-size: 16px;
                  color: #111827;
                  opacity: 1;
                "
                class="focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
              />
            </div>
            
            <!-- Search Button -->
            <div class="pt-4">
              <button
                @click="handleMobileSearch"
                class="search-button-mobile"
                style="
                  background: rgba(244, 64, 0, 1);
                  width: 340px;
                  height: 48px;
                  border-radius: 100px;
                  padding: 12px 24px 12px 32px;
                  gap: 8px;
                  opacity: 1;
                  color: white;
                  font-weight: 600;
                  font-size: 16px;
                  border: none;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto;
                  transition: all 0.2s ease;
                "
                @mouseover="(e) => (e.target as HTMLElement).style.transform = 'scale(1.02)'"
                @mouseout="(e) => (e.target as HTMLElement).style.transform = 'scale(1)'"
              >
                <BaseIcon :size="20" class="text-white mr-2" name="search" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile Auth Dropdown Overlay -->
    <div 
      v-if="showMobileAuth" 
      class="fixed inset-0 bg-black bg-opacity-0 z-40 md:hidden"
      @click="closeMobileAuth"
    >
      <div 
        class="fixed top-[150px] left-0 right-0 bottom-0 bg-white dark:bg-customBlack border-b border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-y-auto"
        @click.stop
      >
        <!-- Mobile Auth Form -->
        <div class="container py-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">ავტორიზაცია</h2>
            <button 
              @click="closeMobileAuth"
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Auth Components with Step Management -->
          <SignInComponent
            v-if="mobileAuthStep === EAuthStep.SIGN_IN"
            @close="closeMobileAuth"
            @next-step="handleMobileAuthStep"
          />
          
          <!-- Email Verification (full screen) -->
          <EmailVerification
            v-else-if="mobileAuthStep === EAuthStep.VERIFY_EMAIL"
            :show="true"
            :email="mobileAuthEmailOrPhone"
            :user-id="mobileAuthUserId || 0"
            @close="closeMobileAuth"
            @back="mobileAuthStep = EAuthStep.SIGN_UP_EMAIL"
            @registration-complete="handleRegistrationComplete"
          />
          
          <!-- Other auth steps -->
          <div v-else class="flex flex-col justify-between px-4 pb-9 pt-8">
            <SignUpPhoneNumberComponent
              v-if="mobileAuthStep === EAuthStep.SIGN_UP_PHONE_NUMBER"
              @next-step="handleMobileAuthStep"
            />
            <SignUpEmailComponent
              v-if="mobileAuthStep === EAuthStep.SIGN_UP_EMAIL"
              @next-step="handleMobileAuthStep"
            />
            <PhoneVerification
              v-if="mobileAuthStep === EAuthStep.VERIFY_PHONE"
              :phone-number="mobileAuthEmailOrPhone"
              :user-id="mobileAuthUserId || 0"
              @next-step="handleMobileAuthStep"
              @back="mobileAuthStep = EAuthStep.SIGN_UP_PHONE_NUMBER"
            />
            <SignUpUserInfoComponent
              v-if="mobileAuthStep === EAuthStep.SIGN_UP_USER_INFO"
              :user-id="mobileAuthUserId as number"
              @next-step="handleMobileAuthStep"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- City Selection Modal -->
    <div 
      v-if="showCityModal" 
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      @click="showCityModal = false"
    >
      <div 
        class="bg-white rounded-2xl w-80 max-h-96 overflow-hidden shadow-2xl"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">აირჩიეთ რეგიონი</h3>
          <button 
            @click="showCityModal = false"
            class="p-1 hover:bg-gray-100 rounded-full"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Cities List -->
        <div class="max-h-80 overflow-y-auto">
          <button
            v-for="city in cities"
            :key="city"
            @click="selectCity(city)"
            :class="[
              'w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0',
              mobileSearchCity === city ? 'bg-orange-100 text-orange-600' : 'text-gray-700'
            ]"
          >
            {{ city }}
            <svg 
              v-if="mobileSearchCity === city"
              class="w-5 h-5 float-right mt-0.5 text-orange-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        <!-- Modal Footer -->
        <div class="p-4 border-t border-gray-200">
          <button
            @click="showCityModal = false"
            class="w-full py-3 px-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            არჩევა
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
