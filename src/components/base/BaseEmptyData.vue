<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"

defineProps<{
  title: string
  description: string
  buttonText: string
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-10">
    <div class="flex flex-col items-center gap-1">
      <h2 class="font-uppercase text-xl font-extrabold">{{ title }}</h2>
      <p class="text-sm">{{ description }}</p>
    </div>

    <BaseButton :height="48" :width="218" class="border border-customBlack/10">
      <p class="font-uppercase text-sm font-bold text-customBlack/70">
        {{ buttonText }}
      </p>
    </BaseButton>
  </div>
</template>
