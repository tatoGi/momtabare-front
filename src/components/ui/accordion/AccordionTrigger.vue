<script lang="ts" setup>
import { cn } from "@/lib/utils"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { type HTMLAttributes, computed } from "vue"
import {
  AccordionHeader,
  AccordionTrigger,
  type AccordionTriggerProps,
} from "radix-vue"

const props = defineProps<
  AccordionTriggerProps & {
    class?: HTMLAttributes["class"]
    iconName?: string
    arrowIcon?: string
  }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      :class="
        cn(
          'flex flex-1 items-center py-4 font-medium transition-all [&[data-state=open]>i]:rotate-180 [&[data-state=open]>i]:text-customRed [&[data-state=open]>div>i]:text-customRed',
          props.class,
        )
      "
      v-bind="delegatedProps"
    >
      <div class="flex items-center gap-3 w-full dark:text-white">
        <BaseIcon
          v-if="iconName"
          :name="<string>iconName"
          :size="24"
          :weight="300"
          class="text-customBlack dark-white-text-hover"
        />
        <slot />
      </div>

      <slot name="icon">
        <BaseIcon
          :name="<string>arrowIcon"
          :size="24"
          :weight="300"
          class="text-customBlack/40 dark:text-white/40 shrink-0 transition-transform duration-200"
          rounded
        />
      </slot>
    </AccordionTrigger>
  </AccordionHeader>
</template>
