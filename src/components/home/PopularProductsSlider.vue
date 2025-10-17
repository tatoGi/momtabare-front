<script lang="ts" setup>
import ProductItem from "@/components/products/ProductItem.vue"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import type { IProductListItem } from "@/ts/models/product.types.js"
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const props = defineProps<{
  products: IProductListItem[]
  routeToPath?: string
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
  <!-- Mobile Carousel View -->
  <div class="md:hidden py-4 sm:py-6">
    <div class="px-4 sm:px-6">
      <h2 class="text-lg sm:text-xl font-extrabold mb-4 dark:text-white">
        {{ t('popularProducts') }}
      </h2>
    </div>
    <Carousel
      :opts="{
        align: 'start',
        slidesToScroll: 1,
        containScroll: 'trimSnaps',
      }"
      class="w-full"
    >
      <CarouselContent class="-ml-4 px-4"> 
        <CarouselItem 
          v-for="product in props.products"
          :key="product.id || product.slug || product.sku"
          class="pl-4 basis-auto"
        >
          <ProductItem :item="product" :force-vertical="true" />
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
        v-for="product in props.products"
        :key="product.id || product.slug || product.sku"
        :item="product"
      />
    </div>
  </div>
</template>
