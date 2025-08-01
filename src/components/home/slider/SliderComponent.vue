<script lang="ts" setup>
import { watchOnce } from "@vueuse/core"
import SliderPaginatorComponent from "@/components/home/slider/SliderPaginatorComponent.vue"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { ref } from "vue"

const images = [
  {
    alt: "slide 2",
    src: new URL("@/assets/img/slider/slide2.png", import.meta.url).href,
  },
  {
    alt: "slide 3",
    src: new URL("@/assets/img/slider/slide3.png", import.meta.url).href,
  },
]

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
      აღმოაჩინე შენი შემდეგი თავგადასავალი MOMTABARE-სთან ერთად.
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
        <CarouselItem class="carousel-item-mobile">
          <div class="relative slide-container">
            <img
              alt="slide 1"
              class="w-full slide-image"
              src="../../../assets/img/slider/slide1/slide1.png"
            />
            <img
              alt="slide character"
              class="absolute bottom-0 right-0 character-image"
              src="../../../assets/img/slider/slide1/Character.png"
            />
          </div>
        </CarouselItem>
        <CarouselItem v-for="(image, index) in images" :key="index" class="carousel-item-mobile">
          <div class="slide-container">
            <img :alt="image.alt" :src="image.src" class="w-full slide-image" />
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </div>
</template>

