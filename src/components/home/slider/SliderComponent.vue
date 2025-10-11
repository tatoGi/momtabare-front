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
import { ENV } from '@/utils/config/env'

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
  return currentLocale.value
   
})

// Define banner display type
interface BannerDisplay {
  id: string | number
  title: string
  desc: string
  image: string
  character?: string
}

// Process banners for display
const processedBanners = computed((): BannerDisplay[] => {
  // Process backend banners - create slides from banner images
  const slides: BannerDisplay[] = []
  
  props.banners?.forEach((banner: IBanner) => {
    // Process images for display
    if (banner.images?.length) {
      banner.images.forEach((bannerImage, index) => {
        // Ensure we have a proper URL by checking if it already has http/https
        let imageUrl = bannerImage.image_name;
        if (!imageUrl.startsWith('http')) {
          // If it's a relative path, prepend the backend URL
          imageUrl = `${ENV.BACKEND_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
        console.log('slider image url', imageUrl);
        const currentTranslation = getBannerTranslation(banner, currentLocale.value)
       
        slides.push({
          id: `${banner.id}-${index}`,
          title: currentTranslation.title,
          desc: currentTranslation.desc,
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

watchOnce(api, (api: CarouselApi | undefined) => {
  if (!api) return

  totalSlides.value = api.scrollSnapList().length
  currentSlide.value = api.selectedScrollSnap() + 1

  api.on("select", () => {
    currentSlide.value = api.selectedScrollSnap() + 1
  })
})
</script>

<template>
  <div>
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

