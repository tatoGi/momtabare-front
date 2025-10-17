<script lang="ts" setup>
import type { IProduct } from "@/ts/models/product.types.ts"
import { computed, ref, watch } from "vue"

const props = defineProps<{
  product: IProduct | null
  classVariant?: "mobile" | "desktop"
}>()

const selectedImageIndex = ref<number>(0)

const computedChosenImage = computed<string | null>(() => {
  if (!props?.product || !props.product.images || props.product.images.length === 0) {
    return null
  }
  const image = props.product.images[selectedImageIndex.value]
  if (!image?.url) return null
  return `${image.url}`
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
  <div class="flex flex-col gap-4 sm:gap-6 lg:gap-8">
    <!-- Main Image Container -->
    <div 
      class="w-full flex-center rounded-lg bg-gray-100 dark:bg-gray-800"
      :class="props.classVariant === 'mobile' ? 'h-64 sm:h-72' : 'w-full h-64 sm:h-80 lg:h-[314px]'"
    >
      <img
        v-if="computedChosenImage"
        :src="computedChosenImage"
        alt="selected_image"
        class="h-48 w-48 sm:h-56 sm:w-56 lg:h-72 lg:w-72 object-contain"
      />
      <div v-else class="flex flex-col items-center justify-center text-gray-500">
        <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 rounded-lg mb-3 sm:mb-4"></div>
        <p class="text-xs sm:text-sm">No image available</p>
      </div>
    </div>

    <!-- Thumbnail Images -->
    <div v-if="product?.images && product.images.length > 0" class="grid gap-2 sm:gap-3 lg:gap-4" :class="props.classVariant === 'mobile' ? 'grid-cols-4 sm:grid-cols-5 lg:grid-cols-4' : 'grid-cols-4'">
      <div
        v-for="(img, index) in product.images"
        :key="index"
        :class="[productImageStyles(index), props.classVariant === 'mobile' ? 'h-16 sm:h-20 lg:h-24' : 'h-24']"
        class="border rounded-lg sm:rounded-xl lg:rounded-2xl cursor-pointer flex-center transition-all"
        @click="selectImage(index)"
      >
        <img
          :src="`${img.url}`"
          alt="product_image"
          class="w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 transition-all group-hover:scale-110"
        />
      </div>
    </div>
    <div v-else class="flex items-center justify-center h-16 sm:h-20 text-gray-500 text-xs sm:text-sm">
      No images available
    </div>
  </div>
</template>
