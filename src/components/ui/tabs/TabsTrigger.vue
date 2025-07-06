<script lang="ts" setup>
import { cn } from "@/lib/utils"
import { type HTMLAttributes, computed } from "vue"
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from "radix-vue"

const props = defineProps<
  TabsTriggerProps & { class?: HTMLAttributes["class"] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TabsTrigger
    :class="
      cn(
        'inline-flex dark:text-white items-center justify-center whitespace-nowrap rounded-sm py-1.5 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&[data-state=active]>div]:visible data-[state=active]:text-customRed dark:data-[state=active]:text-customRed',
        props.class,
      )
    "
    v-bind="forwardedProps"
  >
    <div class="bg-customRed w-1 h-8 rounded-r-2xl invisible"></div>
    <span class="flex items-center gap-5 text-inherit px-5">
      <slot />
    </span>
  </TabsTrigger>
</template>
