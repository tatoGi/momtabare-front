<script lang="ts" setup>
import CartDetailsComponent from "@/components/cart/CartDetailsComponent.vue"
import CheckoutProductItem from "@/components/cart/CheckoutProductItem.vue"
// Choose one of the following:
// Option 1: Modal with iframe (has CSP issues with Google Pay)
// import PaymentModal from "@/components/payment/PaymentModal.vue"
// Option 2: Popup window (recommended - no CSP issues)
import PaymentPopup from "@/components/payment/PaymentPopup.vue"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ICart } from "@/ts/models/cart.types"
import { IUser } from "@/ts/models/user-types"
import { useCartStore } from "@/pinia/cart.pinia"
import { useUserStore } from "@/pinia/user.pinia"
import { computed, ref, watch } from "vue"
import { useBogPayment } from '@/services/bogPayment'
import { updateCartProductsRentalStatus } from '@/services/products'
import type { ISavedCardSummary } from '@/services/bogPayment'
import { useI18n } from 'vue-i18n'
import visa from '@/assets/svg/visa.svg'
import mastercard from '@/assets/svg/mastercard.svg'
import { onMounted } from 'vue'
import { useToast } from "@/components/ui/toast/use-toast"
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const userStore = useUserStore()
const { processCheckout, getSavedCards } = useBogPayment()
const { t } = useI18n()
const { addToast } = useToast()
const router = useRouter()

const fullName = ref<string>()
const phoneNumber = ref<string>()
const saveCard = ref<boolean>(false)
const savedCards = ref<ISavedCardSummary[]>([])
const selectedCardId = ref<string | null>(null)
const selectedSavedCard = computed(() => savedCards.value.find(c => c.id === selectedCardId.value) || null)

// Payment modal state
const showPaymentModal = ref<boolean>(false)
const paymentUrl = ref<string>('')

// Load saved cards on mount
onMounted(async () => {
  console.log('🔄 Loading saved cards for checkout...')
  try {
    const cards = await getSavedCards()
    savedCards.value = cards
    console.log('✅ Loaded saved cards:', cards)
  } catch (error) {
    console.error('❌ Failed to load saved cards:', error)
  }
})

// Update product rental status helper function
const updateProductsRentalStatus = async () => {
  try {
    const currentCart = cart.value
    const currentUser = user.value
    
    if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
      console.warn('⚠️ No cart items found to update rental status')
      return
    }
    
    if (!currentUser || !currentUser.id) {
      console.warn('⚠️ No user found to update rental status')
      return
    }
    
    console.log('📦 Updating rental status for cart items:', currentCart.items)
    
    const rentalUpdates = currentCart.items.map(item => ({
      product_id: item.product.id,
      rental_start_date: item.start_date,
      rental_end_date: item.end_date,
      ordered_by: currentUser.id
    }))
    
    const result = await updateCartProductsRentalStatus(rentalUpdates)
    
    if (result.success) {
      console.log('✅ Successfully updated product rental status')
      // Refresh the cart after successful rental status update
      await cartStore.fetchCart()
    } else {
      console.error('❌ Failed to update product rental status:', result.message)
      if (result.errors) {
        console.error('Errors:', result.errors)
      }
    }
  } catch (error) {
    console.error('❌ Error updating product rental status:', error)
  }
}

async function handleSelectOtherCard(): Promise<void> {
  selectedCardId.value = null
  try {
    const userId = user.value?.id
    const response = await processCheckout(cart.value, saveCard.value, null, true, userId)
    
    if (response.success && response.redirect_url) {
      // Open payment in modal instead of redirecting
      paymentUrl.value = response.redirect_url
      showPaymentModal.value = true
      
      addToast({
        title: 'გადახდის გვერდი',
        description: 'გთხოვთ შეავსოთ თქვენი ბარათის დეტალები',
        variant: 'info',
        duration: 3000
      })
    }
  } catch (e) {
    // swallow to avoid crashing UI; errors are logged inside service
    console.error('❌ Error selecting other card:', e)
  }
}

