<script lang="ts" setup>
import type { IProduct } from "@/ts/models/product.types.ts"
import { computed, ref, watch } from "vue"
import { ENV } from "@/utils/config/env"

const props = defineProps<{
  product: IProduct | null
}>()

const backendUrl = ENV.BACKEND_URL
const selectedImageIndex = ref<number>(0)

const computedChosenImage = computed<string | null>(() => {
  if (!props?.product) return null
  return `${backendUrl}/${props.product?.images[selectedImageIndex.value].url}`
})

function productImageStyles(index: number): string {
  return selectedImageIndex.value === index
    ? "border-2 border-customRed"
    : "group"
}

watch(
  () => props.product,
  () => {
    selectedImageIndex.value = 0
  },
  { immediate: true },
)

function selectImage(index: number) {
  selectedImageIndex.value = index
}
</script>
<template>
  <div class="flex flex-col gap-8">
    <div class="w-[464px] h-[314px] flex-center">
      <img
        v-if="computedChosenImage"
        :src="computedChosenImage"
        alt="selected_image"
        class="h-72 w-72"
      />
    </div>
    <div class="grid grid-cols-4 gap-4">
      <div
        v-for="(img, index) in product!.images"
        :key="index"
        :class="productImageStyles(index)"
        class="w-24 h-24 border rounded-2xl cursor-pointer flex-center"
        @click="selectImage(index)"
      >
        <img
          :src="`${backendUrl}/${img.url}`"
          alt="product_image"
          class="w-16 h-16 transition-all group-hover:w-[70px] group-hover:h-[70px]"
        />
      </div>
    </div>
  </div>
</template>
