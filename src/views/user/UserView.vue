<script lang="ts" setup>
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseCard from "@/components/base/BaseCard.vue"
import type { IUser } from "@/ts/models/user-types"
import type { IUserCard } from "@/ts/models/user-types"
import { signOut } from "@/services/auth.js"
import { useUserStore } from "@/pinia/user.pinia.js"
import { computed, ref, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { requestRetailerPermission, getRetailerShopCount } from "@/services/retailer"
import { getUserProductsCount } from "@/services/userProducts"

const router = useRouter()
const route = useRoute()

const userStore = useUserStore()

// State for product counts
const productCount = ref(0)
const shopCount = ref(0)

// Success message state
const showSuccessMessage = ref(false)
const successMessage = ref('')

const retailerCards = computed<IUserCard[]>(() => {
  const count = productCount.value;
  const shops = shopCount.value;
  return [
    {
      icon: "add_circle",
      title: "დაამატე განცხადება",
      description: "დაამატე პროდუქცია რამდენიმე კლიკით",
      name: "addProduct",
      height: 139,
      showBadge: false,
      badgeCount: 0
    },
    {
      icon: "storefront",
      title: "ჩემი მაღაზია",
      description: "მაღაზიის ვიზუალური პარამეტრები",
      name: "myShop",
      showBadge: shops > 0,
      badgeCount: shops,
      height: 139
    },
    {
      icon: "shopping_bag",
      title: "ჩემი განცხადებები",
      description: "იხილეთ თქვენ მიერ დამატებული განცხადებები.",
      name: "myListings",
      showBadge: count > 0,
      badgeCount: count,
      height: 139
    },
    {
      icon: "payments",
      title: "ტრანზაქციები",
      description: "საიტიდან გამომუშავებული შემოსავალი",
      name: "transactions",
      height: 139,
      showBadge: false,
      badgeCount: 0
    }
  ];
});

const userCards = computed<IUserCard[]>(() => [
  {
    icon: "account_circle",
    title: "პირადი ინფორმაცია",
    description: "პირადი ინფორმაციის სრული რედაქტირება",
    name: "userInfo",
    height: 139
  },
  {
    icon: "chat",
    title: "ჩატი",
    description: "შეტყობინებების გაგზავნა და მიღება",
    name: "chat",
    height: 139
  },
  {
    icon: "notifications",
    title: "შეტყობინებები",
    description: "სისტემური შეტყობინებები",
    name: "notifications",
    height: 139
  },
  {
    icon: "update",
    title: "ჩემი შეკვეთები",
    description: "თქვენ მიერ ნაქირავები პროდუქცია",
    name: "userOrders",
    height: 139
  },
  {
    icon: "location_on",
    title: "ჩემი მისამართები",
    description: "მისამართები საიდანაც აქირავებთ პროდუქციას",
    name: "userAddresses",
    height: 139
  },
  {
    icon: "credit_card",
    title: "ბარათები",
    description: "საბანკო ბარათების მართვა",
    name: "userCreditCards",
    height: 139
  },
  {
    icon: "logout",
    title: "გასვლა",
    description: "პროფილის დატოვება",
    name: "logout",
    height: 139
  },
])

// Use the store's computed properties
const user = computed<IUser | null>(() => userStore.user)

const fullName = computed<string>(() => 
  user.value ? `${user.value.first_name} ${user.value.surname}` : ''
)

const navigationItems = ref([
  {
    icon: "person",
    title: "პროფილი",
    description: "პირადი ინფორმაციის რედაქტირება",
    name: "profile",
    showBadge: false,
    badgeCount: 0,
    height: 139
  },
  {
    icon: "storefront",
    title: "ჩემი მაღაზია",
    description: "მაღაზიის ვიზუალური პარამეტრები",
    name: "myShop",
    showBadge: false,
    badgeCount: 0,
    height: 139
  },
  {
    icon: "shopping_bag",
    title: "ჩემი განცხადებები",
    description: "იხილეთ თქვენ მიერ დამატებული განცხადებები.",
    name: "myListings",
    showBadge: false,
    badgeCount: 0,
    height: 139
  },
  {
    icon: "payments",
    title: "ტრანზაქციები",
    description: "საიტიდან გამომუშავებული შემოსავალი",
    name: "transactions",
    showBadge: false,
    height: 139
  },
  {
    icon: "favorite",
    title: "ფავორიტები",
    description: "შენახული ნივთები",
    name: "favorites",
    showBadge: false,
    height: 139
  },
  {
    icon: "history",
    title: "ისტორია",
    description: "ნახული განცხადებები",
    name: "history",
    showBadge: false,
    height: 139
  },
  {
    icon: "settings",
    title: "პარამეტრები",
    description: "პროფილის პარამეტრები",
    name: "settings",
    showBadge: false,
    height: 139
  }
])

// Use the store's isApprovedRetailer getter directly
const isApprovedRetailer = computed<boolean>(() => userStore.isApprovedRetailer)
const isPendingRetailer = computed<boolean>(() => 
  userStore.user?.retailer_status === 'pending' || false
)

// Fetch and update product count
const fetchAndUpdateProductCount = async () => {
  try {
    if (!user.value?.id) return;
    
    // Get the product count
    const count = await getUserProductsCount(user.value.id);
    productCount.value = count;
    
    // Get the shop count
    const shops = await getRetailerShopCount();
    shopCount.value = shops;
    
    // Update navigation items with the new count
    navigationItems.value = navigationItems.value.map(item => {
      // Update both the shopping bag icon and myListings item
      if (item.name === 'myListings' || item.icon === 'shopping_bag') {
        return {
          ...item,
          showBadge: count > 0,
          badgeCount: count
        };
      }
      return item;
    });
    
    // Force update the retailerCards computed property by triggering a re-evaluation
    // The computed property will automatically pick up the new productCount.value
  } catch (error) {
    console.error('Failed to fetch product count:', error);
  }
}

// Check for success message from query parameters
const checkSuccessMessage = () => {
  const { success, message } = route.query
  
  if (success === 'true' && message) {
    showSuccessMessage.value = true
    successMessage.value = message as string
    
    // Clear the query parameters from URL
    router.replace({ name: 'user' })
    
    // Hide message after 5 seconds
    setTimeout(() => {
      showSuccessMessage.value = false
      successMessage.value = ''
    }, 5000)
  }
}

// Initial fetch
onMounted(() => {
  fetchAndUpdateProductCount()
  checkSuccessMessage()
})

// No need for the watch anymore since we're using a computed property

const canRequestRetailer = computed<boolean>(() => {
  return !isApprovedRetailer.value && !isPendingRetailer.value
})

async function handleSignOut(): Promise<void> {
  await signOut()
  userStore.clearAuth()
  await router.push("/home")
}

async function handleRetailerRequest(): Promise<void> {
  try {
    const result = await requestRetailerPermission()
    if (result.success) {
      // Re-initialize auth to get updated user data
      await userStore.initializeAuth()
      console.log('Retailer request submitted successfully:', result.message)
    } else {
      console.error('Failed to submit retailer request:', result.message)
    }
  } catch (error) {
    console.error('Error submitting retailer request:', error)
  }
}


function handleCardClick(name: string): void {
  switch (name) {
    case "logout":
      handleSignOut()
      break
    case "userOrders":
      router.push("/user/orders")
      break
    case "userInfo":
      router.push("/user/info")
      break
    case "userAddresses":
      router.push("/user/addresses")
      break
    case "userCreditCards":
      router.push("/user/credit-cards")
      break
    case "addProduct":
      router.push("/add-retailer-product")
      break
    case "myShop":
      router.push("/retailer-info")
      break
    case "myListings":
      router.push("/my-listings")
      break
    case "chat":
      router.push("/chat")
      break
      // case "transactions":
      //   router.push("/user/addresses")
      //   break
  }
}
</script>

<template>
  <main class="pb-20 flex flex-col gap-3 px-4 sm:px-6 lg:px-0">
    <BaseBreadcrumbs :path="['ჩემი პროფილი']" disable-route/>
    
    <!-- Success Message -->
    <div
      v-if="showSuccessMessage"
      class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
    >
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">
            {{ successMessage }}
          </p>
        </div>
      </div>
    </div>
    
    <div class="flex flex-col gap-6 sm:gap-8 lg:gap-10">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex flex-col gap-1.5">
          <h2
              class="text-customRed dark:text-white text-lg sm:text-xl lg:text-2xl font-extrabold font-uppercase"
          >
            ჩემი პროფილი
          </h2>
          <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70 font-medium">
            <span class="text-customBlack dark:text-white font-bold">
              {{ fullName }}
            </span>
            , მართე შენი გვერდი მარტივად
          </p>
        </div>
        <!-- Show button only for non-retailers or pending retailers -->
        <BaseButton
            v-if="canRequestRetailer"
            :height="36"
            :width="205"
            class="bg-customBlue text-white text-xs font-bold font-uppercase w-full sm:w-auto"
            @click.left="handleRetailerRequest"
        >
          გახდი გამქირავებელი
        </BaseButton>
        
        <BaseButton
            v-else-if="isPendingRetailer"
            :height="36"
            :width="205"
            class="bg-yellow-500 text-white text-xs font-bold font-uppercase w-full sm:w-auto"
            disabled
        >
          მოთხოვნა განიხილება
        </BaseButton>
      </div>

      <!-- MOBILE LIST VIEW: Show on mobile, hide on desktop -->
      <div class="flex flex-col lg:hidden gap-2">
        <!-- Retailer Section Mobile -->
        <section v-if="isApprovedRetailer" class="flex flex-col gap-3">
          <h3 class="text-xs font-bold text-customBlack/60 dark:text-white/60 uppercase px-4 py-2">
            გამქირავებელი
          </h3>
          <div class="flex flex-col gap-1">
            <div
              v-for="card in retailerCards"
              :key="card.name"
              class="flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors"
              @click="handleCardClick(card.name)"
            >
              <div class="flex items-center gap-3">
                <BaseIcon :name="card.icon" :size="24" class="text-customRed dark:text-customRed" />
                <div class="flex flex-col gap-0.5">
                  <p class="text-sm font-semibold text-customBlack dark:text-white">{{ card.title }}</p>
                  <p class="text-xs text-customBlack/60 dark:text-white/60">{{ card.description }}</p>
                </div>
              </div>
              <div v-if="card.showBadge" class="bg-customRed text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {{ card.badgeCount }}
              </div>
            </div>
          </div>
        </section>

        <!-- User Section Mobile -->
        <section class="flex flex-col gap-3">
          <h3 class="text-xs font-bold text-customBlack/60 dark:text-white/60 uppercase px-4 py-2">
            მომხმარებელი
          </h3>
          <div class="flex flex-col gap-1">
            <div
              v-for="userCard in userCards"
              :key="userCard.name"
              class="flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors"
              @click.left="handleCardClick(userCard.name)"
            >
              <div class="flex items-center gap-3">
                <BaseIcon :name="userCard.icon" :size="24" class="text-customRed dark:text-customRed" />
                <div class="flex flex-col gap-0.5">
                  <p class="text-sm font-semibold text-customBlack dark:text-white">{{ userCard.title }}</p>
                  <p class="text-xs text-customBlack/60 dark:text-white/60">{{ userCard.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Logout Button Mobile -->
        <button
          class="flex items-center gap-2 px-4 py-3 text-customRed font-semibold hover:bg-red-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-200 dark:border-gray-700 mt-2"
          @click="handleSignOut"
        >
          <BaseIcon name="logout" :size="20" class="text-customRed" />
          გასვლა
        </button>
      </div>

      <!-- DESKTOP GRID VIEW: Show on desktop, hide on mobile -->
      <div class="hidden lg:flex lg:flex-col lg:gap-8">
        <!-- Retailer Section -->
        <section v-if="isApprovedRetailer" class="flex flex-col gap-4">
          <h2
              class="text-customBlack dark:text-white text-xl lg:text-2xl font-extrabold font-uppercase"
          >
            გამქირავებელი
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-7">
            <BaseCard
              v-for="card in retailerCards"
              :key="card.name"
              :icon="card.icon"
              :title="card.title"
              :description="card.description"
              :show-badge="card.showBadge"
              :badge-count="card.badgeCount"
              class="relative cursor-pointer hover:shadow-md transition-shadow duration-200"
              @click="handleCardClick(card.name)"
            />
          </div>
        </section>

        <!-- User Section -->
        <section class="flex flex-col gap-4">
          <h2
              class="text-customBlack dark:text-white text-xl lg:text-2xl font-extrabold font-uppercase"
          >
            მომხმარებელი
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-7">
            <BaseCard
                v-for="userCard in userCards"
                :key="userCard.name"
                :description="userCard.description"
                :height="139"
                :icon="userCard.icon"
                :title="userCard.title"
                class="relative cursor-pointer hover:shadow-md transition-shadow duration-200"
                @click.left="handleCardClick(userCard.name)"
            />
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