async function handleCheckout(): Promise<void> {
  try {
    const userId = user.value?.id
    const response = await processCheckout(cart.value, saveCard.value, selectedSavedCard.value, true, userId)
    
    console.log('💳 Checkout response:', response)
    console.log('👤 User ID being sent:', userId)
    
    if (response.success) {
      // Check if it's a saved card payment (no redirect_url)
      if (selectedSavedCard.value && !response.redirect_url) {
        // Update product rental status immediately for saved card payments
        await updateProductsRentalStatus()
        
        addToast({
          title: 'გადახდა დაწყებულია',
          description: 'თქვენი გადახდა შენახული ბარათით წარმატებით დაიწყო. გთხოვთ დაელოდოთ დადასტურებას.',
          variant: 'success',
          duration: 5000
        })
        
        // Show info about what happens next
        setTimeout(() => {
          addToast({
            title: 'გადახდის დამუშავება',
            description: 'გადახდა დამუშავების პროცესშია. მოგიწევთ SMS კოდის შეყვანა თქვენი ბანკიდან.',
            variant: 'info',
            duration: 7000
          })
        }, 1000)
        
        // Optionally redirect to orders page after a delay
        setTimeout(() => {
          router.push({ name: 'user-orders' })
        }, 3000)
      } else if (response.redirect_url) {
        // Open payment in modal instead of redirecting
        paymentUrl.value = response.redirect_url
        showPaymentModal.value = true
        
        addToast({
          title: 'გადახდის გვერდი',
          description: 'გთხოვთ შეავსოთ თქვენი ბარათის დეტალები',
          variant: 'info',
          duration: 3000
        })
      }
    } else {
      // Payment failed
      addToast({
        title: 'გადახდა ვერ მოხერხდა',
        description: response.message || 'გთხოვთ სცადოთ თავიდან ან გამოიყენოთ სხვა ბარათი',
        variant: 'destructive',
        duration: 5000
      })
    }
  } catch (error: any) {
    console.error('❌ Checkout error:', error)
    addToast({
      title: 'შეცდომა',
      description: error.message || 'გადახდისას მოხდა შეცდომა. გთხოვთ სცადოთ თავიდან.',
      variant: 'destructive',
      duration: 5000
    })
  }
}

function handlePaymentModalClose() {
  showPaymentModal.value = false
  paymentUrl.value = ''
}

function handlePaymentComplete(success: boolean) {
  showPaymentModal.value = false
  paymentUrl.value = ''
  
  if (success) {
    addToast({
      title: 'გადახდა წარმატებული',
      description: 'თქვენი გადახდა წარმატებით განხორციელდა',
      variant: 'success',
      duration: 5000
    })
  } else {
    addToast({
      title: 'გადახდა ვერ მოხერხდა',
      description: 'გთხოვთ სცადოთ თავიდან',
      variant: 'destructive',
      duration: 5000
    })
  }
}

const cart = computed<ICart | null>(() => {
  return cartStore.getCart
})

const user = computed<IUser | null>(() => {
  return userStore.user
})

watch(
  user,
  (value: IUser | null) => {
    if (!value) return

    fullName.value = value?.first_name + " " + value?.last_name
    phoneNumber.value = value?.email
  },
  { immediate: true },
)
</script>

