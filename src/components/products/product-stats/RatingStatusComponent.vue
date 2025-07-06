<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import { computed } from "vue"

const props = defineProps<{
  rating: number | null
  ratingsAmount?: number | null
}>()

const computedRating = computed<number>(() => {
  if (!props.rating) return 0
  return props.rating
})

const computedRatingAmount = computed<number>(() => {
  if (!props.ratingsAmount) return 0
  return props.ratingsAmount
})
</script>

<template>
  <div class="flex items-center gap-1">
    <BaseIcon
      v-for="index in 5"
      :fill="index <= computedRating"
      :size="24"
      class="transition-all text-customRed"
      name="star"
      rounded
    />
    <p
      v-if="props.ratingsAmount"
      class="text-xs font-medium text-customBlack/70"
    >
      {{ `(${computedRatingAmount})` }}
    </p>
  </div>
</template>

<style scoped></style>
