<script lang="ts" setup>
import { watchOnce } from "@vueuse/core"
import SliderPaginatorComponent from "@/components/home/slider/SliderPaginatorComponent.vue"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { ref, computed } from "vue"
import type { IBanner } from '@/ts/models/page.types'
import { getBannerTranslation } from '@/services/pages'
import { useAppStore } from '@/pinia/app.pinia'
import { ELanguages } from '@/ts/pinia/app.types'
import { getStorageUrl } from '@/utils/config/env'

// Props
const props = defineProps<{
  banners?: IBanner[]
  title?: string
}>()

const appStore = useAppStore()

// Get current locale
const currentLocale = computed(() => {
  return appStore.language === ELanguages.KA ? 'ka' : 'en'
})

// Get localized title
const localizedTitle = computed(() => {
  if (props.title) return props.title
  
  // Use first banner's title if available
  if (props.banners && props.banners.length > 0) {
    const firstBanner = props.banners[0]
    const translation = getBannerTranslation(firstBanner, currentLocale.value)
    return translation.title
  }
  
  // Fallback to default text
  return currentLocale.value === 'ka' 
    ? 'აღმოაჩინე შენი შემდეგი თავგადასავალი MOMTABARE-სთან ერთად.'
    : 'Discover your next adventure with MOMTABARE.'
})

// Define banner display type
interface BannerDisplay {
  id: string | number
  title: string
  desc: string
  image: string
  character?: string
}

// Process banners for display - only show banners with valid images from backend
const processedBanners = computed((): BannerDisplay[] => {
  if (!props.banners || props.banners.length === 0) {
    return []
  }
  
  const slides: BannerDisplay[] = []
  
  // Only process banners that have images
  props.banners.forEach((banner: IBanner) => {
    const translation = getBannerTranslation(banner, currentLocale.value)
    
    // Only process banners with images
    if (banner.images?.length) {
      banner.images.forEach((bannerImage, index) => {
        const imageUrl = getStorageUrl(bannerImage.image_name)
        
        slides.push({
          id: `${banner.id}-${index}`,
          title: translation.title,
          desc: translation.desc,
          image: imageUrl
        })
      })
    }
  })
  
  return slides
})

const api = ref<CarouselApi>()
const totalSlides = ref<number>(0)
const currentSlide = ref<number>(0)

function setApi(val: CarouselApi) {
  api.value = val
}

watchOnce(api, (api: CarouselApi) => {
  if (!api) return

  totalSlides.value = api.scrollSnapList().length
  currentSlide.value = api.selectedScrollSnap() + 1

  api.on("select", () => {
    currentSlide.value = api.selectedScrollSnap() + 1
  })
})
</script>

<template>
  <div v-if="processedBanners.length > 0">
    <h2 class="header-text-style font-uppercase flex-wrap dark:text-white banner-title">
      {{ localizedTitle }}
    </h2>
    <Carousel
      :opts="{ loop: true }"
      class="group relative w-full main-banner"
      @init-api="setApi"
    >
      <!-- Navigation arrows removed for mobile -->
      <SliderPaginatorComponent
        :current-slide="currentSlide"
        :total-slides="totalSlides"
      />
      <CarouselContent class="carousel-content-mobile">
        <CarouselItem 
          v-for="(banner, index) in processedBanners" 
          :key="banner.id" 
          class="carousel-item-mobile"
        >
          <div class="relative slide-container">
            <img
              :alt="banner.title"
              :src="banner.image"
              class="w-full slide-image"
            />
            <!-- Show character image only for first slide if it exists -->
            <img
              v-if="index === 0 && banner.character"
              alt="slide character"
              :src="banner.character"
              class="absolute bottom-0 right-0 character-image"
            />
          
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </div>
</template>

