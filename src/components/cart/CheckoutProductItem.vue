<script lang="ts" setup>
import type { IProduct } from "@/ts/models/product.types"
import { computed } from "vue"

const props = defineProps<{
  product: IProduct
}>()

const computedImageUrl = computed<string>(() => {
  return `${props.product.images[0].url}`
})
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <img :src="computedImageUrl" alt="productImage" class="w-20 h-20" />
      <div class="flex flex-col gap-2">
        <p class="text-sm font-semibold w-64 truncate-two-lines">
          {{ product.name }}
        </p>
        <p class="text-xs text-customBlack/70 font-medium">2 დღე</p>
      </div>
    </div>
    <h2 class="text-customRed font-extrabold">{{ product.price }} ₾</h2>
  </div>
</template>
