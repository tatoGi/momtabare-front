<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BlogItem',
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  setup() {
    return {};
  },
});
</script>

<template>
  <!-- Mobile Layout -->
  <div class="md:hidden group cursor-pointer flex flex-col items-center">
    <div class="relative overflow-hidden" style="width: 343px; height: 200px; border-radius: 16px; opacity: 1;">
      <img 
        v-if="post && post.image"
        :src="post.image || '/path/to/default-image.jpg'" 
        :alt="post.title || 'სიახლე'" 
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        style="opacity: 1;"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
        <span class="text-gray-500 dark:text-gray-400 text-sm">სურათი ვერ იპოვება</span>
      </div>
    </div>
    
    <!-- Content below image -->
    <div class="mt-3" style="width: 343px;">
      <p v-if="post && post.date" class="text-gray-500 dark:text-gray-400 text-xs font-medium mb-2">
        {{ post.date }}
      </p>
      <h2 v-if="post && post.title" class="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-orange-500 transition-colors">
        {{ post.title }}
      </h2>
      <p v-else class="font-bold text-gray-900 dark:text-white text-base leading-tight">
        სიახლის სათაური ვერ იპოვება
      </p>
    </div>
  </div>

  <!-- Desktop Layout -->
  <div class="hidden md:flex flex-col items-start group cursor-pointer">
    <div class="relative overflow-hidden mb-3 w-full" style="aspect-ratio: 302/242; border-radius: 16px;">
      <div class="relative w-full h-full">
        <img 
          v-if="post && post.image"
          :src="post.image || '/path/to/default-image.jpg'" 
          :alt="post.title || 'სიახლე'" 
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <span class="text-gray-500 dark:text-gray-400">სურათი ვერ იპოვება</span>
        </div>
      </div>
      <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
    </div>
    <p v-if="post && post.date" class="text-gray-500 dark:text-gray-400 text-xs font-medium">
      {{ post.date }}
    </p>
    <h2 v-if="post && post.title" class="font-bold text-gray-900 dark:text-white mt-1 text-base leading-tight group-hover:text-orange-500 transition-colors">
      {{ post.title }}
    </h2>
    <p v-else class="font-bold text-gray-900 dark:text-white mt-1 text-base leading-tight">
      სიახლის სათაური ვერ იპოვება
    </p>
  </div>
</template>
