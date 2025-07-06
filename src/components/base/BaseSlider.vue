<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { ref } from "vue"

const props = defineProps<{
  title?: string
}>()

const containerRef = ref<HTMLElement>()

function scrollByAmount(amount: number) {
  containerRef.value.scrollBy({
    left: amount,
    behavior: "smooth",
  })
}
</script>

<template>
  <div class="flex flex-col items-start gap-5 w-full">
    <div class="flex items-center justify-between w-full">
      <h1 class="font-uppercase font-extrabold dark:text-white text-xl">
        {{ title }}
      </h1>
      <div v-if="containerRef?.offsetWidth" class="flex items-center gap-5">
        <BaseButton
          :height="44"
          :width="44"
          class="bg-customGrey dark:bg-customDarkGrey hover:bg-customRed dark:hover:bg-customRed group"
          @click="scrollByAmount(-containerRef?.offsetWidth || 0)"
        >
          <BaseIcon
            :size="20"
            class="group-hover:text-white dark:text-white"
            name="chevron_left"
          />
        </BaseButton>
        <BaseButton
          :height="44"
          :width="44"
          class="bg-customGrey dark:bg-customDarkGrey hover:bg-customRed dark:hover:bg-customRed group"
          @click="scrollByAmount(containerRef?.offsetWidth || 0)"
        >
          <BaseIcon
            :size="20"
            class="group-hover:text-white dark:text-white"
            name="chevron_right"
          />
        </BaseButton>
      </div>
    </div>
    <div class="relative w-full">
      <div
        ref="containerRef"
        class="flex overflow-x-hidden scroll-smooth"
        style="scroll-snap-type: x mandatory"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
