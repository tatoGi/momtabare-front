<script lang="ts" setup>
import BaseAlertDialog from "@/components/base/BaseAlertDialog.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { Checkbox } from "@/components/ui/checkbox/index.js"
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field/index.js"
import { IProduct } from "@/ts/models/product.types.ts"
import { removeFromCart, updateCart } from "@/services/cart.ts"
import { useCartStore } from "@/pinia/cart.pinia.ts"
import { computed, watch } from "vue"

const props = defineProps<{
  product: IProduct
  id: number
  rental_days: number
  total_price: string
}>()

const cartStore = useCartStore()

const quantity = defineModel<number>({ default: 1 })

const computedImageUrl = computed<string>(() => {
  return `${import.meta.env.VITE_BACKEND_URL}/${props.product.images[0].url}`
})

async function removeFromCartTrigger(id: number) {
  await removeFromCart(id)
  await cartStore.fetchCart()
}

watch(quantity, async (value) => {
  if (!value) return

  await updateCart(
    { quantity: value, rental_days: props.rental_days },
    props.id,
  )
  await cartStore.fetchCart()
})
</script>

<template>
  <section class="flex items-center justify-between py-4">
    <div class="flex items-center gap-4">
      <Checkbox default-checked />

      <div class="flex items-center gap-4">
        <img :src="computedImageUrl" alt="Product Image" class="h-20 w-20" />

        <div class="flex flex-col gap-2">
          <h2
            class="text-sm font-medium w-64 truncate-two-lines dark:text-white"
          >
            {{ product.name }}
          </h2>
          <div class="flex items-center gap-2">
            <p
              class="text-customBlack/70 dark:text-white/70 text-xs font-medium"
            >
              15 თებ - 22 მარ
            </p>
            <p
              class="text-customBlack/60 dark:text-white/60 text-xs font-medium"
            >
              /
            </p>
            <p
              class="text-customBlack/70 dark:text-white/70 text-xs font-medium"
            >
              ზომა: {{ product.size }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col items-center text-sm">
      <p class="text-customBlack/70 text-white/70 font-medium">დღე</p>
      <p class="font-semibold dark:text-white">{{ rental_days }}</p>
    </div>

    <div class="flex items-center gap-12">
      <NumberField v-model="quantity" :min="1" class="w-28">
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>

      <p class="text-customRed font-extrabold">{{ total_price }} ₾</p>

      <BaseAlertDialog
        :description="product.name"
        title="პროდუქტის წაშლა"
        @action="removeFromCartTrigger(id)"
      >
        <BaseIcon
          :size="24"
          class="cursor-pointer dark:text-white"
          name="delete"
        />
      </BaseAlertDialog>
    </div>
  </section>
</template>
