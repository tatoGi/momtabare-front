<script lang="ts" setup>
import { cn } from "@/lib/utils"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { type HTMLAttributes, computed } from "vue"
import {
  SelectTrigger,
  type SelectTriggerProps,
  useForwardProps,
} from "radix-vue"

const props = defineProps<
  SelectTriggerProps & { class?: HTMLAttributes["class"] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectTrigger
    :class="
      cn(
        'flex h-[52px] w-full items-center justify-between rounded-xl border border-customBlack/10 bg-background px-5 py-2 text-start text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-customBlack [&>span]:truncate [&[data-state=open]>i]:rotate-180',
        props.class,
      )
    "
    v-bind="forwardedProps"
  >
    <slot />
    <slot name="icon">
      <BaseIcon
        :size="24"
        :weight="300"
        class="shrink-0 text-customBlack/40 transition-transform duration-200 dark:text-white/40"
        name="keyboard_arrow_down"
        rounded
      />
    </slot>
  </SelectTrigger>
</template>
