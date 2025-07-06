<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"

const props = defineProps<{
  title: string
  goBack?: boolean
}>()

const emits = defineEmits<{
  (event: "goBack"): void
}>()

function emitGoBack(): void {
  emits("goBack")
}
</script>

<template>
  <div
    class="border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col gap-3"
  >
    <div v-if="title" class="flex gap-1 items-center">
      <BaseIcon
        v-if="props.goBack"
        :size="26"
        class="text-customBlack/70 dark:text-white hover:text-customRed dark:hover:text-customRed cursor-pointer"
        name="chevron_left"
        @click="emitGoBack"
      />

      <h3
        class="text-sm font-uppercase font-bold text-customBlack dark:text-white"
      >
        {{ props.title }}
      </h3>
    </div>

    <slot />
  </div>
</template>
