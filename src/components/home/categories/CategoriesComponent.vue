<script lang="ts" setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';

// Import Swiper core and required modules
import SwiperCore from 'swiper';
import { Navigation } from 'swiper/modules';

// Install Swiper modules
SwiperCore.use([Navigation]);
import CategoryItem from '@/components/home/categories/CategoryItem.vue'
import type { ICategoryDisplay } from '@/ts/models/category.types'
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/pinia/app.pinia'
import { getBackendCategories, processCategories } from '@/services/categories'
import { ELanguages } from '@/ts/pinia/app.types'
import { getAssetUrl } from '@/utils/config/env'
import tentImg from '@/assets/img/tent.png'
import Bicycle from '@/assets/img/Bicycle.png'
import fishing from '@/assets/img/fishing.png'
import Mountain from '@/assets/img/mountain.png'
import boat from '@/assets/img/boat.png'
import urban from '@/assets/img/urban.png'
import leftArrow from '@/assets/svg/arrowleft.svg'
import rightArrow from '@/assets/svg/arrowright.svg'

const appStore = useAppStore()

// Backend categories
const categories = ref<ICategoryDisplay[]>([])
// Fallback images for categories
const fallbackImages = [tentImg, Bicycle, fishing, Mountain, boat, urban]

// Function to fetch categories
async function fetchCategories() {
  const currentLocale = appStore.language === ELanguages.KA ? 'ka' : 'en'
  try {
    // Get all categories (flat list) instead of hierarchical tree
    const backendCategories = await getBackendCategories(currentLocale)
    const processedCategories = processCategories(backendCategories, currentLocale)
    
    if (processedCategories.length > 0) {
      // Map all categories to display format with fallback images
      categories.value = processedCategories.map((category, index) => {
        return {
          ...category,
          // Use backend icon if available, otherwise fallback image
          image: category.icon 
            ? getAssetUrl(`storage/${category.icon}`)
            : fallbackImages[index % fallbackImages.length]
        }
      })
      console.log('Home categories loaded (all categories) for locale:', currentLocale, processedCategories.length)
    } else {
      console.log('No backend categories found, component will show empty state')
      categories.value = []
    }
  } catch (error) {
    console.error('Error fetching home categories:', error)
    categories.value = []
  }
}

onMounted(async () => {
  await fetchCategories()
})

// Watch for language changes and re-fetch categories
watch(
  () => appStore.language,
  async () => {
    console.log('Language changed, re-fetching home categories...')
    await fetchCategories()
  }
)
</script>

<template>
  <div class="flex flex-col gap-4 category-section container">
    <div class="flex items-center justify-between">
      <h2 class="font-uppercase text-3xl font-extrabold text-black dark:text-white category-title">
        {{$t('categories')}}
      </h2>
      <div class="flex items-center gap-2">
        <button class="swiper-button-prev-custom w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
          <img :src="leftArrow" alt="Previous" class="w-4 h-4" />
        </button>
        <button class="swiper-button-next-custom w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
          <img :src="rightArrow" alt="Next" class="w-4 h-4" />
        </button>
      </div>
    </div>
    <Swiper
      :modules="[Navigation]"
      :slides-per-view="'auto'"
      :space-between="40"
      :loop="true"
      :loop-additional-slides="4"
      :loop-fill-group-with-blank="false"
      :speed="500"
      :navigation="{
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom',
        disabledClass: 'swiper-button-disabled'
      }"
      :breakpoints="{
        320: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        640: {
          slidesPerView: 3,
          spaceBetween: 30
        },
        1024: {
          slidesPerView: 6,
          spaceBetween: 40
        }
      }"
      class="category-swiper"
    >
      <SwiperSlide
        v-for="category in categories"
        :key="category.id"
        style="width: auto;"
      >
        <CategoryItem :category="category" class="category-card" />
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
.category-swiper {
  width: 100%;
  padding: 10px 0;
}

.swiper-button-prev-custom,
.swiper-button-next-custom {
  position: relative;
  margin: 0 5px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  outline: none;
}

.swiper-button-prev-custom:hover,
.swiper-button-next-custom:hover {
  background: #e5e7eb;
}

.swiper-button-disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.swiper-button-prev-custom img,
.swiper-button-next-custom img {
  width: 16px;
  height: 16px;
}
</style>
