<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"

const props = defineProps<{
  location: string
}>()
</script>

<template>
  <div class="flex items-center gap-1">
    <BaseIcon
      :size="16"
      class="transition-all text-customRed"
      name="location_on"
      rounded
    />
    <p class="text-customRed text-xs font-semibold">
      {{ location }}
    </p>
  </div>
</template>
