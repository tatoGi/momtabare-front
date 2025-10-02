<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import RatingStatusComponent from "@/components/products/product-stats/RatingStatusComponent.vue"
import {IProduct} from "@/ts/models/product.types.ts"
import type { IUser } from "@/ts/models/user-types"
import { useCart } from "@/composables/useCart"
import {IBookedDate} from "../../ts/models/product.types"
import RetailerReviewComponent from "../retailer/RetailerReviewComponent.vue"
import ProductReviewComponent from "./ProductReviewComponent.vue"
import {useUserStore} from "@/pinia/user.pinia"
import {computed, onMounted, onUnmounted, ref, watch} from "vue"
import {useRouter} from "vue-router"

const router = useRouter()
const userStore = useUserStore()
const { addToCart } = useCart()
const props = defineProps<{
  product: IProduct | null
}>()

const dialogOpen = ref<boolean>()
const retailerDialogOpen = ref<boolean>()
const selectedDate = ref<Date | null>()
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const datePickerOpen = ref<boolean>(false)
const calendarContainerRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  window.addEventListener('click', calendarClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', calendarClickOutside)
})

function calendarClickOutside(event: MouseEvent): void {
  const clickedElement = event.target as Node;
  if (calendarContainerRef.value && !calendarContainerRef.value.contains(clickedElement)) {
    datePickerOpen.value = false;
  }
}

function changeDialogState() {
  userStore.authDialog
      ? (dialogOpen.value = true)
      : userStore.setAuthDialog(true)
}


const attributes = computed(() => {
  return startDate.value && endDate.value
      ? [
        {
          highlight: "red",
          dates: [{start: startDate.value, end: endDate.value}],
        },
      ]
      : []
})
const computedRetailer = computed<IUser | null>(() => {
  return props.product?.product_owner || null
})
const computedDisabledDates = computed(() => {
  return (
      props.product?.booked_dates
          .filter((item: IBookedDate) => item.status !== "cancelled")
          .map((item: IBookedDate) => ({
            start: item.start_date,
            end: item.end_date,
          })) || []
  )
})

function routeToRetailerPage(): void {
  router.replace({path: `/retailer/${props.product?.product_owner.id}`})
}

function isDateRangeOverlappingDisabledDates(
    start: Date | null,
    end: Date | null,
): boolean {
  if (!start || !end) return false

  const [rangeStart, rangeEnd] = start <= end ? [start, end] : [end, start]

  return computedDisabledDates.value.some((disabledPeriod: { start: string | Date; end: string | Date }) => {
    const disabledStart = new Date(disabledPeriod.start)
    const disabledEnd = new Date(disabledPeriod.end)

    return rangeStart <= disabledEnd && rangeEnd >= disabledStart
  })
}

watch(selectedDate, (newDate: Date | null) => {
  if (!newDate) return

  if (startDate.value && endDate.value) {
    startDate.value = newDate
    endDate.value = null
    return
  }

  if (!startDate.value) {
    startDate.value = newDate
  } else if (!endDate.value) {
    const potentialEndDate = newDate

    const [rangeStart, rangeEnd] =
        startDate.value <= potentialEndDate
            ? [startDate.value, potentialEndDate]
            : [potentialEndDate, startDate.value]

    if (isDateRangeOverlappingDisabledDates(rangeStart, rangeEnd)) {
      startDate.value = newDate
      endDate.value = null
      return
    }

    startDate.value = rangeStart
    endDate.value = rangeEnd
  }
})

const computedUserInitials = computed(() => {
  if (!computedRetailer.value) {
    return 'N/A';
  }
  const firstInitial = computedRetailer.value.first_name?.[0] ?? '';
  const lastInitial = computedRetailer.value.last_name?.[0] ?? '';
  return (firstInitial + lastInitial).toUpperCase() || 'N/A';
});

// Contact owner function
function contactOwner() {
  if (!computedRetailer.value?.email) return
  
  const subject = encodeURIComponent(`შეკითხვა პროდუქტის შესახებ: ${props.product?.name}`)
  const body = encodeURIComponent(`გამარჯობა,\n\nდაინტერესებული ვარ თქვენი პროდუქტით: ${props.product?.name}\n\nგთხოვთ დამიკავშირდეთ.\n\nმადლობა`)
  
  window.location.href = `mailto:${computedRetailer.value?.email}?subject=${subject}&body=${body}`
}


const AddingItemToCart = ref<boolean>(false)
const userRating = ref<number>(0)
const hoverRating = ref<number>(0)
const isSubmittingRating = ref<boolean>(false)
const showSuccessAlert = ref<boolean>(false)
const successMessage = ref<string>('')

