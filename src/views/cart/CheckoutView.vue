<script lang="ts" setup>
import CartDetailsComponent from "@/components/cart/CartDetailsComponent.vue"
import CheckoutProductItem from "@/components/cart/CheckoutProductItem.vue"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ICart } from "@/ts/models/cart.types"
import { IUser } from "@/ts/models/user-types"
import { useCartStore } from "@/pinia/cart.pinia"
import { useUserStore } from "@/pinia/user.pinia"
import { computed, ref, watch } from "vue"
import { useBogPayment } from '@/services/bogPayment'
import type { ISavedCardSummary } from '@/services/bogPayment'
import { useI18n } from 'vue-i18n'

const cartStore = useCartStore()
const userStore = useUserStore()
const { processCheckout } = useBogPayment()
const { t } = useI18n()

const fullName = ref<string>()
const phoneNumber = ref<string>()
const saveCard = ref<boolean>(false)
const savedCards = ref<ISavedCardSummary[]>([])
const selectedCardId = ref<string | null>(null)
const selectedSavedCard = computed(() => savedCards.value.find(c => c.id === selectedCardId.value) || null)

async function handleSelectOtherCard(): Promise<void> {
  selectedCardId.value = null
  try {
    await processCheckout(cart.value, saveCard.value, null)
  } catch (e) {
    // swallow to avoid crashing UI; errors are logged inside service
  }
}

const cart = computed<ICart | null>(() => {
  return cartStore.getCart
})

const user = computed<IUser | null>(() => {
  return userStore.getUser
})

watch(
  user,
  (value) => {
    if (!value) return

    fullName.value = user.value?.first_name + " " + user.value?.last_name
    phoneNumber.value = user.value?.email
  },
  { immediate: true },
)

// Lazy load saved cards when checkout page is opened
import bogPaymentService from '@/services/bogPayment'
bogPaymentService.getSavedCards?.().then(cards => {
  if (Array.isArray(cards)) savedCards.value = cards
}).catch(() => {})
</script>

<template>
  <main>
    <div class="flex gap-7 pt-9 pb-28">
      <div class="w-full flex flex-col gap-5">
        <div
          class="border border-customBlack/10 rounded-2xl flex px-8 py-6 gap-6"
        >
          <div class="flex flex-col gap-2 min-w-[430px]">
            <h2 class="font-bold">{{ t('checkout.contactInfoTitle') }}</h2>
            <p class="text-sm text-customBlack/70">
              {{ t('checkout.contactInfoHint') }}
            </p>
          </div>

          <div class="flex flex-col gap-5 w-full">
            <Input v-model="fullName" />
            <Input v-model="phoneNumber" />
          </div>
        </div>

        <div
          class="border border-customBlack/10 rounded-2xl flex px-8 py-6 gap-6"
        >
          <div class="flex flex-col gap-2 min-w-[430px]">
            <h2 class="font-bold">{{ t('checkout.paymentMethodTitle') }}</h2>
            <p class="text-sm text-customBlack/70">
              {{ t('checkout.paymentMethodHint') }}
            </p>
          </div>

          <div class="flex flex-col gap-4 w-full">
            <template v-if="savedCards.length">
              <div
                v-for="card in savedCards"
                :key="card.id"
                class="border border-customBlack/10 flex justify-between items-center rounded-xl px-5 py-2.5 cursor-pointer"
                :class="{ 'ring-2 ring-customRed': selectedCardId === card.id }"
                @click="selectedCardId = card.id"
              >
                <div class="flex items-center gap-3">
                  <img :src="card.brand?.toLowerCase() === 'visa' ? visa : mastercard" :alt="card.brand" />
                  <p class="text-sm font-semibold">{{ card.brand?.toUpperCase() }}</p>
                </div>
                <p class="text-sm font-bold">**** {{ card.last4 }}</p>
              </div>
            </template>

            <div
              class="border border-customBlack/10 flex justify-center items-center rounded-xl py-4 cursor-pointer"
              :class="{ 'ring-2 ring-customRed': !selectedCardId }"
              @click="handleSelectOtherCard"
            >
              <p class="text-sm font-semibold">{{ t('checkout.payWithOtherCard') }}</p>
            </div>
            <p v-if="!selectedCardId" class="text-xs text-customBlack/70 px-1">
              {{ t('checkout.otherCardHint') }}
            </p>

            <div class="flex items-center gap-2">
              <Checkbox id="terms" v-model:checked="saveCard" />
              <Label class="text-sm font-medium" for="terms">
                {{ t('checkout.rememberCard') }}
              </Label>
            </div>
          </div>
        </div>

        <div
          class="border border-customBlack/10 rounded-2xl flex px-8 py-6 gap-6"
        >
          <div class="flex flex-col gap-2 min-w-[430px]">
            <h2 class="font-bold">{{ t('checkout.productsTitle') }}</h2>
            <p class="text-sm text-customBlack/70">
              {{ t('checkout.productsHint') }}
            </p>
          </div>

          <div class="flex flex-col gap-2 w-full">
            <CheckoutProductItem
              v-for="cartItem in cart?.items"
              :key="cartItem.id"
              :product="cartItem.product"
            />
          </div>
        </div>
      </div>

      <CartDetailsComponent :cart="cart" @checkout="() => processCheckout(cart, saveCard, selectedSavedCard)" />
    </div>
  </main>
</template>
