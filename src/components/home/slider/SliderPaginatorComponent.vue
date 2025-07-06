<script lang="ts" setup>
const props = defineProps<{
  totalSlides: number;
  currentSlide: number;
}>();
</script>

<template>
  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
    <div
      v-for="i in props.totalSlides"
      :key="i"
      :class="{ 'border border-customRed': i === props.currentSlide }"
      class="rounded-full p-1 grid place-items-center"
    >
      <div
        :class="{
          'bg-customRed': i === props.currentSlide,
          'bg-white': i !== props.currentSlide,
        }"
        class="w-2 h-2 rounded-full"
      />
    </div>
  </div>
</template>
