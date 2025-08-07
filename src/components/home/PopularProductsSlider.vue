<script lang="ts" setup>
import ProductItem from "@/components/products/ProductItem.vue"
import type { IProductListItem } from "@/ts/models/product.types.js"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { onMounted, ref } from "vue"

const props = defineProps<{
  products: IProductListItem[]
}>()

const isMobile = ref(false)

const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkIfMobile()
  window.addEventListener('resize', checkIfMobile)
  return () => {
    window.removeEventListener('resize', checkIfMobile)
  }
})
</script>

<template>
  <div class="md:hidden container">
    <h2 class="text-2xl font-extrabold mb-4 dark:text-white product-list-title">
      {{ $t('popularProducts') }}
    </h2>
    <Carousel
      :opts="{
        align: 'start',
      }"
      class="w-full"
    >
      <CarouselContent> 
        <CarouselItem 
          v-for="(product, index) in props.products"
          :key="index"
          class="pl-1 popular-item"
          style="flex: 0 0 255px; width: 255px;"
        >
          <div class="p-1">
            <ProductItem :item="product" />
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </div>

  <!-- Desktop View -->
  <div class="hidden md:block">
    <h2 class="text-2xl font-extrabold mb-4 dark:text-white">
      {{ $t('popularProducts') }}
    </h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ProductItem
        v-for="(product, index) in props.products"
        :key="index"
        :item="product"
      />
    </div>
  </div>
</template>
