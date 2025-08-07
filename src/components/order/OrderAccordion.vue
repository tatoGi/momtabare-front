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
console.log(orders)

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
  <AccordionItem
    v-for="order in orders.pending"
    v-if="orders"
    :key="order.id"
    :value="order.id.toString()"
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
            <p class="text-sm font-semibold dark:text-white">#{{ order.id }}</p>
          </div>
        </div>
        <div class="flex flex-col items-start gap-1">
          <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
            თარიღი
          </p>
          <p class="text-sm font-semibold dark:text-white">
            {{ formatIsoDateToHumanReadable(order.order_placed_at) }}
          </p>
        </div>
        <div class="flex flex-col items-start gap-1">
          <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
            შეკვეთის ჯამი
          </p>
          <p class="text-sm font-semibold gap-1 dark:text-white">
            {{ order.product.price }} ₾
          </p>
        </div>
        <div class="flex flex-col items-start gap-1">
          <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
            სტატუსი
          </p>
          <p class="text-sm font-semibold text-customRed">{{ order.status }}</p>
        </div>
        <div class="flex flex-col items-start gap-1">
          <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
            რაოდენობა
          </p>
          <p class="text-sm font-semibold dark:text-white">1</p>
        </div>
      </div>
    </AccordionTrigger>
    <AccordionContent
      class="border-t border-customBlack/10 dark:border-white/10 flex flex-col"
    >
      <div class="flex py-2">
        <section class="w-9/12 pr-6">
          <div v-if="orders" class="flex items-center justify-between py-4">
            <div class="flex items-center gap-4">
              <img
                :src="getAssetUrl(order.product.images[0].url)"
                alt="Product Image"
                class="h-20 w-20"
              />

              <div class="flex flex-col gap-2.5">
                <h2
                  class="text-sm font-medium dark:text-white w-72 truncate-two-lines"
                >
                  {{ order.product.name }}
                </h2>
                <div class="flex items-center gap-2">
                  <p
                    class="text-customBlack/70 dark:text-white/70 text-xs font-medium"
                  >
                    {{
                      convertDateRangeToGeorgian(
                        order.rental_period.start_date,
                        order.rental_period.end_date,
                      )
                    }}
                  </p>
                  <p
                    class="text-customBlack/60 dark:text-white/60 text-xs font-medium"
                  >
                    /
                  </p>
                  <p
                    class="text-customBlack/70 dark:text-white/70 text-xs font-medium"
                  >
                    ზომა: {{ order.product.size }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-center text-sm">
              <p class="text-customBlack/70 dark:text-white/70 font-medium">
                დღე
              </p>
              <p class="font-semibold dark:text-white">
                {{ order.rental_period.total_days }}
              </p>
            </div>

            <div class="flex flex-col items-center text-sm">
              <p class="text-customBlack/70 dark:text-white/70 font-medium">
                ღირებულება
              </p>
              <p class="font-semibold dark:text-white">
                {{ order.product.price }} ₾
              </p>
            </div>

            <BaseButton
              :height="38"
              class="bg-customRed text-white text-xs font-bold font-uppercase px-6"
              >შეაფასე
            </BaseButton>
          </div>
        </section>
        <section class="py-4">
          <div
            class="flex flex-col border-l border-customBlack/10 dark:border-white/10 px-6 gap-7 h-full pt-4"
          >
            <div class="flex flex-col items-start">
              <p class="text-sm text-customBlack/70 dark:text-white/70">
                მიმღები
              </p>
              <p class="text-sm font-semibold dark:text-white">
                გიორგი თარხნიშვილი
              </p>
            </div>
            <div class="flex flex-col items-start">
              <p class="text-sm text-customBlack/70 dark:text-white/70">
                ტელეფონი
              </p>
              <p class="text-sm font-semibold dark:text-white">
                +995 577 23 12 98
              </p>
            </div>
            <div class="flex flex-col items-start">
              <p class="text-sm text-customBlack/70 dark:text-white/70">
                გადახდის მეთოდი
              </p>
              <p class="text-sm font-semibold dark:text-white">**** 6758</p>
            </div>
            <div class="flex flex-col items-start">
              <p class="text-sm text-customBlack/70 dark:text-white/70">
                სრული თანხა
              </p>
              <p class="text-sm font-semibold dark:text-white">170.00 ლ</p>
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