async function triggerAddToCart(product: IProduct | null) {
  if (!product) return
  
  AddingItemToCart.value = true
  try {
    const result = await addToCart(product.id)
    
    if (!result.success && result.message === 'Authentication required') {
      // Redirect to login page with return URL
      router.push({ 
        path: '/login', 
        query: { redirect: router.currentRoute.value.fullPath }
      })
      return
    }
    
    if (result.success) {
      successMessage.value = result.message || 'Product added to cart successfully'
      showSuccessAlert.value = true
      
      // Auto-hide alert after 3 seconds
      setTimeout(() => {
        showSuccessAlert.value = false
      }, 3000)
    } else {
      // Show error message if adding to cart failed for other reasons
      successMessage.value = result.message || 'Failed to add product to cart'
      showSuccessAlert.value = true
      
      setTimeout(() => {
        showSuccessAlert.value = false
      }, 3000)
    }
  } catch (error) {
    console.error('Error adding product to cart:', error)
    successMessage.value = 'An error occurred while adding to cart'
    showSuccessAlert.value = true
    
    setTimeout(() => {
      showSuccessAlert.value = false
    }, 3000)
  } finally {
    AddingItemToCart.value = false
  }
}

function selectRating(rating: number) {
  userRating.value = rating
}

function hoverStar(rating: number) {
  hoverRating.value = rating
}

function resetHover() {
  hoverRating.value = 0
}

async function submitRating() {
  if (!userRating.value || !props.product || !userStore.user) return
  
  isSubmittingRating.value = true
  try {
    // TODO: Implement actual API call to submit rating
    console.log('Submitting rating:', userRating.value, 'for product:', props.product.id)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // You might want to show a success message here
    console.log('Rating submitted successfully')
    
    // Reset the rating form
    userRating.value = 0
    hoverRating.value = 0
  } catch (error) {
    console.error('Error submitting rating:', error)
    // You might want to show an error message here
  } finally {
    isSubmittingRating.value = false
  }
}

</script>

