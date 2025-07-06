<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { type HTMLAttributes, computed } from "vue"
import {
  PinInputInput,
  type PinInputInputProps,
  useForwardProps,
} from "radix-vue"

const props = defineProps<
  PinInputInputProps & { class?: HTMLAttributes["class"] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <PinInputInput
    :class="
      cn(
        'text-center text-sm font-bold dark:bg-customBlack dark:text-white border border-customBlack/10 dark:border-white/10 rounded-2xl transition-all focus:border-customRed focus:z-10 flex h-12 w-[89px] items-center justify-center',
        props.class,
      )
    "
    v-bind="forwardedProps"
  />
</template>
