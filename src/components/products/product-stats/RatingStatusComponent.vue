<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import { computed, watch } from "vue"

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

// Debug: Log when rating changes
watch(() => props.rating, (newRating: number | null) => {
  console.log('⭐ RatingStatusComponent - Rating updated:', newRating)
})

// Helper function to determine if a star should be filled
const isStarFilled = (index: number): boolean => {
  return index <= Math.floor(computedRating.value)
}

// Helper function to determine if a star should be partially filled
const isStarPartiallyFilled = (index: number): boolean => {
  const rating = computedRating.value
  return index === Math.ceil(rating) && rating % 1 !== 0
}

// Get fill percentage for partial stars
const getStarFillPercentage = (index: number): number => {
  if (!isStarPartiallyFilled(index)) return 0
  return (computedRating.value % 1) * 100
}
</script>

<template>
  <div class="flex items-center gap-1">
    <div
      v-for="index in 5"
      :key="index"
      class="relative"
    >
      <!-- Full or empty star -->
      <BaseIcon
        :fill="isStarFilled(index)"
        :size="24"
        class="transition-all text-customRed"
        name="star"
        rounded
      />
      <!-- Partial star overlay (if needed) -->
      <div
        v-if="isStarPartiallyFilled(index)"
        class="absolute inset-0 overflow-hidden"
        :style="{ width: getStarFillPercentage(index) + '%' }"
      >
        <BaseIcon
          :fill="true"
          :size="24"
          class="transition-all text-customRed"
          name="star"
          rounded
        />
      </div>
    </div>
    <p
      v-if="props.ratingsAmount"
      class="text-xs font-medium text-customBlack/70 dark:text-white/70"
    >
      {{ `(${computedRatingAmount})` }}
    </p>
  </div>
</template>

<style scoped></style>
