<script setup>
import BlogItem from "@/components/blog/BlogItem.vue"
import BaseButton from "../base/BaseButton.vue"
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
      <BlogItem v-for="index in 4" :key="index"></BlogItem>
    </div>
  </div>
</template>
