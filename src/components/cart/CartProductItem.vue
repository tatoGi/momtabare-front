<script lang="ts" setup>
import BaseAlertDialog from "@/components/base/BaseAlertDialog.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { Checkbox } from "@/components/ui/checkbox/index.js"
import NumberField from "@/components/ui/number-field/NumberField.vue"
import NumberFieldContent from "@/components/ui/number-field/NumberFieldContent.vue"
import NumberFieldDecrement from "@/components/ui/number-field/NumberFieldDecrement.vue"
import NumberFieldIncrement from "@/components/ui/number-field/NumberFieldIncrement.vue"
import NumberFieldInput from "@/components/ui/number-field/NumberFieldInput.vue"
import type { IProduct } from "@/ts/models/product.types"
import { removeFromCart, updateCartItem } from "@/services/cart"
import { useCartStore } from "@/pinia/cart.pinia"
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
  return `${props.product.images[0].url}`
})

async function removeFromCartTrigger(id: number) {
  await removeFromCart(id)
  await cartStore.fetchCart()
}

watch(quantity, async (value: number) => {
  if (!value) return

  try {
    const result = await updateCartItem(
      { quantity: value, rental_days: props.rental_days },
      props.id,
    )
    
    if (result.success) {
      // Only refresh cart if update was successful
      await cartStore.fetchCart()
    } else {
      console.error('Failed to update cart item:', result.message)
      // Optionally revert the quantity change or show error message
    }
  } catch (error) {
    console.error('Error updating cart item:', error)
  }
})
</script>

<template>
  <!-- Desktop/Tablet View -->
  <section class="hidden sm:flex items-center justify-between py-4">
    <div class="flex items-center gap-4">
      <Checkbox default-checked />

      <div class="flex items-center gap-4">
        <img :src="computedImageUrl" alt="Product Image" class="h-20 w-20 rounded-lg object-cover" />

        <div class="flex flex-col gap-2">
          <h2
            class="text-sm font-medium w-64 truncate-two-lines dark:text-white"
          >
            {{ props.product.name }}
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
              ზომა: {{ props.product.size }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col items-center text-sm">
      <p class="text-customBlack/70 text-white/70 font-medium">დღე</p>
      <p class="font-semibold dark:text-white">{{ props.rental_days }}</p>
    </div>

    <div class="flex items-center gap-12">
      <NumberField v-model="quantity" :min="1" class="w-28">
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>

      <p class="text-customRed font-extrabold">{{ props.total_price }} ₾</p>

      <BaseAlertDialog
        :description="props.product.name"
        title="პროდუქტის წაშლა"
        @action="removeFromCartTrigger(props.id)"
      >
        <BaseIcon
          :size="24"
          class="cursor-pointer dark:text-white"
          name="delete"
        />
      </BaseAlertDialog>
    </div>
  </section>

  <!-- Mobile View -->
  <section class="flex sm:hidden flex-col py-3 gap-3">
    <div class="flex gap-3">
      <!-- Product Image -->
      <img :src="computedImageUrl" alt="Product Image" class="h-20 w-20 rounded-lg object-cover flex-shrink-0" />

      <!-- Product Info -->
      <div class="flex flex-col flex-1 min-w-0 gap-1.5">
        <h2 class="text-sm font-medium line-clamp-2 dark:text-white">
          {{ props.product.name }}
        </h2>
        <div class="flex items-center gap-2 text-[10px]">
          <p class="text-customBlack/70 dark:text-white/70 font-medium whitespace-nowrap">
            15 თებ - 22 მარ
          </p>
          <p class="text-customBlack/60 dark:text-white/60 font-medium">/</p>
          <p class="text-customBlack/70 dark:text-white/70 font-medium">
            ზომა: {{ props.product.size }}
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <p class="text-customBlack/70 dark:text-white/70 font-medium">დღე:</p>
          <p class="font-semibold dark:text-white">{{ props.rental_days }}</p>
        </div>
      </div>

      <!-- Delete Button -->
      <BaseAlertDialog
        :description="props.product.name"
        title="პროდუქტის წაშლა"
        @action="removeFromCartTrigger(props.id)"
      >
        <BaseIcon
          :size="20"
          class="cursor-pointer dark:text-white flex-shrink-0"
          name="delete"
        />
      </BaseAlertDialog>
    </div>

    <!-- Bottom: Quantity and Price -->
    <div class="flex items-center justify-between">
      <NumberField v-model="quantity" :min="1" class="w-24">
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput class="text-xs" />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>

      <p class="text-customRed font-extrabold text-base">{{ props.total_price }} ₾</p>
    </div>
  </section>
</template>
