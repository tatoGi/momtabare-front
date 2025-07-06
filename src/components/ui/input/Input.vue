<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { useVModel } from "@vueuse/core"
import type { HTMLAttributes } from "vue"

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"]
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <input
    v-model="modelValue"
    :class="
      cn(
        'flex h-[52px] w-full rounded-xl border border-customBlack/10 dark:border-white/10 dark:text-white bg-white dark:bg-customBlack px-5 py-2 text-sm placeholder-customBlack/70 dark:placeholder-white/70 ring-offset-background focus:border-customRed file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
