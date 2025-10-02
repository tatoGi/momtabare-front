<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import { onMounted } from "vue"

const props = defineProps<{
  width?: number
  height: number
  icon: string
  title: string
  description: string
  selected?: boolean
  showBadge?: boolean
  badgeCount?: number
}>()

// Debug logging
onMounted(() => {
  if (props.title === 'ჩემი მაღაზია') {

  }
})
</script>

<template>
  <div
      :class="{'border-customRed': selected}"
      :style="`height: ${height}px; width: ${width ? width + 'px' : '100%'};`"
      class="w-[302px] h-[139px] border border-customBlack/10 dark:border-white/10 rounded-2xl p-6 flex flex-col gap-3 cursor-pointer transition-all dark:hover:border-customRed hover:border-customRed group relative"
  >
    <div>
      <BaseIcon
          :class="{'text-customRed': selected}"
          :name="icon"
          :size="24"
          class="transition-all group-hover:text-customRed dark:text-white"
      />
    </div>
    <span 
        v-if="showBadge && badgeCount > 0"
        class="absolute top-3 right-3 min-w-5 h-5 flex items-center justify-center bg-red-500 rounded-full text-white text-xs font-medium px-1.5"
        style="box-shadow: 0 0 0 2px rgba(255, 255, 255, 1)"
    >
      {{  badgeCount }}
    </span>

    <div class="flex flex-col gap-1">
      <h2
          :class="{'text-customRed': selected}"
          class="text-customBlack dark:text-white text-sm font-bold font-uppercase transition-all group-hover:text-customRed"
      >
        {{ title }}
      </h2>
      <p class="text-customBlack/70 dark:text-white/70 text-xs">
        {{ description }}
      </p>
    </div>
  </div>
</template>
