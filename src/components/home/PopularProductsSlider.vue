<script lang="ts" setup>
import ProductItem from "@/components/products/ProductItem.vue"
import type { IProductListItem } from "@/ts/models/product.types.js"
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

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
  <div class="md:hidden container px-4 sm:px-6">
    <h2 class="text-lg sm:text-xl md:text-2xl font-extrabold mb-3 sm:mb-4 dark:text-white product-list-title">
      {{ t('popularProducts') }}
    </h2>
    <Carousel
      :opts="{
        align: 'start',
      }"
      class="w-full"
    >
      <CarouselContent class="-ml-1 sm:-ml-2"> 
        <CarouselItem 
          v-for="(product, index) in props.products"
          :key="index"
          class="pl-1 sm:pl-2 popular-item"
          :style="{ 'flex': '0 0 calc(50vw - 12px)', 'width': 'calc(50vw - 12px)', 'minWidth': '160px', 'maxWidth': '280px' }"
        >
          <div class="p-1 sm:p-2">
            <ProductItem :item="product" />
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </div>

  <!-- Desktop View -->
  <div class="hidden md:block px-4 lg:px-0">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3 sm:gap-4 mb-4 sm:mb-6">
      <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold font-uppercase dark:text-white">
        {{ t('popularProducts') }}
      </h2>
      <RouterLink 
          :to="routeToPath || '/products'"
          class="text-customRed text-xs sm:text-sm font-medium underline underline-offset-4 hover:opacity-80 transition-opacity whitespace-nowrap"
      >
       {{ t('allProduct') }}
      </RouterLink>
    </div>
    
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
      <ProductItem
        v-for="(product, index) in props.products"
        :key="index"
        :item="product"
      />
    </div>
  </div>
</template>
