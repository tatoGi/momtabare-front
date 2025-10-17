<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"

const props = defineProps<{
  views: number
  mobileMode?: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <BaseIcon
      :size="mobileMode ? 14 : 16"
      class="transition-all text-customBlack/70 dark:text-white/70"
      name="visibility"
      rounded
    />
    <p :class="mobileMode ? 'text-[10px]' : 'text-xs'" class="font-medium text-customBlack/70 dark:text-white/70 pb-1">
      {{ views }}
    </p>
  </div>
</template>

<style scoped></style>
