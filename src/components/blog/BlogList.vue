<script setup>
import BlogItem from "@/components/blog/BlogItem.vue"
import BaseButton from "../base/BaseButton.vue"
import blogimage from "@/assets/img/blogitem.png"
// Sample blog posts data - replace this with actual data from your API
const blogPosts = [
  {
    title: "სიახლე 1",
    date: "2025-07-15",
    image: blogimage
  },
  {
    title: "სიახლე 2",
    date: "2025-07-14",
    image: blogimage
  },
  {
    title: "სიახლე 3",
    date: "2025-07-13",
    image: blogimage
  },
  {
    title: "სიახლე 4",
    date: "2025-07-12",
    image: blogimage
  }
]
</script>

<template>
  <div class="flex items-start flex-col gap-4">
    <div class="flex items-center justify-between w-full">
      <h2 class="text-3xl font-extrabold font-uppercase dark:text-white">
        ბლოგი
      </h2>
      <BaseButton :height="44" :width="111" class="bg-customRed text-white">
        <p class="text-xs font-extrabold text-white font-uppercase">{{$t('all')}}</p>
      </BaseButton>
    </div>
    <div class="grid grid-cols-4 gap-6">
      <BlogItem 
        v-for="post in blogPosts" 
        :key="post.title"
        :post="post"
      ></BlogItem>
    </div>
  </div>
</template>