<template>
  <main class="px-4 sm:px-6 lg:px-0">
    <div class="flex flex-col lg:flex-row gap-5 lg:gap-7 pt-6 sm:pt-9 pb-20 sm:pb-28">
      <div class="w-full flex flex-col gap-4 sm:gap-5">
        <!-- Contact Info Section -->
        <div
          class="border border-customBlack/10 dark:border-white/10 rounded-xl sm:rounded-2xl flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-4 sm:py-6 gap-4 sm:gap-6"
        >
          <div class="flex flex-col gap-2 md:min-w-[280px] lg:min-w-[430px]">
            <h2 class="font-bold text-base sm:text-lg dark:text-white">{{ t('checkout.contactInfoTitle') }}</h2>
            <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
              {{ t('checkout.contactInfoHint') }}
            </p>
          </div>

          <div class="flex flex-col gap-4 sm:gap-5 w-full">
            <Input v-model="fullName" class="dark:bg-customDarkGrey dark:border-white/10 dark:text-white" />
            <Input v-model="phoneNumber" class="dark:bg-customDarkGrey dark:border-white/10 dark:text-white" />
          </div>
        </div>

        <!-- Payment Method Section -->
        <div
          class="border border-customBlack/10 dark:border-white/10 rounded-xl sm:rounded-2xl flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-4 sm:py-6 gap-4 sm:gap-6"
        >
          <div class="flex flex-col gap-2 md:min-w-[280px] lg:min-w-[430px]">
            <h2 class="font-bold text-base sm:text-lg dark:text-white">{{ t('checkout.paymentMethodTitle') }}</h2>
            <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
              {{ t('checkout.paymentMethodHint') }}
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:gap-4 w-full">
            <template v-if="savedCards.length">
              <div
                v-for="card in savedCards"
                :key="card.id"
                class="border border-customBlack/10 dark:border-white/10 flex justify-between items-center rounded-lg sm:rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 cursor-pointer hover:bg-customGrey/50 dark:hover:bg-customDarkGrey/50 transition-colors"
                :class="{ 'ring-2 ring-customRed': selectedCardId === card.id }"
                @click="selectedCardId = card.id"
              >
                <div class="flex items-center gap-2 sm:gap-3">
                  <img :src="card.brand?.toLowerCase() === 'visa' ? visa : mastercard" :alt="card.brand" class="w-8 sm:w-10" />
                  <p class="text-xs sm:text-sm font-semibold dark:text-white">{{ card.brand?.toUpperCase() }}</p>
                </div>
                <p class="text-xs sm:text-sm font-bold dark:text-white">**** {{ card.last4 }}</p>
              </div>
            </template>

            <div
              class="border border-customBlack/10 dark:border-white/10 flex justify-center items-center rounded-lg sm:rounded-xl py-3 sm:py-4 cursor-pointer hover:bg-customGrey/50 dark:hover:bg-customDarkGrey/50 transition-colors"
              :class="{ 'ring-2 ring-customRed': !selectedCardId }"
              @click="handleSelectOtherCard"
            >
              <p class="text-xs sm:text-sm font-semibold dark:text-white">{{ t('checkout.payWithOtherCard') }}</p>
            </div>
            <p v-if="!selectedCardId" class="text-xs text-customBlack/70 dark:text-white/70 px-1">
              {{ t('checkout.otherCardHint') }}
            </p>

            <div class="flex items-center gap-2">
              <Checkbox id="terms" v-model:checked="saveCard" />
              <Label class="text-xs sm:text-sm font-medium dark:text-white cursor-pointer" for="terms">
                {{ t('checkout.rememberCard') }}
              </Label>
            </div>
          </div>
        </div>

        <!-- Products Section -->
        <div
          class="border border-customBlack/10 dark:border-white/10 rounded-xl sm:rounded-2xl flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-4 sm:py-6 gap-4 sm:gap-6"
        >
          <div class="flex flex-col gap-2 md:min-w-[280px] lg:min-w-[430px]">
            <h2 class="font-bold text-base sm:text-lg dark:text-white">{{ t('checkout.productsTitle') }}</h2>
            <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
              {{ t('checkout.productsHint') }}
            </p>
          </div>

          <div class="flex flex-col gap-2 sm:gap-3 w-full">
            <CheckoutProductItem
              v-for="cartItem in cart?.items"
              :key="cartItem.id"
              :product="cartItem.product"
            />
          </div>
        </div>
      </div>

      <!-- Cart Details Sidebar -->
      <CartDetailsComponent :cart="cart" @checkout="handleCheckout" />
    </div>

    <!-- Payment Popup -->
    <PaymentPopup
      :payment-url="paymentUrl"
      :is-open="showPaymentModal"
      @close="handlePaymentModalClose"
      @payment-complete="handlePaymentComplete"
    />
  </main>
</template>
