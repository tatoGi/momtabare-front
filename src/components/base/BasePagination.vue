<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { computed } from "vue"

const currentPage = defineModel<number>({ default: 1 })
const props = defineProps<{
  totalPages: number | null
}>()

const computedPagesToDisplay = computed(() => {
  if (!props.totalPages) return []

  const totalPages = props.totalPages
  const currentPageNumber = currentPage.value
  const maxPagesToShow = 6
  const pages: number[] = []

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPageNumber <= 3) {
      pages.push(1, 2, 3, 4, 5)
    } else if (currentPageNumber >= totalPages - 2) {
      pages.push(
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      )
    } else {
      pages.push(
        currentPageNumber - 2,
        currentPageNumber - 1,
        currentPageNumber,
        currentPageNumber + 1,
        currentPageNumber + 2,
      )
    }
  }

  return pages
})

function goToPage(pageNumber: number): void {
  currentPage.value = pageNumber
}

function previousPage(): void {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

function nextPage(): void {
  if (!props.totalPages) return
  if (currentPage.value < props.totalPages) {
    currentPage.value += 1
  }
}

function getButtonStyles(pageNumber: number) {
  return {
    "bg-customRed dark:bg-customRed": pageNumber === currentPage.value,
    "bg-customGrey dark:bg-customDarkGrey": pageNumber !== currentPage.value,
  }
}

function getButtonTextStyles(pageNumber: number) {
  return {
    "text-white dark:text-customBlack": pageNumber === currentPage.value,
    "text-customBlack/60 dark:text-white/60": pageNumber !== currentPage.value,
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <BaseButton
      :height="44"
      :width="44"
      class="bg-customGrey dark:bg-customDarkGrey hover:bg-customRed dark:hover:bg-customRed group"
      @click="previousPage"
    >
      <BaseIcon
        :class="{
          'text-customBlack/40 dark:text-white/40': currentPage === 1,
          'text-customBlack dark:text-white': currentPage > 1,
        }"
        :size="20"
        class="group-hover:text-white"
        name="chevron_left"
      />
    </BaseButton>
    <BaseButton
      v-for="number in computedPagesToDisplay"
      :key="number"
      :class="getButtonStyles(number)"
      :height="44"
      :width="44"
      class="hover:bg-customRed dark:hover:bg-customRed group"
      @click="goToPage(number)"
    >
      <p :class="getButtonTextStyles(number)" class="group-hover:text-white">
        {{ number }}
      </p>
    </BaseButton>
    <BaseButton
      :height="44"
      :width="44"
      class="bg-customGrey dark:bg-customDarkGrey hover:bg-customRed dark:hover:bg-customRed group"
      @click="nextPage"
    >
      <BaseIcon
        :class="{
          'text-customBlack/40 dark:text-white/40':
            props.totalPages === currentPage,
          'text-customBlack dark:text-white': props.totalPages !== currentPage,
        }"
        :size="20"
        class="group-hover:text-white"
        name="chevron_right"
      />
    </BaseButton>
  </div>
</template>

<style scoped></style>
