<script lang="ts" setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import CategoryItem from '@/components/home/categories/CategoryItem.vue';
import type { ICategory } from '../../../ts/models/category.types';
import { ref } from 'vue'
import tentImg from '@/assets/img/tent.png'
import Bicycle from '@/assets/img/Bicycle.png'
import fishing from '@/assets/img/fishing.png'
import Mountain from '@/assets/img/mountain.png';
import boat from '@/assets/img/boat.png'
import urban from '@/assets/img/urban.png'
import leftArrow from '@/assets/svg/arrowleft.svg'
import rightArrow from '@/assets/svg/arrowright.svg'

// Create a local array of 8 mock categories
const categories = ref<ICategory[]>([
  {
    id: 1,
    name: { en: 'Category 1', ka: 'ლაშქრობა' },
    slug: 'category-1',
    icon: 'equipment',
    image: tentImg,
    parent: null,
    children: []
  },
  {
    id: 3,
    name: { en: 'Category 3', ka: 'ველოსპორტი' },
    slug: 'category-3',
    icon: 'equipment',
    image: Bicycle,
    parent: null,
    children: []
  },
  {
    id: 4,
    name: { en: 'Category 4', ka: 'თევზაობა' },
    slug: 'category-4',
    icon: 'equipment',
    image: fishing,
    parent: null,
    children: []
  },
  {
    id: 5,
    name: { en: 'Category 5', ka: 'თხილამურები & სნოუბორდი' },
    slug: 'category-5',
    icon: 'equipment',
    image: Mountain,
    parent: null,
    children: []
  },
  {
    id: 6,
    name: { en: 'Category 6', ka: 'სანაოსნო სპორტი' },
    slug: 'category-6',
    icon: 'equipment',
    image: boat,
    parent: null,
    children: []
  },
  {
    id: 7,
    name: { en: 'Category 7', ka: 'ურბანული სპორტი' },
    slug: 'category-7',
    icon: 'equipment',
    image: urban,
    parent: null,
    children: []
  },
])
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
        <button class="swiper-button-next-custom w-8 h-8 flex items-center justify-center rounded-full  hover:bg-gray-200 transition-colors">
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
  background: #f3f4f6;
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
