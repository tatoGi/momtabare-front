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
  if (!props?.product || !props.product.images || props.product.images.length === 0) {
    return null
  }
  const image = props.product.images[selectedImageIndex.value]
  if (!image?.url) return null
  return `${backendUrl}/${image.url}`
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
    <div class="w-[464px] h-[314px] flex-center  rounded-lg">
      <img
        v-if="computedChosenImage"
        :src="computedChosenImage"
        alt="selected_image"
        class="h-72 w-72 object-contain"
      />
      <div v-else class="flex flex-col items-center justify-center text-gray-500">
        <div class="w-24 h-24 bg-gray-300 rounded-lg mb-4"></div>
        <p>No image available</p>
      </div>
    </div>
    <div v-if="product?.images && product.images.length > 0" class="grid grid-cols-4 gap-4">
      <div
        v-for="(img, index) in product.images"
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
    <div v-else class="flex items-center justify-center h-24 text-gray-500">
      No images available
    </div>
  </div>
</template>
