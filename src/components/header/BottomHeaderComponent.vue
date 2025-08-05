<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BaseButton from "@/components/base/BaseButton.vue";
import BaseIcon from "@/components/base/BaseIcon.vue";
import AuthDialog from "@/components/dialogs/AuthDialog.vue";
import SignInComponent from "@/components/auth/SignInComponent.vue";
import SignUpEmailComponent from "@/components/auth/SignUpEmailComponent.vue";
import SignUpPhoneNumberComponent from "@/components/auth/SignUpPhoneNumberComponent.vue";
import SignUpUserInfoComponent from "@/components/auth/SignUpUserInfoComponent.vue";
import VerifyCodeComponent from "@/components/auth/VerifyCodeComponent.vue";
import HeaderProductMenu from "@/components/header/HeaderProductMenu.vue";
import HeaderSearchComponent from "@/components/header/HeaderSearchComponent.vue";
import { useUserStore } from "@/pinia/user.pinia";
import { useCartStore } from "@/pinia/cart.pinia";
import { cities } from "@/constants/cities.ts";
import { EAuthStep } from "@/ts/auth.types.js";
import type { AuthStepPayload } from "@/ts/auth.types.js";
import cartsvg from "@/assets/svg/cart.svg";
import heartsvg from "@/assets/svg/heart.svg";
import usersvg from "@/assets/img/usersvg.svg";

interface INavItem {
  title: string;
  route: string;
}

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const cartStore = useCartStore();

const navItems: INavItem[] = [
  { title: "მთავარი", route: "/home" },
  { title: "ბლოგი", route: "/blog" },
  { title: "მარშუტები", route: "/routes" },
  { title: "FAQ", route: "/faq" },
];

const showMobileSearch = ref(false);
const showCityModal = ref(false);
const showMobileAuth = ref(false);

// Mobile auth step management
const mobileAuthStep = ref<string>(EAuthStep.SIGN_IN);
const mobileAuthUserId = ref<number | null>(null);
const mobileAuthEmailOrPhone = ref<string>('');
const user = userStore.user;
const cartItems = ref(cartStore.getCartLength);

// Mobile search form data
const mobileSearchName = ref<string>('');
const mobileSearchCity = ref<string>('');
const mobileSearchDate = ref<string>('');

console.log(user);
function routeToCart(): void {
  if (!userStore.getUser) {
    userStore.setAuthDialogState(true);
    return;
  }
  router.push({ name: "cart" });}

function routeToFavorites(): void {
  if (!userStore.getUser) {
    userStore.setAuthDialogState(true);
    return;
  }
  router.push({ name: "favorite" });
}

// Update cart items when the store changes
cartStore.$subscribe(() => {
  cartItems.value = cartStore.getCartLength;
});

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
function handleMobileAuthStep(payload: AuthStepPayload): void {
  if (payload.user_id) {
    mobileAuthUserId.value = payload.user_id;
  }

  if (payload.phone_number) {
    mobileAuthEmailOrPhone.value = payload.phone_number;
  }

  if (payload.email) {
    mobileAuthEmailOrPhone.value = payload.email;
  }

  mobileAuthStep.value = payload.nextStep;
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
        
        <div>
          <BaseButton
            v-if="user"
            :height="40"
            :width="40"
            class="rounded-full bg-customRed"
            @click.left="router.push('/user')"
          >
            <BaseIcon :size="20" class="text-white" name="account_circle"/>
          </BaseButton>
          
          <AuthDialog v-else>
            <BaseButton :height="40" :width="40" class="rounded-full bg-customRed">
              <BaseIcon :size="20" class="text-white" name="account_circle"/>
            </BaseButton>
          </AuthDialog>
        </div>
      </div>
    </div>
    
    <!-- Mobile Header -->
    <div class="md:hidden flex">
      <!-- Burger Menu -->
      <button @click="$emit('toggleMobileNav')" class="burger-menu">
        <BaseIcon name="menu" :size="24" /> 
      </button>
      <!-- Icons -->
      <div class="flex items-center">
        <button @click="toggleMobileSearch" class="p-2  search-button">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 17L13.889 13.8889M16.1111 8.55556C16.1111 12.7284 12.7284 16.1111 8.55556 16.1111C4.38274 16.1111 1 12.7284 1 8.55556C1 4.38274 4.38274 1 8.55556 1C12.7284 1 16.1111 4.38274 16.1111 8.55556Z" stroke="#141414" stroke-opacity="0.7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <button class="relative p-2 favorite-button" @click="routeToFavorites">
          <img :src="heartsvg" alt="favorites" class="w-5 h-5" />
        </button>
        
        <button class="relative p-2 cart-button" @click="routeToCart">
          <img :src="cartsvg" alt="cart" class="w-5 h-5" />
          <span 
            v-if="cartItems"
            class="absolute -top-1 right-8 bg-customRed text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center"
          >
            {{ cartItems }}
          </span>
        </button>
        <div class="flex items-center user-button">
          <BaseButton
            v-if="user"
            :height="40"
            :width="40"
            class="rounded-full bg-customRed"
            @click.left="router.push('/user')"
          >
            <img :src="usersvg" alt="user" class="w-5 h-5" />
          </BaseButton>
          
          <!-- Mobile: Use overlay -->
          <BaseButton 
            v-else-if="!user"
            :height="40" 
            :width="40" 
            class="rounded-full bg-customRed md:hidden"
            @click="toggleMobileAuth"
          >
            <img :src="usersvg" alt="user" class="w-5 h-5" />
          </BaseButton>
          
          <!-- Desktop: Use dialog -->
          <AuthDialog v-else-if="!user" class="hidden md:block">
            <BaseButton :height="40" :width="40" class="rounded-full bg-customRed">
              <img :src="usersvg" alt="user" class="w-5 h-5" />
            </BaseButton>
          </AuthDialog>
        </div>
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
          
          <div v-else class="flex flex-col justify-between px-4 pb-9 pt-8">
            <SignUpPhoneNumberComponent
              v-if="mobileAuthStep === EAuthStep.SIGN_UP_PHONE_NUMBER"
              @next-step="handleMobileAuthStep"
            />
            <SignUpEmailComponent
              v-if="mobileAuthStep === EAuthStep.SIGN_UP_EMAIL"
              @next-step="handleMobileAuthStep"
            />
            <VerifyCodeComponent
              v-if="mobileAuthStep === EAuthStep.VERIFY_CODE"
              :email-or-phone="mobileAuthEmailOrPhone"
              :user-id="mobileAuthUserId as number"
              @next-step="handleMobileAuthStep"
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
