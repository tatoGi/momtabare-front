<script lang="ts" setup>
import { IProduct } from "@/ts/models/product.types.ts"
import { computed } from "vue"

const props = defineProps<{
  product: IProduct
}>()

const computedImageUrl = computed<string>(() => {
  return `${import.meta.env.VITE_BACKEND_URL}/${props.product.images[0].url}`
})
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <img :src="computedImageUrl" alt="productImage" class="w-20 h-20" />
      <div class="flex flex-col gap-2">
        <p class="text-sm font-semibold w-64 truncate-two-lines">
          {{ product.name }} dfa dfasd fasd fasdf jasi fasdfasodij
          asdfasdfasdfjasmdfkjn
        </p>
        <p class="text-xs text-customBlack/70 font-medium">2 დღე</p>
      </div>
    </div>
    <h2 class="text-customRed font-extrabold">{{ product.price }} ₾</h2>
  </div>
</template>
