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

// Process banners for display
const processedBanners = computed((): BannerDisplay[] => {
  if (!props.banners || props.banners.length === 0) {
    // Fallback to static images if no banners provided
    return [
      {
        id: 'fallback-1',
        title: 'Slide 1',
        desc: '',
        image: new URL("@/assets/img/slider/slide1/slide1.png", import.meta.url).href,
        character: new URL("@/assets/img/slider/slide1/Character.png", import.meta.url).href
      },
      {
        id: 'fallback-2',
        title: 'Slide 2',
        desc: '',
        image: new URL("@/assets/img/slider/slide2.png", import.meta.url).href
      },
      {
        id: 'fallback-3',
        title: 'Slide 3',
        desc: '',
        image: new URL("@/assets/img/slider/slide3.png", import.meta.url).href
      }
    ]
  }
  
  // Process backend banners - create slides from banner images
  const slides: BannerDisplay[] = []
  
  props.banners.forEach((banner: IBanner) => {
    console.log(banner);
    const translation = getBannerTranslation(banner, currentLocale.value)
    if (banner.images && banner.images.length > 0) {
      // Create a slide for each banner image
      banner.images.forEach((bannerImage, index) => {
        const backendUrl = ENV.BACKEND_URL
        const imageUrl = `${backendUrl}/storage/${bannerImage.image_name}`
        
        slides.push({
          id: `${banner.id}-${index}`,
          title: translation.title,
          desc: translation.desc,
          image: imageUrl
        })
      })
    } else {
      // Fallback to thumb or default image if no banner images
      const backendUrl = ENV.BACKEND_URL
      const imageUrl = banner.thumb 
        ? `${backendUrl}/storage/${banner.thumb}`
        : new URL("@/assets/img/slider/slide1/slide1.png", import.meta.url).href
      
      slides.push({
        id: banner.id,
        title: translation.title,
        desc: translation.desc,
        image: imageUrl
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

watchOnce(api, (api) => {
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

