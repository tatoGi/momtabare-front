<script setup lang="ts">
import { ref, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import Swiper core and required modules
import SwiperCore from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

// Install Swiper modules
SwiperCore.use([Navigation, Pagination]);

// Import components and assets
import BlogItem from "@/components/blog/BlogItem.vue";
// import BaseButton from "../base/BaseButton.vue";
import blogImage from '@/assets/img/blogItem.png';
import { getAssetUrl } from '@/utils/config/env';

// Props
const props = defineProps({
  routeToName: {
    type: String,
    default: ''
  },
  routeToPath: {
    type: String,
    default: ''
  },
  blogPosts: {
    type: Array,
    default: () => []
  }
});
// Use dynamic blog posts from props, fallback to static data
// Normalize backend image URLs to absolute URLs
function toImageUrl(img?: string): string {
  if (!img) return blogImage as unknown as string
  // If already absolute, return as-is
  if (/^https?:\/\//i.test(img)) return img
  // Ensure path starts with 'storage/'
  const path = img.startsWith('storage/') ? img : `storage/${img}`
  return getAssetUrl(path)
}

const displayBlogPosts = computed(() => {
  if (props.blogPosts && props.blogPosts.length > 0) {
    return props.blogPosts.map((post: any) => ({
      
     
      id: post.id,
      title: post.title,
      date: post.date,
      image: toImageUrl(post.image),
      slug: post.slug,
      content: post.content,
      author: post.author
    }))
  }
  return []
})

const modules = [Navigation, Pagination];

const swiperOptions = ref({
  modules,
  slidesPerView: 1.2,
  spaceBetween: 16,
  breakpoints: {
    640: {
      slidesPerView: 2.2,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 24,
    },
  },
});
</script>

<template>
  <div class="flex items-start flex-col gap-4 blog-list-container">
    <div class="flex items-center justify-between w-full px-4 md:px-0">
      <h2 class="text-3xl font-extrabold font-uppercase dark:text-white">
        ბლოგი
      </h2>
      <RouterLink 
          :to="routeToPath || '/blog'"
          class="text-customRed text-sm font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
      >
        {{ $t('allBlog') }}
      </RouterLink>
    </div>
    
    <!-- Mobile Slider -->
    <div class="w-full md:hidden">
      <Swiper
        :modules="modules"
        :slides-per-view="swiperOptions.slidesPerView"
        :space-between="swiperOptions.spaceBetween"
        :pagination="swiperOptions.pagination"
        :breakpoints="swiperOptions.breakpoints"
        :navigation="false"
        class="blog-swiper"
      >
        <SwiperSlide v-for="post in displayBlogPosts" :key="post.id || post.title">
          <BlogItem :post="post" />
        </SwiperSlide>
      </Swiper>
    </div>
    
    <!-- Desktop Grid -->
    <div class="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      <BlogItem 
        v-for="post in displayBlogPosts" 
        :key="post.id || post.title"
        :post="post"
      />
    </div>

  </div>
</template>

<style scoped>
/* Custom styles for the swiper pagination */
:deep(.swiper-pagination-bullet) {
  background: #D9D9D9;
  opacity: 1;
  width: 8px;
  height: 8px;
  margin: 0 4px !important;
}

:deep(.swiper-pagination-bullet-active) {
  background: #E31E24;
  width: 24px;
  border-radius: 4px;
}

:deep(.blog-swiper) {
  padding: 0 16px 32px;
  width: 100%;
}

:deep(.swiper-slide) {
  height: auto;
}

/* Add some padding to the container on mobile */
.blog-list-container {
  padding-bottom: 24px;
}

@media (min-width: 768px) {
  .blog-list-container {
    padding-bottom: 0;
  }
}
</style>