<template>
  <!-- Success Alert -->
  <div 
    v-if="showSuccessAlert"
    class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right"
  >
    <BaseIcon name="check-circle" class="w-5 h-5" />
    <span class="font-medium">{{ successMessage }}</span>
    <button 
      @click="showSuccessAlert = false"
      class="ml-2 text-white hover:text-green-100 transition-colors"
    >
      <BaseIcon name="x" class="w-4 h-4" />
    </button>
  </div>

  <div class="flex flex-col items-start gap-5 p-3">
    <div
        class="flex w-full items-center justify-between rounded-2xl border border-customBlack/10 cursor-pointer hover:border-customRed dark:border-white/10 group p-4"
        @click="routeToRetailerPage"
    >
      <div class="flex items-center gap-3">
        <div class="bg-customRed rounded-full w-16 h-16 flex-center flex-shrink-0">
          <h2 class="text-customGrey font-bold font-uppercase pb-1">{{ computedUserInitials }}</h2>
        </div>
        <div>
          <div class="flex items-center gap-1">
            <h2 class="text-sm font-semibold dark:text-white">
              {{ computedRetailer?.first_name || 'Unknown' }}
            </h2>
            <BaseIcon
                :size="20"
                class="text-customBlue pt-0.5"
                name="verified"
            />
          </div>

          <h2
              class="text-xs font-medium text-customBlue transition-all group-hover:text-customRed"
          >
            {{ computedRetailer?.products_count || computedRetailer?.products_amount || 0 }} პროდუქტი
          </h2>
        </div>
      </div>
      <h2
          class="h-6 w-10 rounded-full bg-customRed text-center text-sm text-white"
      >
      {{ computedRetailer?.products_count || computedRetailer?.products_amount || 0 }}
      </h2>
    </div>

    <!-- Contact Owner Button -->
    <div
        class="flex w-full items-center justify-between rounded-2xl border border-customBlack/10 dark:border-white/10 hover:border-customRed dark:hover:border-customRed p-4 cursor-pointer group transition-all"
        @click="contactOwner"
    >
      <div class="flex flex-col items-start gap-2">
        <h2 class="text-sm text-customBlack/70 dark:text-white/70">
          მფლობელთან დაკავშირება
        </h2>
        <p class="text-xs text-customBlack/50 dark:text-white/50">
          {{ computedRetailer?.email }}
        </p>
      </div>

      <BaseIcon
          :size="24"
          class="text-customBlack/70 dark:text-white/70 group-hover:text-customRed"
          name="mail"
      />
    </div>

    <!-- Product Rating Section -->
    <div class="flex w-full flex-col rounded-2xl border border-customBlack/10 dark:border-white/10 hover:border-customRed dark:hover:border-customRed p-4 transition-all">
      <div class="flex w-full items-center justify-between mb-4">
        <div class="flex flex-col items-start gap-2">
          <h2 class="text-sm text-customBlack/70 dark:text-white/70">
            პროდუქციის შეფასება
          </h2>
          <RatingStatusComponent
              v-if="product"
              :rating="product.rating || 0"
              :ratings-amount="product.ratings_amount || 0"
          />
        </div>

        <BaseIcon
            :size="24"
            class="text-customBlack/70 dark:text-white/70 cursor-pointer hover:text-customRed"
            name="star"
        />
      </div>

      <!-- Interactive Star Rating -->
      <div v-if="userStore.user" class="flex flex-col gap-3">
        <h3 class="text-sm font-medium text-customBlack dark:text-white">
          შეაფასეთ ეს პროდუქტი:
        </h3>
        
        <!-- Star Rating Input -->
        <div class="flex gap-1">
          <button
            v-for="star in 5"
            :key="star"
            @click="selectRating(star)"
            @mouseenter="hoverStar(star)"
            @mouseleave="resetHover"
            class="text-2xl transition-colors duration-200 cursor-pointer"
            :class="(hoverRating || userRating) && star <= (hoverRating || userRating) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'"
          >
            ★
          </button>
        </div>

        <!-- Submit Rating Button -->
        <BaseButton
          v-if="userRating > 0"
          :height="40"
          :loader="isSubmittingRating"
          class="w-full bg-customRed text-white"
          @click="submitRating"
        >
          <BaseIcon :size="20" class="text-white" name="send"/>
          <span class="text-sm font-medium">შეფასების გაგზავნა</span>
        </BaseButton>
      </div>

      <!-- Login Prompt -->
      <div v-else class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span class="text-sm text-customBlack/70 dark:text-white/70">
          შეფასებისთვის გაიარეთ ავტორიზაცია
        </span>
        <BaseButton
          :height="32"
          class="bg-customBlue text-white text-xs px-4"
          @click="changeDialogState"
        >
          შესვლა
        </BaseButton>
      </div>
    </div>

    <div
        class="flex w-full items-center justify-between rounded-2xl border border-customBlack/10 dark:border-white/10 px-6 pb-8"
    >
      <div class="flex w-full items-center gap-3">
        <div class="flex w-full flex-col items-start gap-6">
          <div
              class="flex w-full items-end gap-1 border-b border-customBlack/10 dark:border-white/10 py-4"
          >
            <p class="text-lg font-extrabold text-customRed">
              {{ product?.price }} ₾
            </p>
            <p
                class="pb-1 text-xs font-medium text-customBlack/70 dark:text-white/70"
            >
              / დღეში
            </p>
          </div>
          <div class="relative w-full">
            <div
                class="flex w-full items-center justify-between rounded-2xl border cursor-pointer transition-all border-customBlack/10 dark:border-white/10 hover:border-customRed dark:hover:border-customRed px-6 py-4"
                @click.stop="() => (datePickerOpen = !datePickerOpen)"
            >
              <h2>აირჩიე პერიოდი</h2>
              <BaseIcon
                  :size="22"
                  class="dark:text-white"
                  name="calendar_month"
              />
            </div>
            <div
                v-if="datePickerOpen"
                ref="calendarContainerRef"
                class="absolute top-20 left-0 w-full z-50"
            >
              <VDatePicker
                  v-model="selectedDate"
                  :attributes="attributes"
                  :disabled-dates="computedDisabledDates"
                  :min-date="new Date().setDate(new Date().getDate() + 1)"
                  color="red"
                  style="width: 100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col w-full gap-3">
      <BaseButton
          :height="50"
          :loader="AddingItemToCart"
          class="w-full bg-customBlack dark:bg-customDarkGrey"
          @click.left="triggerAddToCart(product)"
      >
        <BaseIcon :size="24" class="text-white" name="shopping_bag"/>
        <h2 class="text-sm font-uppercase font-bold text-white">
          ჩანთაში დამატება
        </h2>
      </BaseButton>
      <BaseButton
          :height="50"
          class="text-sm font-uppercase w-full bg-customRed font-bold text-white"
      >
        იქირავე
      </BaseButton>
    </div>

    <ProductReviewComponent
        v-if="userStore.getUser"
        v-model="dialogOpen"
        :product="props.product"
    ></ProductReviewComponent>
    <RetailerReviewComponent
        v-if="userStore.getUser"
        v-model="retailerDialogOpen"
        :retailer="computedRetailer"
    ></RetailerReviewComponent>
  </div>
</template>

<style scoped>
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
</style>
