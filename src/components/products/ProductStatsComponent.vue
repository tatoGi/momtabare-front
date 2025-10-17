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
import { rateProduct, getProductRatings } from "@/services/ratings"

const router = useRouter()
const userStore = useUserStore()
const { addToCart } = useCart()
const props = defineProps<{
  product: IProduct | null
  classVariant?: "mobile" | "desktop"
}>()

const emit = defineEmits<{
  (e: 'refreshProduct'): void
}>()

// Local reactive rating data
const localRating = ref<number | null>(null)
const localRatingsAmount = ref<number>(0)

const dialogOpen = ref<boolean>()
const retailerDialogOpen = ref<boolean>()
const selectedDate = ref<Date | null>()
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const datePickerOpen = ref<boolean>(false)
const calendarContainerRef = ref<HTMLDivElement | null>(null)

// Initialize local rating from product prop
watch(() => props.product, (newProduct: IProduct | null) => {
  if (newProduct) {
    localRating.value = newProduct.rating
    localRatingsAmount.value = newProduct.ratings_amount || 0
  }
}, { immediate: true })

// Function to fetch and update rating
async function fetchAndUpdateRating() {
  if (!props.product?.id) return
  
  const ratingData = await getProductRatings(props.product.id)
  if (ratingData.success) {
    localRating.value = ratingData.average
    localRatingsAmount.value = ratingData.count
    console.log('⭐ Updated rating:', ratingData.average, 'Count:', ratingData.count)
  }
}

