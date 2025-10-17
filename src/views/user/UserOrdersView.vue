<script lang="ts" setup>
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import BaseNoData from "@/components/base/BaseNoData.vue"
import OrderAccordion from "@/components/order/OrderAccordion.vue"
import { Accordion } from "@/components/ui/accordion"
import { useOrderStore } from "@/pinia/order.pinia.ts"
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const orderStore = useOrderStore()

const orderNavItems = ["ყველა", "მიმდინარე", "ჩაბარებული", "გაუქმებული"]

const selectedOrderNavItem = ref<string>("ყველა")
const isLoading = ref<boolean>(true)

// Fetch orders when component mounts
onMounted(async () => {
  console.log('🔄 Loading user orders...')
  isLoading.value = true
  await orderStore.fetchOrders()
  isLoading.value = false
  console.log('✅ Orders loaded:', orderStore.orders)
})
</script>

<template>
  <main class="pb-20 flex flex-col gap-6">
    <BaseBreadcrumbs :path="['ჩემი შეკვეთები']" disable-route />

    <!-- Loading state -->
    <div v-if="isLoading" class="flex-center py-44">
      <div class="flex flex-col items-center gap-3">
        <div class="w-12 h-12 border-4 border-customRed border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-gray-600 dark:text-gray-400">იტვირთება...</p>
      </div>
    </div>

    <!-- No data state -->
    <div
      v-else-if="!orderStore.orders || orderStore.orders?.length < 1"
      class="flex-center py-44"
    >
      <BaseNoData
        action_title="დაამატე პროდუქცია"
        description="ამ ეტაპზე თქვენ შეკეთები არ გაქვთ"
        title="შეკვეთები ცარიელია"
        @action="router.push({ name: 'products' })"
      />
    </div>

    <!-- Orders list -->
    <div v-else class="flex flex-col gap-10">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1.5">
          <h2 class="dark:text-white text-xl font-extrabold font-uppercase">
            ჩემი შეკვეთები
          </h2>
        </div>
        <div class="flex justify-center">
          <ul class="align-center flex gap-7 text-sm">
            <li
              v-for="orderNavItem in orderNavItems"
              :key="orderNavItem + 1"
              :class="
                selectedOrderNavItem === orderNavItem
                  ? 'bg-customRed/10'
                  : 'hover:bg-customGrey dark:hover:bg-white/10'
              "
              class="flex-center h-9 cursor-pointer rounded-3xl px-6 transition-all"
            >
              <p
                :class="
                  selectedOrderNavItem === orderNavItem
                    ? 'text-customRed dark:text-customRed'
                    : 'dark:text-white'
                "
                class="text-sm font-semibold transition-all"
              >
                {{ orderNavItem }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <Accordion class="flex flex-col gap-4" collapsible type="single">
      <OrderAccordion />
    </Accordion>
  </main>
</template>
