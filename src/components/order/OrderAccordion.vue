<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { IOrderState } from "@/ts/pinia/order.types.ts"
import { useOrderStore } from "@/pinia/order.pinia.ts"
import { getAssetUrl } from "@/utils/config/env"
import { computed } from "vue"

const orderStore = useOrderStore()

const orders = computed<IOrderState["orders"]>(() => {
  return orderStore.getOrders
})

// Computed to handle both old order format and new payment format
const displayOrders = computed(() => {
  if (!orders.value) return []
  
  // If it's an array, return as is (payment format)
  if (Array.isArray(orders.value)) {
    return orders.value
  }
  
  // If it has pending property (old format), return pending orders
  if (orders.value.pending) {
    return orders.value.pending
  }
  
  return []
})

console.log('Orders:', orders.value)
console.log('Display Orders:', displayOrders.value)

function convertDateRangeToGeorgian(
  startDateStr: string,
  endDateStr: string,
): string {
  const georgianMonths = [
    "იან",
    "თებ",
    "მარ",
    "აპრ",
    "მაი",
    "ივნ",
    "ივლ",
    "აგვ",
    "სექ",
    "ოქტ",
    "ნოე",
    "დეკ",
  ]

  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)

  const startDay = startDate.getUTCDate()
  const startMonth = georgianMonths[startDate.getUTCMonth()]
  const endDay = endDate.getUTCDate()
  const endMonth = georgianMonths[endDate.getUTCMonth()]

  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`
}

function formatIsoDateToHumanReadable(isoDate: string): string {
  const date = new Date(isoDate)

  const day = date.getUTCDate().toString().padStart(2, "0")
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
  const year = date.getUTCFullYear()

  return `${day}.${month}.${year}`
}
</script>

<template>
  <template v-if="displayOrders && displayOrders.length > 0">
    <AccordionItem
      v-for="order in displayOrders"
      :key="order.id || order.order_id"
      :value="String(order.id || order.order_id)"
    >
      <AccordionTrigger arrow-icon="keyboard_arrow_down" class="w-full gap-36">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-14">
            <div
              class="w-12 h-12 bg-customGrey dark:bg-customDarkGrey flex-center rounded-full"
            >
              <BaseIcon :size="24" class="dark:text-white" name="shopping_bag" />
            </div>
            <div class="flex flex-col items-start gap-1">
              <p
                class="text-sm font-medium text-customBlack/70 dark:text-white/70"
              >
                ID
              </p>
              <p class="text-sm font-semibold dark:text-white">#{{ order.order_id || order.id }}</p>
            </div>
          </div>
          <div class="flex flex-col items-start gap-1">
            <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
              თარიღი
            </p>
            <p class="text-sm font-semibold dark:text-white">
              {{ order.created_at ? formatIsoDateToHumanReadable(order.created_at) : (order.order_placed_at ? formatIsoDateToHumanReadable(order.order_placed_at) : 'N/A') }}
            </p>
          </div>
          <div class="flex flex-col items-start gap-1">
            <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
              შეკვეთის ჯამი
            </p>
            <p class="text-sm font-semibold gap-1 dark:text-white">
              {{ order.amount || (order.product?.price) || '0' }} ₾
            </p>
        </div>
        <div class="flex flex-col items-start gap-1">
          <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
            სტატუსი
          </p>
          <p class="text-sm font-semibold text-customRed">{{ order.status || 'მიმდინარე' }}</p>
        </div>
        <div class="flex flex-col items-start gap-1">
          <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
            რაოდენობა
          </p>
          <p class="text-sm font-semibold dark:text-white">{{ order.items?.length || order.basket?.length || 1 }}</p>
        </div>
      </div>
    </AccordionTrigger>
    <AccordionContent
      class="border-t border-customBlack/10 dark:border-white/10 flex flex-col"
    >
      <div class="flex py-2">
        <section class="w-9/12 pr-6">
          <!-- Display order items if available -->
          <div v-if="order.items && order.items.length > 0" class="flex flex-col gap-4">
            <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between py-4">
              <div class="flex items-center gap-4">
                <img
                  v-if="item.product?.images?.[0]?.url"
                  :src="getAssetUrl(item.product.images[0].url)"
                  alt="Product Image"
                  class="h-20 w-20 object-cover rounded"
                />
                <div v-else class="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                  <BaseIcon :size="32" class="text-gray-400" name="image" />
                </div>

                <div class="flex flex-col gap-2.5">
                  <h2 class="text-sm font-medium dark:text-white w-72 truncate-two-lines">
                    {{ item.product?.name || item.name || 'პროდუქტი' }}
                  </h2>
                  <div class="flex items-center gap-2">
                    <p v-if="item.rental_period" class="text-customBlack/70 dark:text-white/70 text-xs font-medium">
                      {{
                        convertDateRangeToGeorgian(
                          item.rental_period.start_date,
                          item.rental_period.end_date,
                        )
                      }}
                    </p>
                    <p v-if="item.product?.size" class="text-customBlack/60 dark:text-white/60 text-xs font-medium">/</p>
                    <p v-if="item.product?.size" class="text-customBlack/70 dark:text-white/70 text-xs font-medium">
                      ზომა: {{ item.product.size }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col items-center text-sm">
                <p class="text-customBlack/70 dark:text-white/70 font-medium">რაოდენობა</p>
                <p class="font-semibold dark:text-white">{{ item.quantity || 1 }}</p>
              </div>

              <div class="flex flex-col items-center text-sm">
                <p class="text-customBlack/70 dark:text-white/70 font-medium">ღირებულება</p>
                <p class="font-semibold dark:text-white">{{ item.unit_price || item.product?.price || '0' }} ₾</p>
              </div>
            </div>
          </div>
          
          <!-- Fallback for old order format with single product -->
          <div v-else-if="order.product" class="flex items-center justify-between py-4">
            <div class="flex items-center gap-4">
              <img
                :src="getAssetUrl(order.product.images[0].url)"
                alt="Product Image"
                class="h-20 w-20"
              />

              <div class="flex flex-col gap-2.5">
                <h2 class="text-sm font-medium dark:text-white w-72 truncate-two-lines">
                  {{ order.product.name }}
                </h2>
                <div class="flex items-center gap-2">
                  <p class="text-customBlack/70 dark:text-white/70 text-xs font-medium">
                    {{
                      convertDateRangeToGeorgian(
                        order.rental_period.start_date,
                        order.rental_period.end_date,
                      )
                    }}
                  </p>
                  <p class="text-customBlack/60 dark:text-white/60 text-xs font-medium">/</p>
                  <p class="text-customBlack/70 dark:text-white/70 text-xs font-medium">
                    ზომა: {{ order.product.size }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-center text-sm">
              <p class="text-customBlack/70 dark:text-white/70 font-medium">დღე</p>
              <p class="font-semibold dark:text-white">{{ order.rental_period.total_days }}</p>
            </div>

            <div class="flex flex-col items-center text-sm">
              <p class="text-customBlack/70 dark:text-white/70 font-medium">ღირებულება</p>
              <p class="font-semibold dark:text-white">{{ order.product.price }} ₾</p>
            </div>

            <BaseButton
              :height="38"
              class="bg-customRed text-white text-xs font-bold font-uppercase px-6"
            >
              შეაფასე
            </BaseButton>
          </div>
          
          <!-- No items message -->
          <div v-else class="py-8 text-center">
            <p class="text-sm text-customBlack/70 dark:text-white/70">პროდუქტის ინფორმაცია მიუწვდომელია</p>
          </div>
        </section>
        <section class="py-4">
          <div
            class="flex flex-col border-l border-customBlack/10 dark:border-white/10 px-6 gap-7 h-full pt-4"
          >
            <div class="flex flex-col items-start">
              <p class="text-sm text-customBlack/70 dark:text-white/70">
                გადახდის მეთოდი
              </p>
              <p class="text-sm font-semibold dark:text-white">
                {{ order.payment_method || (order.card_mask ? `**** ${order.card_mask.slice(-4)}` : 'ბარათი') }}
              </p>
            </div>
            <div class="flex flex-col items-start">
              <p class="text-sm text-customBlack/70 dark:text-white/70">
                სრული თანხა
              </p>
              <p class="text-sm font-semibold dark:text-white">
                {{ order.amount || order.total_amount || '0.00' }} ₾
              </p>
            </div>
            <div class="flex flex-col items-start">
              <p class="text-sm text-customBlack/70 dark:text-white/70">
                სტატუსი
              </p>
              <p class="text-sm font-semibold" :class="{
                'text-green-600': order.status === 'completed' || order.status === 'success',
                'text-yellow-600': order.status === 'pending' || order.status === 'მიმდინარე',
                'text-red-600': order.status === 'failed' || order.status === 'გაუქმებული',
                'text-customRed': !['completed', 'success', 'pending', 'მიმდინარე', 'failed', 'გაუქმებული'].includes(order.status)
              }">
                {{ order.status || 'მიმდინარე' }}
              </p>
            </div>
          </div>
        </section>
      </div>
      <section
        class="border-t border-customBlack/10 dark:border-white/10 flex items-center justify-between pt-5"
      >
        <BaseButton :height="36" class="bg-customRed flex-center px-6">
          <BaseIcon :size="24" class="text-white" name="autorenew" />
          <p class="text-white text-xs font-bold font-uppercase">
            გაიმეორე შეკვეთა
          </p>
        </BaseButton>
        <div class="flex items-center gap-1 cursor-pointer group">
          <p
            class="text-customBlue text-xs font-semibold group-hover:text-opacity-85"
          >
            ინვოისის ჩამოტვირთვა
          </p>
          <BaseIcon
            :size="24"
            class="text-customBlue group-hover:text-opacity-85"
            name="download"
          />
        </div>
      </section>
    </AccordionContent>
  </AccordionItem>
  </template>
  
  <!-- No orders message -->
  <div v-else class="py-12 text-center">
    <p class="text-base text-customBlack/70 dark:text-white/70">შეკვეთები არ მოიძებნა</p>
  </div>
</template>