onMounted(() => {
  window.addEventListener('click', calendarClickOutside)
  // Fetch initial rating data
  fetchAndUpdateRating()
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
  const attrs = []
  
  // User's selected rental dates (green highlight)
  if (startDate.value && endDate.value) {
    attrs.push({
      highlight: {
        color: 'green',
        fillMode: 'solid'
      },
      dates: [{ start: startDate.value, end: endDate.value }],
    })
  }
  
  // Product's rental period (red highlight)
  if (props.product?.rental_start_date && props.product?.rental_end_date) {
    attrs.push({
      highlight: {
        color: 'red',
        fillMode: 'light'
      },
      dates: [{
        start: new Date(props.product.rental_start_date),
        end: new Date(props.product.rental_end_date)
      }],
      popover: {
        label: 'გაქირავების პერიოდი'
      }
    })
  }
  
  return attrs
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
  const retailerId = props.product?.product_owner?.id;
  if (!retailerId) {
    console.error('Retailer ID is missing');
    return;
  }
  
  // Use the correct route name and parameter name
  router.push({ 
    name: 'retailer',  // Changed from 'retailer-profile' to 'retailer'
    params: { 
      retailerId: retailerId  // Make sure this matches the route parameter name
    }
  }).catch(error => {
    if (error.name !== 'NavigationDuplicated') {
      console.error('Navigation error:', error);
    }
  });
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
const isRenting = ref<boolean>(false)
const userRating = ref<number>(0)
const hoverRating = ref<number>(0)
const isSubmittingRating = ref<boolean>(false)
const showSuccessAlert = ref<boolean>(false)
const successMessage = ref<string>('')

// Format date helper function
function formatDate(date: string | Date | null): string {
  if (!date) return ''
  
  try {
    const d = new Date(date)
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
    return d.toLocaleDateString('ka-GE', options)
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

async function rentProduct() {
  if (!props.product) return
  
  // Check if user selected dates
  if (!startDate.value || !endDate.value) {
    const Swal = (await import('sweetalert2')).default
    await Swal.fire({
      icon: 'warning',
      title: 'გაფრთხილება',
      text: 'გთხოვთ აირჩიოთ გაქირავების პერიოდი',
      confirmButtonText: 'კარგი',
      confirmButtonColor: '#F59E0B'
    })
    return
  }
  
  isRenting.value = true
  try {
    // Add product to cart with rental dates
    const result = await addToCart(props.product.id, {
      rental_start_date: startDate.value.toISOString(),
      rental_end_date: endDate.value.toISOString()
    })
    
    if (!result.success && result.message === 'Authentication required') {
      // Redirect to login page with return URL
      router.push({ 
        path: '/login', 
        query: { redirect: router.currentRoute.value.fullPath }
      })
      return
    }
    
    if (result.success) {
      // Reset date selection
      startDate.value = null
      endDate.value = null
      selectedDate.value = null
      
      // Show success alert
      const Swal = (await import('sweetalert2')).default
      await Swal.fire({
        icon: 'success',
        title: 'წარმატებული!',
        text: result.message || 'პროდუქტი წარმატებით დაემატა კალათაში',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      })
      
      // Navigate to cart after showing success
      setTimeout(() => {
        router.push('/cart')
      }, 1500)
    } else {
      const Swal = (await import('sweetalert2')).default
      await Swal.fire({
        icon: 'error',
        title: 'შეცდომა',
        text: result.message || 'პროდუქტის დამატება ვერ მოხერხდა',
        confirmButtonText: 'კარგი',
        confirmButtonColor: '#EF4444'
      })
    }
  } catch (error) {
    console.error('Error renting product:', error)
    const Swal = (await import('sweetalert2')).default
    await Swal.fire({
      icon: 'error',
      title: 'შეცდომა',
      text: 'დაფიქსირდა შეცდომა. სცადეთ თავიდან.',
      confirmButtonText: 'კარგი',
      confirmButtonColor: '#EF4444'
    })
  } finally {
    isRenting.value = false
  }
}

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
      // Show success alert with SweetAlert2
      const Swal = (await import('sweetalert2')).default
      await Swal.fire({
        icon: 'success',
        title: 'წარმატებული!',
        text: result.message || 'პროდუქტი კალათაში დაემატა',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      })
    } else {
      // Show error alert
      const Swal = (await import('sweetalert2')).default
      await Swal.fire({
        icon: 'error',
        title: 'შეცდომა',
        text: result.message || 'პროდუქტის დამატება ვერ მოხერხდა',
        confirmButtonText: 'კარგი',
        confirmButtonColor: '#EF4444'
      })
    }
  } catch (error) {
    console.error('Error adding product to cart:', error)
    const Swal = (await import('sweetalert2')).default
    await Swal.fire({
      icon: 'error',
      title: 'შეცდომა',
      text: 'დაფიქსირდა შეცდომა. სცადეთ თავიდან.',
      confirmButtonText: 'კარგი',
      confirmButtonColor: '#EF4444'
    })
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
    console.log('Submitting rating:', userRating.value, 'for product:', props.product.id)
    
    // Call the actual API
    const result = await rateProduct({
      rating: userRating.value,
      product_id: props.product.id
    })
    
    if (result.success || result.data) {
      console.log('Rating submitted successfully')
      
      // Fetch updated rating from backend
      await fetchAndUpdateRating()
      
      // Reset the rating form
      userRating.value = 0
      hoverRating.value = 0
      
      // Show success alert with SweetAlert2
      const Swal = (await import('sweetalert2')).default
      await Swal.fire({
        icon: 'success',
        title: 'მადლობა!',
        text: 'შეფასება წარმატებით გაიგზავნა',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      })
    } else {
      console.error('Rating submission failed:', result)
      const Swal = (await import('sweetalert2')).default
      await Swal.fire({
        icon: 'error',
        title: 'შეცდომა',
        text: 'შეფასების გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.',
        confirmButtonText: 'კარგი',
        confirmButtonColor: '#EF4444'
      })
    }
  } catch (error) {
    console.error('Error submitting rating:', error)
    const Swal = (await import('sweetalert2')).default
    await Swal.fire({
      icon: 'error',
      title: 'შეცდომა',
      text: 'შეფასების გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან.',
      confirmButtonText: 'კარგი',
      confirmButtonColor: '#EF4444'
    })
  } finally {
    isSubmittingRating.value = false
  }
}

</script>

<template>
  <!-- Success Alert -->
  <div 
    v-if="showSuccessAlert"
    class="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right text-xs sm:text-sm"
  >
    <BaseIcon name="check-circle" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
    <span class="font-medium">{{ successMessage }}</span>
    <button 
      @click="showSuccessAlert = false"
      class="ml-2 text-white hover:text-green-100 transition-colors flex-shrink-0"
    >
      <BaseIcon name="x" class="w-3 h-3 sm:w-4 sm:h-4" />
    </button>
  </div>

  <div class="flex flex-col items-start gap-3 sm:gap-4 lg:gap-5 p-2 sm:p-3 lg:p-3">
    <div
        class="flex w-full items-center justify-between rounded-lg sm:rounded-xl lg:rounded-2xl border border-customBlack/10 cursor-pointer hover:border-customRed dark:border-white/10 group p-2 sm:p-3 lg:p-4 transition-all"
        @click="routeToRetailerPage"
    >
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="bg-customRed rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex-center flex-shrink-0">
          <h2 class="text-xs sm:text-sm lg:text-base text-customGrey font-bold font-uppercase pb-1">{{ computedUserInitials }}</h2>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1">
            <h2 class="text-xs sm:text-sm lg:text-base font-semibold dark:text-white truncate">
              {{ computedRetailer?.first_name || 'Unknown' }}
            </h2>
            <BaseIcon
                :size="16"
                class="sm:w-5 sm:h-5 text-customBlue flex-shrink-0"
                name="verified"
            />
          </div>

          <h2
              class="text-xs font-medium text-customBlue transition-all group-hover:text-customRed truncate"
          >
            {{ computedRetailer?.products_count || computedRetailer?.products_amount || 0 }} პროდუქტი
          </h2>
        </div>
      </div>
      <h2
          class="h-5 w-8 sm:h-6 sm:w-10 rounded-full bg-customRed flex-center text-xs sm:text-sm text-white flex-shrink-0"
      >
      {{ computedRetailer?.products_count || computedRetailer?.products_amount || 0 }}
      </h2>
    </div>

    <!-- Contact Owner Button -->
    <div
        class="flex w-full items-center justify-between rounded-lg sm:rounded-xl lg:rounded-2xl border border-customBlack/10 dark:border-white/10 hover:border-customRed dark:hover:border-customRed p-2 sm:p-3 lg:p-4 cursor-pointer group transition-all"
        @click="contactOwner"
    >
      <div class="flex flex-col items-start gap-1 min-w-0 flex-1">
        <h2 class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
          მფლობელთან დაკავშირება
        </h2>
        <p class="text-xs text-customBlack/50 dark:text-white/50 truncate">
          {{ computedRetailer?.email }}
        </p>
      </div>

      <BaseIcon
          :size="20"
          class="sm:w-6 sm:h-6 text-customBlack/70 dark:text-white/70 group-hover:text-customRed flex-shrink-0 ml-2"
          name="mail"
      />
    </div>

    <!-- Product Rating Section -->
    <div class="flex w-full flex-col rounded-lg sm:rounded-xl lg:rounded-2xl border border-customBlack/10 dark:border-white/10 hover:border-customRed dark:hover:border-customRed p-2 sm:p-3 lg:p-4 transition-all">
      <div class="flex w-full items-center justify-between mb-3 sm:mb-4">
        <div class="flex flex-col items-start gap-1 min-w-0 flex-1">
          <h2 class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
            პროდუქციის შეფასება
          </h2>
          <RatingStatusComponent
              :rating="localRating"
              :ratings-amount="localRatingsAmount"
          />
        </div>

        <BaseIcon
            :size="20"
            class="sm:w-6 sm:h-6 text-customBlack/70 dark:text-white/70 cursor-pointer hover:text-customRed flex-shrink-0 ml-2"
            name="star"
        />
      </div>

      <!-- Interactive Star Rating -->
      <div v-if="userStore.user" class="flex flex-col gap-2 sm:gap-3">
        <h3 class="text-xs sm:text-sm font-medium text-customBlack dark:text-white">
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
            class="text-lg sm:text-2xl transition-colors duration-200 cursor-pointer"
            :class="(hoverRating || userRating) && star <= (hoverRating || userRating) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'"
          >
            ★
          </button>
        </div>

        <!-- Submit Rating Button -->
        <BaseButton
          v-if="userRating > 0"
          :height="36"
          :loader="isSubmittingRating"
          class="w-full bg-customRed text-white text-xs sm:text-sm"
          @click="submitRating"
        >
          <BaseIcon :size="16" class="sm:w-5 sm:h-5 text-white" name="send"/>
          <span class="font-medium">შეფასების გაგზავნა</span>
        </BaseButton>
      </div>

      <!-- Login Prompt -->
      <div v-else class="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg gap-2">
        <span class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
          შეფასებისთვის გაიარეთ ავტორიზაცია
        </span>
        <BaseButton
          :height="32"
          class="bg-customBlue text-white text-xs px-3 flex-shrink-0"
          @click="changeDialogState"
        >
          შესვლა
        </BaseButton>
      </div>
    </div>

    <div
        class="flex w-full items-center justify-between rounded-lg sm:rounded-xl lg:rounded-2xl border border-customBlack/10 dark:border-white/10 px-3 sm:px-4 lg:px-6 pb-6 sm:pb-8 pt-3 sm:pt-4 lg:pt-4"
    >
      <div class="flex w-full items-center gap-2 sm:gap-3">
        <div class="flex w-full flex-col items-start gap-4 sm:gap-6">
          <div
              class="flex w-full items-end gap-1 border-b border-customBlack/10 dark:border-white/10 py-3 sm:py-4"
          >
            <p class="text-base sm:text-lg lg:text-2xl font-extrabold text-customRed">
              {{ product?.price }} ₾
            </p>
           
          </div>
          <!-- Product Rental Period Display -->
          <div v-if="product?.rental_period || (product?.rental_start_date && product?.rental_end_date)" 
               class="w-full rounded-lg sm:rounded-xl lg:rounded-2xl border border-customBlack/10 dark:border-white/10 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-blue-50 dark:bg-blue-900/20">
            <div class="flex items-center gap-2 mb-2">
              <BaseIcon :size="18" class="sm:w-5 sm:h-5 text-customBlue" name="info" />
              <h3 class="text-xs sm:text-sm font-semibold text-customBlack dark:text-white">
                გაქირავების პერიოდი
              </h3>
            </div>
            <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
              <template v-if="product.rental_period">
                {{ product.rental_period }}
              </template>
              <template v-else-if="product.rental_start_date && product.rental_end_date">
                {{ formatDate(product.rental_start_date) }} - {{ formatDate(product.rental_end_date) }}
              </template>
            </p>
          </div>

          <div class="relative w-full">
            <div
                class="flex w-full items-center justify-between rounded-lg sm:rounded-xl lg:rounded-2xl border cursor-pointer transition-all border-customBlack/10 dark:border-white/10 hover:border-customRed dark:hover:border-customRed px-3 sm:px-4 lg:px-6 py-3 sm:py-4"
                @click.stop="() => (datePickerOpen = !datePickerOpen)"
            >
              <div class="flex flex-col gap-1 min-w-0">
                <h2 class="text-xs sm:text-sm font-medium dark:text-white">აირჩიე პერიოდი</h2>
                <p v-if="startDate && endDate" class="text-xs text-customBlack/70 dark:text-white/70 truncate">
                  {{ formatDate(startDate) }} - {{ formatDate(endDate) }}
                </p>
                <p v-else class="text-xs text-customBlack/50 dark:text-white/50">
                  აირჩიეთ თარიღები
                </p>
              </div>
              <BaseIcon
                  :size="20"
                  class="sm:w-6 sm:h-6 dark:text-white flex-shrink-0"
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

    <div class="flex flex-col w-full gap-2 sm:gap-3">
      <BaseButton
          :height="44"
          :loader="AddingItemToCart"
          class="w-full bg-customBlack dark:bg-customDarkGrey text-sm sm:text-base"
          @click.left="triggerAddToCart(product)"
      >
        <BaseIcon :size="20" class="sm:w-6 sm:h-6 text-white" name="shopping_bag"/>
        <h2 class="text-xs sm:text-sm font-uppercase font-bold text-white">
          ჩანთაში დამატება
        </h2>
      </BaseButton>
      <BaseButton
          :height="44"
          :loader="isRenting"
          :disabled="!startDate || !endDate"
          class="text-xs sm:text-sm font-uppercase w-full bg-customRed font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          @click="rentProduct"
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
