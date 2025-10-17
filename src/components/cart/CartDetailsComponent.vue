<script setup lang="ts">
import BaseButton from "@/components/base/BaseButton.vue"
import { Input } from "@/components/ui/input"
import { ICart } from "@/ts/models/cart.types"
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  cart: ICart | null
}>()

const emit = defineEmits<{
  (e: 'checkout'): void
}>()

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

async function orderButtonAction(): Promise<void> {
  if (route.path !== "/checkout") {
    await router.push({ name: "checkout" })
    return
  }
  emit('checkout')
}
</script>

<template>
  <div class="flex flex-col gap-4 sm:gap-6 w-full lg:w-auto">
    <section
      class="border border-customBlack/10 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:gap-4"
    >
      <h2 class="font-extrabold font-uppercase text-sm sm:text-base">{{ t('checkout.orderDetailsTitle') }}</h2>

      <div class="flex items-center justify-between">
        <p class="text-customBlack/70 text-xs sm:text-sm font-medium">{{ t('checkout.itemsCount') }}</p>
        <p class="text-xs sm:text-sm font-bold">{{ cart?.items?.length || 0 }}</p>
      </div>
      <div class="flex items-center justify-between">
        <p class="text-customBlack/70 text-xs sm:text-sm font-medium">{{ t('checkout.discount') }}</p>
        <p class="text-xs sm:text-sm font-bold">0.00 ₾</p>
      </div>
      <div class="flex items-center justify-between pb-1.5">
        <p class="text-customBlack/70 text-xs sm:text-sm font-medium">{{ t('checkout.productsCost') }}</p>
        <p class="text-xs sm:text-sm font-bold">{{ cart?.total_price ? cart.total_price.toFixed(2) : '0.00' }} ₾</p>
      </div>
      <div class="h-[1px] bg-customBlack/10"></div>
      <div class="flex items-center justify-between">
        <p class="text-xs sm:text-sm font-semibold">{{ t('checkout.total') }}</p>
        <p class="text-customRed font-extrabold text-base sm:text-lg">
          {{ cart?.total_price ? cart.total_price.toFixed(2) : '0.00' }} ₾
        </p>
      </div>
    </section>

    <section
      class="border border-customBlack/10 rounded-2xl px-4 sm:px-6 pt-3 sm:pt-4 pb-6 sm:pb-9 flex flex-col gap-3"
    >
      <h2 class="font-extrabold font-uppercase text-sm sm:text-base">{{ t('checkout.promoCodeTitle') }}</h2>
      <Input class="bg-customGrey" :placeholder="t('checkout.promoCodePlaceholder')" />
    </section>

    <BaseButton
      :height="48"
      class="bg-customRed w-full lg:w-[356px]"
      @click.left="orderButtonAction"
    >
      <p class="text-white text-sm font-bold font-uppercase">
        {{ t('checkout.placeOrder') }}
      </p>
    </BaseButton>
  </div>
</template>
