<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import {computed} from "vue"

const props = defineProps<{
  options: string[]
}>()

const isOpen = defineModel<boolean>("isOpen", {default: false})
const selected = defineModel<string | null>({default: null})

function toggleDropdown(): void {
  isOpen.value = !isOpen.value
}

function selectOption(option: string): void {
  selected.value = option
  isOpen.value = false
}

const dropdownClasses = computed(() => (isOpen.value ? "block" : "hidden"))
</script>

<template>
  <div class="relative text-left">
    <div @click="toggleDropdown">
      <slot name="trigger">
        <button
            class="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
            type="button"
        >
          {{ selected || "Select an option" }}
        </button>
      </slot>
    </div>

    <div
        :class="dropdownClasses"
        class="absolute right-0 z-10 mt-2 min-w-60 origin-top-right bg-white dark:bg-customBlack shadow-dark rounded-xl p-6 flex flex-col gap-4"
    >
      <div
          v-for="(option, index) in props.options"
          :key="index"
          class="flex items-center justify-between cursor-pointer group"
          @click="selectOption(option)"
      >
        <p
            :class="{ 'text-customRed dark:text-customRed': option === selected }"
            class="text-customBlack/70 dark:text-white/70 text-sm group-hover:text-customRed"
        >
          {{ option }}
        </p>
        <BaseIcon
            v-if="option === selected"
            :size="20"
            class="text-customRed"
            name="check_circle"
        />
      </div>
    </div>
  </div>
</template>
