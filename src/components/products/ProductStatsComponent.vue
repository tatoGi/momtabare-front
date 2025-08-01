<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import RatingStatusComponent from "@/components/products/product-stats/RatingStatusComponent.vue"
import {IProduct} from "@/ts/models/product.types.ts"
import type { IUser } from "@/ts/models/user-types"
import {addToCart} from "@/services/cart.ts"
import {IBookedDate} from "../../ts/models/product.types"
import RetailerReviewComponent from "../retailer/RetailerReviewComponent.vue"
import ProductReviewComponent from "./ProductReviewComponent.vue"
import {useUserStore} from "@/pinia/user.pinia"
import {computed, onMounted, onUnmounted, ref, watch} from "vue"
import {useRouter} from "vue-router"
import {useCartStore} from "@/pinia/cart.pinia.ts";

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
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
  userStore.getAuthDialogState
      ? (dialogOpen.value = true)
      : userStore.setAuthDialogState(true)
}

function changeRetailerDialogState() {
  userStore.getAuthDialogState
      ? (retailerDialogOpen.value = true)
      : userStore.setAuthDialogState(true)
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

  return computedDisabledDates.value.some((disabledPeriod: any) => {
    const disabledStart = new Date(disabledPeriod.start)
    const disabledEnd = new Date(disabledPeriod.end)

    return rangeStart <= disabledEnd && rangeEnd >= disabledStart
  })
}

watch(selectedDate, (newDate) => {
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
  const firstInitial = computedRetailer.value.first_name?.[0] ?? '';
  const lastInitial = computedRetailer.value.last_name?.[0] ?? '';
  return (firstInitial + lastInitial).toUpperCase();
});


function resetDateRange() {
  startDate.value = null
  endDate.value = null
  selectedDate.value = null
}

function getTomorrowISOString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString();
}

const AddingItemToCart = ref<boolean>(false)

function triggerAddToCart(product: IProduct | null): void {
  if (!product) return
  AddingItemToCart.value = true

  addToCart({
    product_id: product.id,
    quantity: 1,
    start_date: startDate.value || getTomorrowISOString(),
    end_date: endDate.value || getTomorrowISOString(),
  }).finally(() => {
    AddingItemToCart.value = false
  })
  cartStore.fetchCart()
}
</script>

<template>
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
              {{ computedRetailer.first_name }}
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
            პროდუქცია
          </h2>
        </div>
      </div>
      <h2
          class="h-6 w-10 rounded-full bg-customRed text-center text-sm text-white"
      >
        {{ computedRetailer.rating_stats.average ?? 0 }}
      </h2>
    </div>

    <div
        class="flex w-full items-center justify-between rounded-2xl border border-customBlack/10 dark:border-white/10 hover:border-customRed dark:hover:border-customRed p-4 cursor-pointer group transition-all"
        @click="changeDialogState"
    >
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
          class="text-customBlack/70 dark:text-white/70 group-hover:text-customRed"
          name="chevron_right"
      />
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

<style scoped></style>
